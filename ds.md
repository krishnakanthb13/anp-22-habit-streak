I reviewed the **new compiled bundle** you uploaded after the fixes. This is a materially stronger version than the one I audited previously: the major persistence protections, recurrence engine, mutation queue, UUID recovery, calendar audit event, and non-destructive undo are now present in the compiled artifact. 

However, I would **not yet mark it completely clean**. I found several second-order correctness issues that your 71 tests can still miss.

## Updated verdict

**🟢 Architecture / persistence: much improved**
**🟢 Basic recurrence: implemented**
**🟢 Regression coverage: good**
**🟠 Streak semantics: still have edge cases**
**🟠 Date integrity: a few important holes**
**🟡 Multi-instance concurrency: not fully solved**

The most important remaining problems are below.

---

# 🔴 1. Off-day manual records can become scheduled days

This is the most significant remaining streak-engine issue.

`getHabitDayStatus()` checks persisted `skips` and `completions` **before** checking whether the date is scheduled:

```text
if skips.has(dateStr)       → skipped
if completions.has(dateStr) → completed
...
if !scheduled               → not_applicable
```



That means an off-day can be forcibly transformed into a tracked day simply by appearing in either array.

Example:

```text
Habit: every 2 days

Aug 18  scheduled
Aug 19  OFF
Aug 20  scheduled
```

If `completions` contains:

```text
2026-08-19
```

then Aug 19 is reported as:

```text
completed
```

instead of:

```text
not_applicable
```

Consequently it is included in `scheduledDays` and `completedDays`.

### Why this matters

Your new recurrence engine correctly understands off-days, but the **override ordering defeats that model**.

### Better rule

For ordinary calendar state:

```text
future
↓
before_start
↓
not_scheduled
↓
scheduled + explicit completion/skip
↓
scheduled + implicit/default state
```

In other words, determine applicability first.

If you intentionally want manual overrides on off-days, then introduce an explicit concept such as:

```js
overrideDates
```

rather than silently turning an off-day into a scheduled day.

---

# 🔴 2. Resetting a range has the same off-day problem

`handleResetToDate()` currently applies the reset to **every calendar date** in the range:

```text
for each d:
    habit.skips.push(d)
```



For a weekly/monthly habit, that means a reset can mark dozens of **non-scheduled days** as skipped.

Because `getHabitDayStatus()` checks `skips` before schedule, those off-days subsequently become `skipped` scheduled days.

So:

```text
Every 1 week
```

could theoretically have:

```text
Monday    scheduled
Tuesday   reset
Wednesday reset
Thursday  reset
Friday    reset
Saturday  reset
Sunday    reset
```

and all of those become relevant tracked days.

### Fix

Reset only dates satisfying:

```js
isScheduledDate(habit, d)
```

unless the product explicitly defines a reset as "invalidate every calendar day."

For a recurrence-aware habit tracker, I strongly recommend the former.

---

# 🔴 3. `calculateHabitStats()` has a backdated-start inconsistency

This is subtle.

You do:

```js
let habitStart = habit.trackingStartDate || ...
```

then:

```js
if (allRecordedDates[0] < habitStart) {
    habitStart = allRecordedDates[0];
}
```



So the calculation range can begin earlier than `habit.trackingStartDate`.

But `getHabitDayStatus()` still receives the **original habit**, whose `trackingStartDate` hasn't changed:

```js
const habitStart = habit?.trackingStartDate ...
```



Therefore:

```text
calculation range:
    July 1 → today

habit trackingStartDate:
    July 10
```

A July 5 completion is iterated over, but `getHabitDayStatus()` can classify it as:

```text
before_start
```

rather than a genuine tracked completion.

### Recommendation

Don't silently alter the calculation's start date.

Use one canonical rule:

```js
const effectiveStartDate = habit.trackingStartDate;
```

and ensure any legitimate backdated record updates `trackingStartDate` at the mutation boundary.

You've already done this for calendar edits, but the engine itself should not have a second hidden start-date rule.

---

# 🔴 4. Invalid dates aren't actually validated

The reset UI asks for:

```text
YYYY-MM-DD
```

but `getDateRange()` relies on:

```js
new Date(startStr + "T00:00:00")
```



JavaScript normalizes some invalid calendar dates instead of rejecting them.

For example, dates such as:

```text
2026-02-30
```

can be interpreted as a later valid date rather than being rejected.

This is dangerous for a **history-editing application**.

### Add strict date validation

Something like:

```js
function isValidDateString(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    return (
        date.getFullYear() === y &&
        date.getMonth() === m - 1 &&
        date.getDate() === d
    );
}
```

Use it everywhere dates enter the system.

---

# 🟠 5. Revision numbers do not actually provide cross-instance concurrency protection

You've added:

```js
revision++
```

and a mutation queue. 

This solves:

> two mutations in the **same JavaScript runtime**

very well.

But the revision isn't used as an optimistic lock.

Imagine:

```text
Browser/context A      Browser/context B

read revision 20       read revision 20

modify                  modify

write revision 21       write revision 21
```

B can still overwrite A.

The queue is:

```js
let mutationQueue = Promise.resolve();
```

which is process/module-local. 

### Important distinction

Your implementation solves:

> **in-process race conditions**

It does **not** guarantee:

> **cross-instance / cross-tab / concurrent-host-write integrity**

If Amplenote guarantees only one plugin execution context at a time, you're probably fine operationally.

If not, use revision comparison:

```text
read revision N
↓
modify
↓
re-read current revision
↓
if current !== N:
    merge/retry
↓
write N+1
```

That would make the revision meaningful as a concurrency mechanism rather than simply a change counter.

---

# 🟠 6. `streakStartedAt` can still become semantically stale

You fixed the previous midnight reconstruction problem, which is good.

However, `calculateHabitStats()` uses:

```js
habit.streakStartedAt
```

whenever it exists, without verifying that its **date corresponds to the calculated streak start date**. 

Example:

```text
Current streak:
Aug 15 → Aug 19

streakStartedAt:
Aug 12 14:00
```

The ticker can use Aug 12 even though the current streak actually starts Aug 15.

This can happen after historical calendar edits, schedule changes, or other state transformations.

### Better invariant

The following should always be true:

```text
streakStartedAt.date === streakStartDate
```

If not, don't trust it.

Better still, whenever the current streak changes, explicitly update:

```js
streakStartedAt
```

rather than trying to infer whether the stored value remains valid.

---

# 🟠 7. Editing the recurrence schedule can rewrite the meaning of history

This is a product-level integrity issue.

Suppose a user has:

```text
Every day
Aug 1 ✓
Aug 2 ✓
Aug 3 ✗
Aug 4 ✓
Aug 5 ✓
```

Then changes the habit to:

```text
Every 2 days
```

Your engine recalculates historical statuses using the **new schedule**.

That means old history has effectively changed meaning.

This is unavoidable if schedule is mutable unless you explicitly define schedule history.

### Strong solution

Store schedule changes:

```js
scheduleHistory: [
  {
    effectiveFrom: "2026-08-01",
    interval: { n: 1, period: "day" }
  },
  {
    effectiveFrom: "2026-08-10",
    interval: { n: 2, period: "day" }
  }
]
```

Then historical analytics use the schedule that was active at the time.

This is probably unnecessary for v1, but it's the correct long-term model.

---

# 🟠 8. Changing habit type can reinterpret all historical data

The same issue exists for:

```text
SKIP → COMPLETE
```

or:

```text
COMPLETE → SKIP
```

Your persisted history arrays remain the same, but the default meaning changes.

For example:

```text
Old type: Quitly
No entry = completed

New type: Positive
No entry = missed
```

The exact same historical calendar now means something different.

This is more serious than it initially appears because `type` is currently a mutable property.

### Recommendation

Treat `type` as immutable after creation.

If users need to change it:

> "Create a new habit from this one"

or migrate historical data explicitly.

---

# 🟠 9. Monthly recurrence semantics need a documented policy

Your implementation uses:

```js
expectedDay = Math.min(startDay, lastDayOfTargetMonth)
```



That's a reasonable choice.

For a habit beginning on:

```text
January 31
```

you get:

```text
Jan 31
Feb 28
Mar 31
Apr 30
May 31
```

But another legitimate interpretation is:

```text
last day of month
```

meaning:

```text
Jan 31
Feb 28
Mar 31
Apr 30
May 31
```

These happen to coincide here, but leap years and subsequent month transitions make the semantics worth explicitly testing.

I'd document:

> Monthly recurrence preserves the original day-of-month, clamping to the last day when necessary.

That makes the behavior intentional rather than accidental.

---

# 🟠 10. Theme validation regressed at the persistence boundary

`normalizeHabit()` validates neither the habit theme nor the global theme against the known theme set.

It accepts any string:

```js
const colorTheme =
    habit.colorTheme && typeof habit.colorTheme === "string"
        ? habit.colorTheme
        : "blue";
```



Likewise:

```js
const theme =
    parsed.theme && typeof parsed.theme === "string"
        ? parsed.theme
        : "midnight";
```

This isn't catastrophic, but it contradicts your stated "allowed themes" validation.

### Fix

Normalize at the persistence boundary:

```js
const colorTheme =
    COLOR_THEMES[habit.colorTheme]
        ? habit.colorTheme
        : "blue";
```

and:

```js
const theme =
    VALID_THEMES.has(parsed.theme)
        ? parsed.theme
        : "midnight";
```

---

# 🟡 11. The localStorage theme can still override persisted state

The dashboard initializes:

```js
activeTheme = INITIAL_DATA.theme
```

then:

```js
const saved = localStorage.getItem("habit_streak_theme");
if (saved) activeTheme = saved;
```



So:

```text
Amplenote state: theme-dark
Browser localStorage: theme-neon
```

results in:

```text
theme-neon
```

This is a deliberate device-local preference if that's what you want.

But then storing `theme` in the shared state is redundant.

I'd choose one:

### Shared preference

Persist only in Amplenote.

### Device preference

Persist only in localStorage.

I'd favor **shared Amplenote state** for this plugin.

---

# 🟡 12. `setTheme` trusts arbitrary host input

The host action does:

```js
state.theme = args[1];
```



Even though the UI probably only sends valid themes.

Host-facing APIs should still validate.

```js
if (!VALID_THEMES.has(theme)) {
    throw new Error("Invalid theme");
}
```

Treat `onEmbedCall()` arguments as untrusted input.

---

# 🟡 13. Calendar editing can still write impossible combinations

Because calendar editing accepts separate:

```text
skips
completions
```

the persistence layer does:

```js
habit.skips = [...]
habit.completions = [...]
```



There's no normalization ensuring:

```text
date ∉ skips ∩ completions
```

`getHabitDayStatus()` resolves this by giving `skips` priority.

So this state:

```js
skips: ["2026-08-19"]
completions: ["2026-08-19"]
```

is technically possible.

That's bad persisted-state hygiene.

### Normalize it

Pick one canonical winner and remove the contradiction:

```js
completions = completions.filter(d => !skipSet.has(d));
```

Or reject the save.

---

# 🟡 14. Events aren't normalized enough

You validate:

```js
events = events.filter(e => e && typeof e === "object")
```

but don't validate:

* event ID
* event type
* date
* timestamp
* required fields

Same for `resetLogs`.

So malformed persisted audit records can survive indefinitely.

Since the audit log is supposed to establish integrity, I'd make it stricter than the current normalization.

---

# 🟡 15. `calendar_edit` events aren't represented properly in the history UI

The event is created as:

```js
type: "calendar_edit"
```



But the timeline renderer maps:

```js
ev.type === "done" ? "done" : "slip"
```



So **every event other than `done` becomes a slip** in the UI.

That means:

```text
calendar_edit
```

can visually appear as a **slip/reset-like event**.

This is a genuine UI correctness bug introduced by the audit improvement.

### Fix

Handle explicitly:

```js
switch (ev.type) {
    case "done":
    case "slip":
    case "reset":
    case "calendar_edit":
}
```

and display something like:

> ✏️ Calendar history edited

rather than a red slip indicator.

---

# 🟡 16. Calendar edit audit event can become noisy

Every save creates a new event:

```text
Calendar history edited (X done, Y skips)
```

Even if the user opens edit mode and makes a tiny change, that's fine.

But if they repeatedly save without changes, you get audit noise.

I'd only create the event when:

```text
old completions !== new completions
OR
old skips !== new skips
```

This is especially important because the audit trail is now supposed to be meaningful.

---

# 🟡 17. Creating a positive habit immediately gives it a completion

Your template creation does:

```js
completions: template.type === TRACK_TYPES.COMPLETE
    ? [todayStr]
    : []
```



That means:

> Create "Daily Workout"

immediately produces:

```text
Current streak: 1
```

without the user actually checking in.

Maybe that's intentional, but semantically it's questionable.

For a habit tracker, I'd expect:

```text
New positive habit
→ 0 days completed
→ user explicitly completes today
```

Otherwise the first day is artificially successful.

The test suite scenario "New positive habit → today not completed → streak = 0" should be applied to **actual creation behavior**, not merely a manually constructed fixture.

---

# 🟡 18. New Quitly habit has a similarly asymmetric semantic

A Quitly habit defaults to:

```text
no skip = completed
```

So creation naturally starts at day 1, while positive habits also currently get an explicit completion.

You need to decide whether:

```text
created today
```

means:

> "Tracking began today"

or:

> "Today has been completed"

Those aren't necessarily the same thing.

I would distinguish:

```text
trackingStartDate = today
```

from:

```text
todayStatus = completed
```

and let the habit type determine default behavior.

---

# 🟢 What is now solid

Several things I previously flagged are genuinely fixed.

### Corruption protection

The plugin now refuses to overwrite a malformed non-empty data note. 

### Mutation serialization

The load → mutate → save sequence is now serialized. 

### UUID recovery

Stored UUIDs are actually verified, and fallback lookup checks both name and required tags. 

### Recurrence

Daily, weekly and monthly scheduling is genuinely implemented now. 

### Off-day neutrality

The engine has the right conceptual state:

```text
not_applicable
```

and excludes it from streak-breaking logic. 

### Non-destructive undo

The previous "wipe today's history" concern appears to have been addressed in the new implementation.

---

# One thing I would change in your test strategy

The **71 passing tests are encouraging, but they currently prove the intended paths more strongly than they prove invariants**.

Add property/invariant tests such as:

### State invariant

```text
skips ∩ completions = ∅
```

### Schedule invariant

```text
!isScheduledDate(habit, date)
→ date cannot contribute to scheduledDays
```

### Streak invariant

```text
currentStreak > 0
→ streakStartDate is scheduled
→ streakStartDate has completed status
```

### Anchor invariant

```text
streakAnchorTimestamp date == streakStartDate
```

### Type invariant

```text
type ∈ {skip, complete}
```

### Theme invariant

```text
theme ∈ VALID_THEMES
```

### Date invariant

```text
every persisted date matches YYYY-MM-DD
AND represents a real calendar date
```

### Audit invariant

```text
calendar_edit !== slip
```

These tests are much more valuable than simply adding more examples.

---

# My revised priority list

If you're going to do **one final hardening pass**, I'd make it:

### 🔴 Must fix

1. **Off-day records overriding recurrence**
2. **Reset-to-date marking off-days as skipped**
3. **Strict date validation**
4. **Backdated `trackingStartDate` consistency**
5. **`calendar_edit` incorrectly rendered as a slip**
6. **Prevent `skips ∩ completions` contradictions**

### 🟠 Strongly recommended

7. Validate `streakStartedAt` against `streakStartDate`
8. Decide whether habit `type` can be changed
9. Decide whether schedule changes rewrite history
10. Remove redundant localStorage/shared theme authority
11. Validate persisted themes
12. Only create calendar audit events when something actually changed

### 🟡 Architecture improvements for later

13. Cross-instance optimistic concurrency using `revision`
14. Schedule-history model
15. Strong event schema
16. Property-based invariant tests

---

## Bottom line

**This is now a substantially more mature implementation.** The previous audit's biggest structural concerns have largely been addressed, and the compiled bundle confirms that the fixes actually made it into the distribution artifact rather than existing only in source. 

I would **not redo the architecture** at this point.

Instead, I'd do one focused **"edge-case/invariant hardening" pass**, especially around the interaction between:

> **recurrence → off-days → manual edits → resets → streak calculation**

That's where the remaining bugs are concentrated.

The single most important invariant to establish is:

> **A non-scheduled date must never become a scheduled/tracked day merely because a completion or skip entry happens to exist for it.**

Once that is enforced, the recurrence implementation becomes much more trustworthy.
