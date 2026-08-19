I reviewed the **actual rebuilt `habit-streak.compiled(2).js` bundle**, not just the implementation report. The hardening pass is real and several of the previous findings are fixed. The bundle now contains the schedule-first status ordering, strict date validation, theme validation, mutually exclusive completion/skip normalization, and recurrence-aware reset logic.  

However, I found **two important remaining integrity bugs** that I would fix before calling this final.

## 🔴 1. `Undo Today` is still incorrect for multiple actions

This is the biggest remaining issue.

The implementation removes **all date state** for today:

```js
habit.skips = ...filter(d => d !== todayStr);
habit.completions = ...filter(d => d !== todayStr);
```

but removes only the **last event** and only the **last reset log**. 

That creates an inconsistent state.

### Example: two slips

Suppose a Quitly habit has:

```text
10:00  Slip #1
14:00  Slip #2
```

Persisted state:

```text
skips = ["2026-08-19"]

events = [
  slip #1,
  slip #2
]

resetLogs = [
  reset #1,
  reset #2
]
```

Press **Undo** once.

Current implementation produces:

```text
skips = []

events = [
  slip #1
]

resetLogs = [
  reset #1
]
```

So the engine says:

> Today is clean/completed

even though the remaining historical event says:

> There was still a slip today.

The same problem exists for multiple completion sessions.

### Why this matters

Your report says:

> "removes only the latest daily event/reset"

but the **date-state representation isn't event-based**.

You have two different concepts:

```text
events = multiple occurrences
completions/skips = one state per date
```

Therefore undoing one occurrence requires reconstructing the date state from the remaining events.

### Correct model

After removing the latest today action:

```text
remaining today's events
        ↓
derive today's final state
        ↓
update completions/skips accordingly
```

For example:

```text
remaining event = slip
→ skips contains today

remaining event = done
→ completions contains today

no remaining event
→ remove both
→ fall back to habit philosophy
```

This should be tested explicitly:

* 2 slips → undo → still skipped
* 2 completions → undo → still completed
* slip → completion → undo → back to skipped
* completion → slip → undo → back to completed
* one action → undo → clean slate

**This is a genuine must-fix.**

---

# 🔴 2. Calendar editing can still create meaningless off-day records

You successfully fixed the **analytics** side: `getHabitDayStatus()` now checks scheduling before looking at skips/completions. 

That's correct.

But `handleToggleDay()` itself does **not** reject `not_applicable`.

It blindly turns anything other than `"completed"` into a completion:

```js
if (currentStatus === "completed") {
   ...
} else {
   habit.completions.push(dateStr);
}
```



So an off-day can still be stored in:

```text
completions
```

even though the engine subsequently ignores it.

### Example

Weekly habit:

```text
Monday = scheduled
Tuesday = off
Wednesday = off
...
```

Calendar edit:

```text
Tap Tuesday
```

You can get:

```js
completions: ["2026-08-18"]
```

for a non-scheduled date.

Analytics won't count it because the schedule-first engine correctly returns:

```text
not_applicable
```

So this isn't the old catastrophic streak bug.

But it violates a stronger and cleaner invariant:

> **`completions` and `skips` should contain only scheduled dates.**

Otherwise persisted data can accumulate irrelevant entries indefinitely.

### Recommended fix

At the mutation boundary:

```js
if (!isScheduledDate(habit, dateStr, habit.trackingStartDate)) {
    return;
}
```

Or, preferably, make off-days **non-interactive in the calendar UI**.

The UI already knows they're off-days; they should be visually disabled rather than presenting the same toggle affordance as scheduled dates.

---

# 🟠 3. Changing recurrence still changes historical meaning

This one remains from the previous audit.

`handleEditHabit()` directly replaces:

```js
habit.interval = {
    n: periodN,
    period: periodUnit
};
```



There is no schedule history.

So:

```text
Aug 1–10:
Every day

Aug 11:
change to Every 2 days
```

causes the engine to reinterpret **Aug 1–10 using the new recurrence**.

That's not necessarily a bug if you deliberately define:

> "The current schedule applies retroactively to all history."

But that's a fairly surprising semantic for a habit tracker.

I would at least document the behavior.

A future version could use:

```js
scheduleHistory: [
  {
    effectiveFrom: "2026-08-01",
    n: 1,
    period: "day"
  },
  {
    effectiveFrom: "2026-08-11",
    n: 2,
    period: "day"
  }
]
```

Not necessary for this release, but worth noting.

---

# 🟠 4. Changing tracking philosophy has the same historical problem

`handleEditHabit()` also allows:

```text
Quitly / SKIP
↕
Amplenote / COMPLETE
```

to be changed in place. 

But the meaning of an unrecorded day changes completely:

### Quitly

```text
no skip → completed
```

### Positive

```text
no completion → skipped
```

Therefore:

```text
old history + new type
```

can produce a radically different streak.

Again, this may be an intentional feature.

But if the goal is historical integrity, I would either:

1. make tracking philosophy immutable, or
2. maintain a type-history effective date.

---

# 🟠 5. `isScheduledDate()` still contains an unsafe fallback

There is this:

```js
if (isNaN(startDate.getTime()) || isNaN(targetDate.getTime())) {
    return true;
}
```



Given normal validated inputs, this should be unreachable.

But it is exactly the wrong fallback for a scheduling function.

If something is invalid, returning:

```js
true
```

means:

> "Treat an invalid date as scheduled."

That can silently corrupt streak calculations.

It should be:

```js
return false;
```

or throw in an internal invariant failure.

I'd change this even though it probably won't trigger in normal operation.

---

# 🟠 6. Persisted timestamps are still weakly validated

You now strictly validate date strings, which is excellent.

But these are still accepted as arbitrary strings:

```text
createdAt
streakAnchor
streakStartedAt
event.timestamp
resetLog.timestamp
```

For example:

```js
const streakStartedAt =
    habit.streakStartedAt && typeof habit.streakStartedAt === "string"
        ? habit.streakStartedAt
        : streakAnchor;
```



You later protect `streakStartedAt` with `new Date(...).getTime()`, so the timer is reasonably safe.

But the persisted schema isn't truly normalized.

A stronger normalization layer would validate:

```text
ISO timestamp
```

rather than merely:

```text
typeof === "string"
```

This is **quality hardening**, not a release blocker.

---

# 🟡 7. Cross-instance concurrency remains unresolved

The mutation queue is still:

```js
var mutationQueue = Promise.resolve();
```

and mutations do:

```text
load
→ mutate
→ save
```

inside that queue. 

This protects against concurrent mutations **inside this JS runtime**.

The `revision` is incremented on save, but isn't compared before writing.

So two independent plugin contexts can theoretically still do:

```text
A reads revision 10
B reads revision 10

A writes revision 11
B writes revision 11
```

and B can overwrite A.

I would **not block this release over it** unless Amplenote can actually run multiple independent plugin contexts against the same note concurrently.

---

# 🟢 What I now consider fixed

The latest bundle successfully addresses the major findings from the previous audit:

### Schedule-first status

Correct:

```text
before_start
→ schedule check
→ not_applicable
→ explicit skip/completion
```



### Strict date validation

Now checks both format and actual calendar validity. 

### Reset recurrence awareness

Only scheduled dates are inserted into `skips`. 

### Completion/skip exclusivity

Normalization removes a completion when the same date is a skip. 

### Theme validation

Themes are now constrained to:

```text
midnight
glass
dark
light
neon
```

and `setTheme` validates the input.  

### Calendar audit rendering

`calendar_edit` now has its own timeline representation instead of falling through to the slip style. 

### Positive habit creation

The compiled template creation path now shows the intended empty completion array for positive habits. 

---

# Final assessment

I'd now rate the bundle:

| Area                       | Assessment                                  |
| -------------------------- | ------------------------------------------- |
| Persistence safety         | 🟢 Strong                                   |
| Corruption handling        | 🟢 Strong                                   |
| Recurrence                 | 🟢 Strong                                   |
| Off-day analytics          | 🟢 Fixed                                    |
| Date integrity             | 🟢 Strong                                   |
| Theme integrity            | 🟢 Fixed                                    |
| Calendar audit             | 🟢 Fixed                                    |
| Input validation           | 🟢 Strong                                   |
| Mutation serialization     | 🟢 Strong in-process                        |
| Historical semantics       | 🟠 Needs explicit policy                    |
| Undo semantics             | 🔴 **Still incorrect for multiple actions** |
| Off-day data hygiene       | 🟠 **Still allows stored off-day entries**  |
| Cross-instance concurrency | 🟡 Not fully protected                      |

## My recommended final 3 fixes

If you're trying to get this to a genuine **release-quality / DONE** state, I would make only these changes now:

**1. Fix Undo Today to reconstruct the previous state from remaining events.**
This is the important one.

**2. Prevent calendar edits from writing completion/skip entries for `not_applicable` dates.**
Ideally make those calendar cells non-editable.

**3. Change `isScheduledDate()`'s invalid-date fallback from `true` → `false`.**
Tiny change, but correct defensive behavior.

After those, I would **not keep adding architecture** just for theoretical edge cases. The remaining schedule-history/type-history and cross-context concurrency items are legitimate design considerations, but they don't justify another large refactor unless you specifically want those semantics.

The current bundle is **very close**; I would call it **"release candidate with 1 critical correctness fix and 2 small hardening fixes"**, rather than another broad audit cycle.
