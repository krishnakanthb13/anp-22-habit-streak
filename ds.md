I audited the uploaded **`habit-streak.compiled.js`** end-to-end, focusing on state integrity, streak mathematics, calendar editing, event/history consistency, persistence, date handling, UI/host synchronization, and edge cases.

**Overall verdict: 🟠 Functional, but not yet integrity-safe.**

The UI is fairly polished and defensive in several places, but there are a few **real correctness issues** that I would fix before calling this production-solid. The biggest one is that the configured recurrence interval is effectively **dead data**.

## Priority findings

| Priority | Finding                                                             | Impact                                                            |
| -------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 🔴 P0    | Recurrence interval is stored but never used by streak engine       | Configured weekly/monthly habits behave like daily habits         |
| 🔴 P0    | Failed `saveState()` is frequently ignored                          | UI can report/behave as if data was saved when persistence failed |
| 🔴 P0    | Concurrent load → modify → save operations can overwrite each other | Possible silent data loss                                         |
| 🔴 P1    | Malformed data note is automatically replaced with empty state      | Potential catastrophic data loss                                  |
| 🔴 P1    | `undoToday()` deletes **all** today's history                       | Multiple legitimate sessions/slips can disappear                  |
| 🔴 P1    | Calendar edit can create contradictory/invalid historical states    | Streak/history semantics can become inconsistent                  |
| 🟠 P1    | Streak anchor is not properly maintained after resets/new streaks   | Live hours/minutes/seconds can be wrong                           |
| 🟠 P1    | Date/time model mixes local dates with UTC timestamps               | DST/timezone boundary bugs possible                               |
| 🟠 P1    | Stored UUID is trusted without validation                           | Stale UUID can make data appear to disappear                      |
| 🟠 P2    | Duplicate note-name lookup can attach to wrong note                 | Data written to wrong Amplenote note                              |
| 🟠 P2    | `theme` accepts arbitrary values                                    | Invalid persisted theme can degrade UI                            |
| 🟠 P2    | ID generation has theoretical collision risk                        | Low probability, but avoidable                                    |
| 🟡 P2    | History events and calendar state are two separate sources of truth | Drift between them is likely over time                            |
| 🟡 P2    | Weekly frequency logic doesn't represent actual habit semantics     | Analytics can be misleading                                       |
| 🟡 P3    | Global keyboard handlers may interfere with host/browser behavior   | UX edge cases                                                     |
| 🟡 P3    | `innerHTML` architecture makes future injection mistakes easy       | Maintainability/security risk                                     |

---

# 1. 🔴 Recurrence interval is effectively broken

This is the most important functional issue.

The create/edit UI allows:

* Every `N`
* Day(s)
* Week(s)
* Month(s)

and the data stores:

```js
interval: {
  n: periodN,
  period: periodUnit
}
```

But the streak engine never uses `habit.interval`.

The only meaningful interval references are essentially configuration/editing; there is no recurrence calculation in `getHabitDayStatus()` or `calculateHabitStats()`.

The engine simply evaluates **every calendar day** from `createdAt` through today. 

So:

> "Every 1 week"

currently behaves like:

> "Every day"

And:

> "Every 2 months"

also behaves like:

> "Every day"

That is a genuine semantic integrity bug, not merely an unused feature.

### Recommended fix

Create one canonical function:

```js
function isScheduledDate(habit, dateStr) {
  // derive whether this date is an expected tracking day
}
```

Then make the engine understand:

```text
daily:
  every N days

weekly:
  every N weeks

monthly:
  every N months
```

And distinguish:

* **scheduled**
* **completed**
* **missed**
* **not applicable**

rather than treating every calendar date as tracked.

This should be done before adding more analytics.

---

# 2. 🔴 Persistence failure is not propagated

`saveState()` returns `false` when persistence fails:

```js
catch (err) {
  console.error(...);
  return false;
}
```

but callers generally do:

```js
await saveState(app, state);
await app.context.renderEmbed();
```

without checking the result. 

For example, the calendar save path modifies state and then calls `saveState()`, but doesn't verify success. 

### Why this matters

Suppose:

1. User marks 15 days.
2. State is modified.
3. Amplenote write fails.
4. UI refreshes.
5. User sees the new state temporarily.
6. Next reload → old data returns.

That's a classic **false-success state**.

### Better contract

Make persistence explicit:

```js
const saved = await saveState(app, state);

if (!saved) {
  await app.alert("Changes could not be saved. Your data was not updated.");
  return;
}
```

Even better, change `saveState()` to throw and force callers to handle failure.

---

# 3. 🔴 Whole-state read/modify/write creates lost-update risk

Almost every mutation follows:

```text
loadState()
   ↓
modify state
   ↓
saveState()
```

Examples include completion, skip, calendar edits, delete, theme changes, etc.  

Imagine two operations execute close together:

```text
A: load state S
B: load state S

A: add completion
B: add skip

A: save S+A
B: save S+B
```

Final state:

```text
S+B
```

The completion from A disappears.

This becomes more realistic because the app performs async prompts, host calls, note reads and writes.

### Recommended architecture

Add a serialized mutation queue:

```js
let mutationQueue = Promise.resolve();

function mutateState(app, mutator) {
  mutationQueue = mutationQueue.then(async () => {
    const state = await loadState(app);
    await mutator(state);
    await saveStateOrThrow(app, state);
  });

  return mutationQueue;
}
```

Then all writes go through one pipeline.

For stronger integrity, also introduce a state revision:

```js
{
  version: 2,
  revision: 184,
  ...
}
```

---

# 4. 🔴 Malformed JSON can destroy recoverable data

This is particularly concerning.

If parsing fails:

```js
const fallbackState = { ...DEFAULT_STATE };
await app.replaceNoteContent({ uuid: dataNoteUUID }, markdown);
return fallbackState;
```

So a malformed/corrupted data note is immediately replaced with:

```js
{
  version: 1,
  activeHabitId: null,
  habits: []
}
```



That means a transient/corrupt read can turn into **permanent loss of all habits**.

### Example

The note contains:

```json
{
  "habits": [
    ...
  ]
```

because of an interrupted write.

Plugin loads it → parse fails → plugin writes empty state.

The original data is now gone.

### This should be P0/P1

Never overwrite malformed persistent data automatically.

Instead:

```text
read failed
   ↓
try backup
   ↓
try previous revision
   ↓
if unavailable:
    show recovery warning
    DO NOT overwrite
```

At minimum:

```js
if (!parsed) {
  console.error("Invalid persisted state; refusing to overwrite.");
  return null;
}
```

---

# 5. 🔴 `undoToday()` is destructive to today's history

The UI allows multiple events:

> "Log Additional Slip (+1)"

and:

> "+ Log Additional Done (+1)"

The code explicitly supports multiple events on a day. 

But `handleUndoToday()` removes **all** today's events:

```js
habit.events = habit.events.filter(...)
```

and all today's reset logs:

```js
habit.resetLogs = habit.resetLogs.filter(
  rl => rl.date !== todayStr
);
```



So:

```text
09:00 Done
12:00 Done
15:00 Done
```

then:

> Undo

can remove all three.

Likewise:

```text
Slip #1
Slip #2
Slip #3
```

can all disappear.

### Better design

Have separate operations:

```text
Undo latest event
Undo today's status
Clear today's events
```

If "Undo" is intended to mean status correction, don't destroy the audit trail.

---

# 6. 🔴 Calendar editing can violate the historical model

Calendar edit mode directly replaces:

```js
habit.skips = [...]
habit.completions = [...]
```

without generating corresponding events/history. 

So you can have:

```text
Calendar:
Jan 10 = completed
```

while:

```text
events:
(no record for Jan 10)
```

The application therefore has two histories:

### State history

```text
completions / skips
```

### Audit history

```text
events / resetLogs
```

They can disagree.

This is especially problematic because the UI later builds the "Activity & Timestamped History" from `events` and `resetLogs`, not from the calendar state. 

### Recommendation

Decide which is authoritative.

I strongly recommend:

```text
events = immutable-ish audit log
calendar state = derived
```

or, if calendar arrays remain authoritative:

```text
events = explicit user actions only
calendar edits = separate audit event
```

For example:

```js
{
  type: "calendar_edit",
  date: "...",
  changes: [...]
}
```

---

# 7. 🟠 Streak anchor logic is fragile

This is a subtle but important issue.

The engine determines the current streak by consecutive calendar days, then does:

```js
if (habit.streakAnchor &&
    habit.streakAnchor.startsWith(streakStartDate)) {
    ...
} else {
    streakAnchorTimestamp =
      new Date(`${streakStartDate}T00:00:00`).getTime();
}
```



That means if the actual streak began at:

```text
2026-08-18 21:37
```

but the stored anchor isn't aligned with the calculated `streakStartDate`, the ticker falls back to:

```text
2026-08-18 00:00
```

So the live timer can be off by many hours.

More importantly, resets don't establish a new precise streak anchor.

`handleSkipToday()` logs the reset but does not set a new future anchor. 

### Recommended model

Store:

```js
streakStartedAt
```

as the authoritative timestamp whenever a new streak starts.

For example:

```js
{
  streakStartedAt: "2026-08-19T15:32:14.123Z"
}
```

Then the calendar engine calculates **days**, while the ticker calculates elapsed time from that timestamp.

Don't try to reconstruct a timestamp from a date later.

---

# 8. 🟠 Date/time handling mixes two concepts

You use:

```js
getTodayString()
```

based on local time, but habit creation stores:

```js
createdAt: `${getTodayString()}T00:00:00Z`
```

That's UTC.

You then generally compare only:

```js
createdAt.split("T")[0]
```

which happens to hide the timezone problem.

But actual timestamps are also used for the live ticker and history.

This creates a mixed model:

```text
calendar date → local timezone
timestamp → UTC
ticker → elapsed UTC timestamp
```

That can become problematic around:

* midnight
* DST changes
* timezone changes
* travel
* imported historical data

### Better rule

Use two explicit concepts:

```js
localDate: "2026-08-19"
```

for habit calendar semantics.

```js
timestamp: "2026-08-19T10:05:33.123Z"
```

for actual event time.

Never derive one from the other implicitly.

---

# 9. 🟠 Stale stored note UUID can make data "disappear"

`getNoteUUID()` trusts an existing non-local UUID immediately:

```js
if (existingUUID) {
  ...
  } else {
    return existingUUID;
  }
}
```

The local UUID path attempts verification, but the ordinary UUID path doesn't. 

If the note was:

* deleted,
* recreated,
* moved,
* changed externally,

the plugin can keep trying to use a dead UUID.

Then `loadState()` catches the failure and returns an empty default state. 

Combined with the persistence issue above, this is potentially dangerous.

### Fix

Validate the UUID:

```js
const note = await app.findNote({ uuid });

if (note) return uuid;

// clear stale setting
// search by exact name + tag
// recover/rebind
```

---

# 10. 🟠 Note lookup can bind to the wrong note

The fallback search:

```js
const match = allNotes.find((n) => n.name === noteName);
```

only checks the name. 

Earlier, the local UUID recovery checks:

```text
name + tags
```

which is safer.

But the ordinary fallback doesn't.

If another note is also called:

```text
habit_streak_data
```

the plugin could attach to it.

### Fix

Always require:

```text
exact name
AND
expected tag
```

Prefer UUID > exact name+tag > create.

---

# 11. 🟠 Weekly frequency isn't really "habit frequency"

The chart counts events:

```js
if (ev.date === dateStr) count++;
```

then falls back to completion/skip arrays. 

For a Quitly habit, a slip creates a count.

So the chart can effectively say:

```text
Wednesday: 3
```

because there were 3 slips.

That's not necessarily "frequency of the habit"; it's **number of logged events**.

Likewise for positive habits, multiple sessions can create:

```text
Wednesday: 5
```

while the streak still treats that as only one completed day.

So:

```text
frequency chart = event count
streak = day count
```

These are different metrics, but the UI doesn't clearly distinguish them.

### Recommendation

Label it:

> 7-Day Activity

and separately expose:

> Completed days: 5
> Sessions: 12

---

# 12. 🟠 The configured interval currently creates misleading UI

Because interval isn't used, this UI:

> "Every (Number)"

creates an expectation that recurrence matters.

But the streak calculation is still day-by-day.

That makes the data model misleading even if users never notice the internal issue.

I would either:

**Option A — implement recurrence properly**, preferably.

or temporarily:

**Option B — remove interval configuration** until recurrence semantics are implemented.

Don't keep a configuration field that silently does nothing.

---

# 13. 🟡 `createdAt` is being mutated indirectly

Calendar editing does:

```js
if (earliest < currentStart) {
    habit.createdAt = earliest + "T00:00:00Z";
    habit.streakAnchor = earliest + "T00:00:00Z";
}
```



This means:

> original creation date

and:

> earliest tracked historical date

are conflated.

Those are different pieces of information.

### Better

Keep:

```js
createdAt
trackingStartDate
```

separate.

For example:

```js
createdAt: "2026-08-19T15:00:00Z",
trackingStartDate: "2026-07-01"
```

That preserves history.

---

# 14. 🟡 Theme persistence has two sources of truth

Theme is stored in:

```text
localStorage
```

and also:

```text
state.theme
```

`applyTheme()` writes localStorage and calls the host, which writes state. 

On load, localStorage wins:

```js
if (saved) activeTheme = saved;
```

So the persistent model is:

```text
Amplenote note theme
        +
browser localStorage theme
        ↓
localStorage wins
```

That can make behavior confusing across devices.

If the plugin is intended to sync across Amplenote environments, use the data note as the canonical source.

If theme is intentionally device-local, don't store it in the shared habit state.

---

# 15. 🟡 `activeHabitId` is partly redundant with session state

There are three concepts:

```text
state.activeHabitId
selectedHabitId
sessionStorage.anp_hs_habit_id
```

The UI initially restores from sessionStorage, while host state separately stores an active habit.

This isn't inherently wrong, but it creates unnecessary synchronization complexity.

A cleaner model would be:

```text
Persistent:
    activeHabitId

Ephemeral:
    currentView
    selectedMonth
    calendar edit state
```

Then derive UI selection from persistent state when appropriate.

---

# 16. 🟡 ID generation can be stronger

Current IDs use:

```js
habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}
```



It's probably fine for normal use, but `crypto.randomUUID()` is cleaner:

```js
id: `habit_${crypto.randomUUID()}`
```

with a fallback if the embedded environment doesn't provide Web Crypto.

---

# 17. 🟡 Input validation is too permissive

For interval:

```js
parseInt(periodNVal, 10) || 1
```

means:

```text
0       → 1
-5      → -5
1abc    → 1
999999  → 999999
```

A negative interval can therefore enter the state.

Use:

```js
const n = Number.parseInt(value, 10);

if (!Number.isInteger(n) || n < 1 || n > MAX_INTERVAL) {
    reject();
}
```

Similarly validate:

* `type`
* `period`
* `colorTheme`
* `date`
* IDs
* arrays
* timestamps

---

# 18. 🟡 State schema validation is missing

`loadState()` essentially accepts:

```js
{
  ...DEFAULT_STATE,
  ...parsed,
  habits: Array.isArray(parsed.habits) ? parsed.habits : []
}
```



But an individual habit isn't validated.

A corrupted habit could contain:

```js
{
  completions: "not-an-array",
  skips: null,
  type: "whatever",
  interval: {}
}
```

and various parts of the application assume arrays/valid strings.

### Add a normalization layer

Something like:

```js
normalizeState(parsed)
normalizeHabit(habit)
```

with explicit defaults and validation.

---

# 19. 🟢 Good defensive choices I found

There are also several things you've done well.

### HTML escaping

You correctly escape user-controlled strings before putting them into HTML. 

That's particularly important because the UI is heavily `innerHTML` based.

### JSON-in-script escaping

The dashboard data is escaped for `<` before embedding into the generated HTML. This is a good defensive measure.

### Future-date protection

Both server/client calendar logic prevent future dates from becoming ordinary tracked days. 

### Cached Sets

The engine avoids repeated array scans while calculating daily statuses:

```js
new Set(habit.skips || [])
new Set(habit.completions || [])
```

That's a good optimization. 

### Calendar editing is staged

The UI uses:

```text
editSkips
editCompletions
```

and doesn't immediately mutate the persisted model for every click. That's a good UX/data-integrity pattern. 

### Future dates cannot be edited

Good guard:

```js
if (dateStr > todayStr) return;
```



---

# The architecture issue underneath most of these bugs

The biggest structural problem isn't individual functions.

It's that the application currently has **three representations of habit state**:

```text
                ┌─────────────────┐
                │ completions[]    │
                │ skips[]          │
                └────────┬────────┘
                         │
                         ▼
                  streak engine


                ┌─────────────────┐
                │ events[]         │
                │ resetLogs[]      │
                └────────┬────────┘
                         │
                         ▼
                   history UI


                ┌─────────────────┐
                │ interval         │
                │ streakAnchor     │
                │ createdAt        │
                └─────────────────┘
```

These aren't fully synchronized.

That's why you get situations like:

```text
Calendar says completed
        ↓
but no event exists

Event says completed
        ↓
but calendar state may later be edited away

Interval says weekly
        ↓
engine calculates daily

Reset occurred at 18:42
        ↓
streak anchor may become midnight
```

---

# Recommended V2 data model

I'd simplify the authoritative model toward:

```js
{
  id,
  name,
  icon,
  colorTheme,

  type: "skip" | "complete",

  schedule: {
    every: 1,
    period: "day"
  },

  createdAt,
  trackingStartDate,

  streak: {
    startedAt: null
  },

  days: {
    "2026-08-17": "completed",
    "2026-08-18": "completed",
    "2026-08-19": "skipped"
  },

  events: [
    {
      id,
      type: "complete" | "skip" | "edit",
      date,
      timestamp,
      note
    }
  ]
}
```

Then:

### `days` = authoritative daily state

### `events` = audit/activity history

### `schedule` = determines which days matter

### `streak.startedAt` = live timer anchor

### `createdAt` = never rewritten

That would eliminate a large portion of the current ambiguity.

---

# Priority fix order

I would **not** start with UI polish. The correct sequence is:

### Phase 1 — Integrity

1. **Stop overwriting malformed state**
2. **Make save failures fatal/visible**
3. **Serialize mutations**
4. **Validate/normalize loaded state**
5. **Validate stored note UUID**
6. **Require name + tag for note recovery**

### Phase 2 — Correctness

7. **Implement interval semantics**
8. **Separate `createdAt` from tracking start**
9. **Fix streak anchor lifecycle**
10. **Define scheduled vs completed vs skipped**
11. **Fix `undoToday()` semantics**
12. **Define calendar/history source-of-truth rules**

### Phase 3 — Analytics

13. Rename/rework weekly frequency
14. Separate sessions from completed days
15. Make completion rate schedule-aware
16. Make tier calculations schedule-aware

### Phase 4 — Quality

17. Centralize date utilities
18. Centralize state mutation
19. Replace random IDs with UUIDs
20. Add schema version migration
21. Reduce inline `onclick`
22. Add automated regression tests

---

# Tests I would absolutely add

Before another feature is added, I would build a small deterministic test suite around these cases:

```text
1. New daily Quitly habit
   → today completed
   → streak = 1

2. New positive habit
   → today not completed
   → streak = 0

3. Positive habit
   → 3 consecutive completions
   → streak = 3

4. Positive habit
   → completion, completion, skip, completion
   → current = 1
   → longest = 2

5. Quitly
   → 10 clean days
   → slip today
   → current = 0
   → longest = 10

6. Quitly
   → multiple slips today
   → history contains all slips
   → undo semantics verified

7. Backdated reset
   → reset 5 days ago
   → only intended dates become skipped

8. Calendar edit
   → edit historical day
   → save
   → reload
   → exact same state

9. Calendar cancel
   → modify 20 days
   → cancel
   → zero persistence changes

10. Weekly habit
    → every 1 week
    → non-scheduled days don't break streak

11. Monthly habit
    → every 1 month
    → month boundary/leap-year cases

12. DST boundary
    → streak calendar remains correct

13. Corrupted note
    → plugin refuses destructive overwrite

14. Save failure
    → UI reports failure

15. Concurrent mutations
    → no lost update

16. Stale UUID
    → note recovery occurs

17. Duplicate note names
    → correct tagged note selected

18. Invalid persisted habit
    → normalized/rejected safely
```

---

## Bottom line

**The code is substantially better than a fragile prototype, but I would not call it fully integrity-safe yet.**

The most important issue is:

> **You have built recurrence configuration into the data/UI, but the actual streak engine is calendar-daily.**

The most dangerous issue is:

> **Malformed persisted JSON can cause the plugin to overwrite the data note with an empty state.**

And the most important architectural issue is:

> **`completions/skips`, `events/resetLogs`, `streakAnchor`, and `interval` aren't governed by one canonical state model.**

Those are the areas I'd fix before doing another round of cosmetic improvements. The existing escaping, staged calendar editing, future-date protection, and cached status calculation are good foundations.  

If this is the same Habit Streak codebase you're iterating on, I would classify the next milestone as **"data-integrity hardening + streak-engine correctness"**, rather than another feature pass.
