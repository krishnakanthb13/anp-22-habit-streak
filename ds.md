# Habit Streak Code Audit

**Audit date:** 2026-08-20

**Scope:** Source, checked-in production bundle, tests, persistence, recurrence, UI-to-host actions, and import flow.
**Result:** Not release-ready for data-sensitive use until the critical persistence defect and schedule-action defects are fixed.

## Executive Summary

The project has good foundations: the UI escapes injected text, the embed bootstrap JSON escapes `<`, bulk calendar edits validate recurrence dates, and the in-process mutation queue protects overlapping actions within one plugin runtime. The focused suite also passes: **5 suites / 86 tests**.

The main remaining risks are integrity risks rather than cosmetic ones. A malformed data note can still be overwritten by the next mutation; actions available on an off-schedule day persist records that the recurrence engine ignores; and changing a cadence retroactively changes what historical records mean. The persisted `revision` is not used for conflict detection, so the queue does not prevent multi-device or multi-runtime lost updates.

| Severity | Count |
|---|---:|
| Critical | 1 |
| High | 3 |
| Medium | 4 |
| Low / quality | 4 |

## Findings

### Critical: malformed data is overwritten by the next state mutation

**Evidence:** [`lib/data/store.js`](./lib/data/store.js) returns a normalized empty state after a non-empty note fails to parse (lines 315-340). `mutateState` then passes that state to a mutator and unconditionally saves it (lines 390-400). The existing test verifies only that `loadState` itself does not write the note; it does not test the subsequent mutation path.

**Reproduction:** With note content `Damaged user data`, calling `mutateState(app, state => { state.theme = "light"; })` made one `replaceNoteContent` call and replaced the original content with a new empty Habit Streak state.

**Impact:** Any UI action after a parse failure can irreversibly discard all stored habits and history. This contradicts the documented corruption-protection guarantee.

**Fix:** Make load result explicit, for example `{ state, status: "ok" | "empty" | "corrupt" }`. `mutateState` must refuse to invoke the mutator or save when status is `corrupt`, surface a recovery/export message, and never treat a corrupt note as an empty note. Add a regression test that calls `mutateState` against malformed content and asserts no write occurs.

### High: Complete Today and Skip Today accept off-schedule days

**Evidence:** [`lib/features/resetStreak.js`](./lib/features/resetStreak.js) persists action events and completion/skip state in `handleSkipToday` (lines 56-94) and `handleCompleteToday` (lines 237-263) without checking `isScheduledDate`. The action cluster is rendered from the current status and does not suppress these buttons for `not_applicable` days ([`lib/ui/dashboardTemplate.js`](./lib/ui/dashboardTemplate.js), lines 1956-1979).

**Reproduction:** For a weekly positive habit anchored on Sunday, running `handleCompleteToday` on Thursday persisted a `done` event and a completion for Thursday. The engine classifies Thursday as `not_applicable`, so the saved action is invisible to streak calculations but remains in the data and timeline.

**Impact:** Users can record a missed/completed event that does not affect the displayed state. It becomes even more dangerous if the cadence changes later, because the previously ignored record can become a valid historical record.

**Fix:** Centralize a server-side `assertScheduledToday(habit, todayStr)` guard and call it from complete, skip, reset, and undo paths. Render an off-day state without action buttons. Keep direct host calls guarded; UI disabling is not a data-integrity boundary. Add weekly and monthly off-day feature tests.

### High: changing cadence or tracking philosophy rewrites historical meaning

**Evidence:** [`lib/features/editHabit.js`](./lib/features/editHabit.js), lines 101-112, replaces `type` and `interval` with no migration or confirmation. [`lib/engine/streakEngine.js`](./lib/engine/streakEngine.js), lines 240-299, recalculates every historical date using the *current* schedule and type.

**Reproduction:** A weekly positive habit completed on two Sundays had a 2-day, 100% streak. Changing it to daily reclassified the six intervening days as missed, resulting in current streak 1 and completion rate 25%.

**Impact:** A simple settings edit can alter milestones, completion rates, and historical status without any explicit history operation.

**Fix:** Treat schedule/type changes as a migration. The conservative option is to prohibit changing them once records exist and offer “duplicate as new habit” instead. If edits must be supported, record schedule epochs with effective dates and calculate each historical day against its epoch. Require confirmation that summarizes affected historical records, and test type and interval migrations.

### High: revision numbers do not prevent cross-runtime lost updates

**Evidence:** `mutationQueue` in [`lib/data/store.js`](./lib/data/store.js), lines 6-7 and 390-400, is memory-local. `saveState` increments `revision` (lines 351-364), but never checks the currently persisted revision before replacing the entire note.

**Impact:** Two devices, two embeds, or a restarted runtime can both read revision N and each write a different revision N+1. The later whole-note write loses the earlier user action. The queue test only proves serialization inside one JavaScript module instance.

**Fix:** Use an Amplenote conditional write/version API if available. Otherwise, reread immediately before write, compare revision/content hash, retry by reapplying an operation-based mutation, and report an unresolved conflict instead of overwriting. Model mutations as events/operations where practical. Add a two-runtime conflict test.

### Medium: Undo clears calendar-only state although it claims to undo action events

**Evidence:** [`lib/features/resetStreak.js`](./lib/features/resetStreak.js), lines 127-182, removes the latest `done`/`skip`/`slip` event when present. When no such event exists, it always removes today's completion and skip records (lines 178-182), including state created solely by a `calendar_edit` event.

**Reproduction:** A calendar-only edit completed today; the event remained after Undo, but today’s completion was removed. Thus the audit log says the calendar was edited while the edit’s state was silently undone.

**Impact:** This violates the stated contract that Undo targets explicit daily check-in actions and makes audit history diverge from state.

**Fix:** If no action event exists, make Undo a no-op with a clear message. Alternatively, give calendar edits reversible change payloads and a distinct “Undo calendar edit” action. Add both calendar-only and mixed-action tests.

### Medium: timestamp validation accepts impossible ISO calendar dates

**Evidence:** [`lib/data/store.js`](./lib/data/store.js), lines 14-18, checks a regex and `new Date(...).getTime()`. JavaScript normalizes overflow dates rather than rejecting them.

**Reproduction:** `isValidTimestamp("2026-02-31T12:00:00Z")` returns `true`. Normalization then persists `createdAt`, event date, and event timestamp with the impossible `2026-02-31` date.

**Impact:** Invalid values can enter data that assumes strict date validity, causing records that cannot be scheduled or rendered consistently.

**Fix:** Parse components, validate the calendar date using `isValidDateString`, validate hour/minute/second ranges, then verify the parsed instant. Normalize accepted timestamps into a canonical format. Add leap-year, overflow-day, and invalid-offset tests.

### Medium: calendar saves are stale whole-array replacements

**Evidence:** The client takes a snapshot at edit start ([`lib/ui/dashboardTemplate.js`](./lib/ui/dashboardTemplate.js), lines 1283-1291), then sends the entire arrays. The host replaces its arrays wholesale ([`lib/features/toggleDay.js`](./lib/features/toggleDay.js), lines 112-124).

**Impact:** An action taken after edit mode begins can be erased when the user saves the old calendar snapshot. This occurs even within one runtime because serialization orders writes but does not merge stale intent.

**Fix:** Send a date-level diff with the expected prior status, apply it against freshly loaded state, and reject/report conflicts. At minimum, capture and compare the initial revision before applying the save. Test open-edit -> complete/skip -> save.

### Medium: normalization preserves off-schedule and duplicate-ID records

**Evidence:** [`lib/data/store.js`](./lib/data/store.js), lines 72-124, validates date syntax and array uniqueness but does not validate entries against the habit recurrence, and `normalizeState` (lines 138-160) does not de-duplicate habit IDs. The engine then extends the effective start to the earliest recorded date ([`lib/engine/streakEngine.js`](./lib/engine/streakEngine.js), lines 207-216), which can shift the recurrence grid for malformed input.

**Impact:** A manually damaged/imported note can hold records the UI cannot intentionally create. In the worst case, an off-grid historical date changes the calculated recurrence anchor; duplicate IDs make selection, deletion, and updates target an arbitrary habit.

**Fix:** During normalization, retain only records valid on the recurrence grid anchored to the stored `trackingStartDate`, or quarantine invalid records with a recovery warning. Enforce unique non-empty IDs, regenerating/quarantining collisions deterministically. Add fixture tests for both cases.

### Low: calendar UI mutates `createdAt` despite the server invariant

[`lib/ui/dashboardTemplate.js`](./lib/ui/dashboardTemplate.js), lines 1314-1327, optimistically changes `activeHabit.createdAt` and `streakAnchor`. The server intentionally keeps `createdAt` immutable and instead updates `trackingStartDate` after validation. This client-only mutation can briefly render a state the server will not persist.

**Fix:** Do not mutate `createdAt` in the UI. Keep staged edits separate and wait for the host’s normalized response.

### Low: engine public helpers are not uniformly defensive

`getHabitDayStatus(null, ...)` is tested, but `calculateHabitStats(null)` throws while accessing `habit.trackingStartDate` ([`lib/engine/streakEngine.js`](./lib/engine/streakEngine.js), line 208). `generateMonthCalendar` also accepts unbounded/invalid year and month values.

**Fix:** Validate public function inputs consistently or document them as internal-only preconditioned APIs. Test null/partial habits and invalid calendar parameters.

### Low: audit history and data can grow without bounds

Events and reset logs are append-only, and reflection notes, names, and icons have no size bounds. The state is rewritten in full on every action.

**Fix:** Define retention and size policies, compact nonessential activity events, cap user-entered text, and show an export/archive path before pruning. This is especially important for long-running daily habits.

### Low: build and test workflow is not project-local or reproducible

This plugin directory contains no `package.json`, Jest configuration, or documented build command. The checked-in compiled bundle is what users install, while tests import source modules only. A plain `npx jest --runInBand` discovers the parent workspace and fails under its default CommonJS execution; the scoped ESM command below succeeds.

**Fix:** Add local package scripts/configuration or document the parent-workspace dependency explicitly. Add a deterministic bundle build command and a CI check that rebuilds and verifies the bundle matches source. Test the compiled artifact’s public entry point as well as source modules.

## Recommended Remediation Order

1. Block all writes after parse failure and add the regression test.
2. Enforce recurrence server-side for every day-changing action and hide off-day controls.
3. Define the schedule-change product contract; implement immutable epochs or “duplicate as new.”
4. Implement optimistic concurrency/conflict handling and date-level calendar diffs.
5. Correct timestamp/date normalization and quarantine invalid persisted records.
6. Make Undo no-op without a supported action event, then add size/retention limits.
7. Add a project-local test/build command and compiled-bundle parity check.

## Positive Controls Verified

- User-controlled dashboard values are HTML-escaped, and embedded JSON escapes `<` before insertion into the `<script>` block.
- Batch calendar persistence validates syntactic dates and recurrence alignment before writing.
- Skips and completions are normalized to unique, mutually exclusive arrays.
- The direct-toggle path validates a backdated date against the existing schedule anchor before moving `trackingStartDate`.
- Unknown event types are discarded during normalization.
- The in-process mutation queue does serialize mutations in a single loaded plugin instance.

## Verification

The focused source suite passed:

```powershell
$env:NODE_OPTIONS='--experimental-vm-modules'
npx jest test --runInBand --config '{"testEnvironment":"node","transform":{}}'
```

Result: **5 test suites passed, 86 tests passed**. The suite does not cover the critical corrupted-note mutation path, off-schedule action handlers, cadence migration, multi-runtime conflicts, timestamp overflow dates, or calendar-only Undo; those are the priority regression tests above.
