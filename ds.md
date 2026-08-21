# 🔍 Habit Streak Plugin — Code Audit Report

> **Plugin:** `anp-22-habit-streak`
> **Date:** 2026-08-21
> **Test Suite:** 95/95 passing (5 suites)
> **Files Audited:** 12 source files, ~2,600 LOC (excluding 93KB template)

---

## Executive Summary

The codebase is **well-structured and mature**. The modular architecture, mutation queue, corruption guard, and comprehensive test suite are all above-average for an Amplenote plugin. That said, this audit uncovered **3 confirmed bugs**, **6 edge-case risks**, and **12 quality improvement opportunities** across data integrity, concurrency, UI logic, and maintainability.

---

## 🐛 Confirmed Bugs

### BUG-1 · `editHabit.js:99` — Incorrect Tracking Type Validation Logic

```js
// CURRENT (buggy)
const habitType = (typeVal === TRACK_TYPES.COMPLETE || habitToEdit.type === TRACK_TYPES.SKIP)
  ? typeVal : TRACK_TYPES.SKIP;
```

**Problem:** The condition checks `habitToEdit.type` (the *old* value) instead of `typeVal` (the *new* value from the prompt). If the user selects `TRACK_TYPES.SKIP` and the old habit was `COMPLETE`, the condition `habitToEdit.type === TRACK_TYPES.SKIP` is false, so it falls through and the user's choice is silently ignored — the result defaults to `TRACK_TYPES.SKIP` anyway (by coincidence), but the logic is semantically wrong and would break if the default ever changed.

**Fix:**
```js
const habitType = (typeVal === TRACK_TYPES.COMPLETE || typeVal === TRACK_TYPES.SKIP)
  ? typeVal : TRACK_TYPES.SKIP;
```

**Severity:** Medium — the result is accidentally correct today, but the logic is objectively wrong and fragile.

---

### BUG-2 · `store.js:394-401` — `loadState` Reports `"ok"` Status on Fatal Failure

```js
} catch (err) {
  console.error("[HabitStreak] Failed to load state:", err);
  const fallbackState = normalizeState({ ...DEFAULT_STATE });
  return {
    state: fallbackState,
    status: "ok",       // ← LIE: It wasn't "ok" — it was a hard failure
    rawContent: ""
  };
}
```

**Problem:** When `loadStateWithStatus` throws (e.g., `app.getNoteContent` network failure), the catch block returns `status: "ok"`, which is misleading. Callers that check `status` will believe the data was cleanly loaded when it was actually fabricated from defaults. This can mask data loss if the note temporarily becomes unreachable.

**Fix:** Return `status: "error"` (or at minimum `"empty"`) and consider adding a `_loadError: true` flag so that `mutateState` can also guard against writing fabricated state over real data.

**Severity:** High — silent data loss vector.

---

### BUG-3 · `store.js:215` — `app.settings` Accessed as Object Instead of Function

```js
const existingUUID = app.settings ? await app.settings[settingKey] : null;
```

**Problem:** In the Amplenote plugin API, `app.settings` is a plain object (not async). The `await` on a string is harmless (resolves to itself), but the access pattern is inconsistent with how settings are read elsewhere in the Amplenote ecosystem. The real risk: if `app.settings` is `undefined` at init time (race condition during plugin bootstrap), this silently skips UUID recovery and falls through to create a **duplicate data note**.

**Recommendation:** Add defensive guard and document the access pattern:
```js
const existingUUID = (app.settings && typeof app.settings === "object")
  ? app.settings[settingKey] || null
  : null;
```

**Severity:** Low-Medium — works today but brittle against future API changes.

---

## ⚠️ Edge-Case Risks

### EDGE-1 · `streakEngine.js:109` — Timezone/DST Sensitivity in Day Diff Calculation

```js
const diffInDays = Math.round((targetDate - startDate) / (1000 * 60 * 60 * 24));
```

**Risk:** When crossing a DST boundary, the actual difference between two midnight-constructed dates can be 23 or 25 hours, making `Math.round` yield an off-by-one error on edge days (e.g., `2026-03-08` to `2026-03-09` in US timezones = 23 hours, rounds to 1 — works. But `2026-11-01` to `2026-11-02` = 25 hours, also rounds to 1 — works by luck). The `T00:00:00` suffix (no timezone) means this depends on the *local* timezone of the Amplenote client.

**Impact:** Low in practice (rounding saves you), but for `period === "day"` with `n > 1`, a DST crossing could theoretically cause `Math.round(24.5h / 24h) = 1` when it should be 1, or `Math.round(22.5h / 24h) = 1` when it should be 0 for adjacent days that are actually 23 hours apart. This is a well-known JS footgun.

**Recommendation:** Use UTC dates consistently:
```js
const start = new Date(habitStart + "T00:00:00Z");
const target = new Date(dateStr + "T00:00:00Z");
```

---

### EDGE-2 · `store.js:490-506` — Module-Level `mutationQueue` is Not Scoped Per-Plugin-Instance

```js
let mutationQueue = Promise.resolve();
```

**Risk:** If Amplenote ever loads two embed instances of the same plugin simultaneously (e.g., sidebar + fullscreen), they share the same module scope. The queue serializes mutations within one JS context, but two independent embeds each have their own `mutationQueue`, meaning true concurrent writes to the same note **are not protected** by this queue.

**Mitigation:** The `expectedRevision` optimistic concurrency check in `saveState` provides a second layer of defense. However, it only detects conflicts — it doesn't retry. A failed save due to concurrency simply returns `false` and the user's action is silently lost.

**Recommendation:** Document this limitation. Consider adding a retry with exponential backoff on concurrency failure in `mutateState`, or queue at the Amplenote app level if the API supports it.

---

### EDGE-3 · `resetStreak.js:385` — Quadratic Performance on Large Ranges

```js
for (const d of rangeDates) {
  if (isScheduledDate(habit, d, habit.trackingStartDate)) {
    if (!habit.skips.includes(d)) {
      habit.skips.push(d);
    }
  }
  habit.completions = habit.completions.filter(c => c !== d);  // ← O(n) per iteration
}
```

**Risk:** If the user enters a reset range spanning, say, a year (365 days), and the habit has hundreds of completions, this is `O(rangeDays × completions)` — potentially tens of thousands of iterations. For typical use (a few days/weeks) this is fine, but there's no guard rail.

**Fix:** Convert `habit.completions` to a `Set` before the loop:
```js
const completionSet = new Set(habit.completions);
for (const d of rangeDates) {
  completionSet.delete(d);
  // ...
}
habit.completions = [...completionSet];
```

---

### EDGE-4 · `store.js:312` — Greedy Regex for JSON Extraction Matches First Block

```js
const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
```

**Risk:** If the data note ever contains a second code block (e.g., user accidentally pastes something, or a future feature adds metadata), this regex grabs the first ```` ``` ```` block, which might not be the JSON state block.

**Recommendation:** Make the regex more specific — require the `json` language tag:
```js
const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
```
And keep the generic fallback only as a migration path.

---

### EDGE-5 · `handleSkipToday` — Always Pushes Reset Log Even for Repeated Skips

In `resetStreak.js:87-93`, every call to `handleSkipToday` pushes a new `resetLogs` entry, even if the user is logging a second, third, or fourth slip on the same day. Over time, this inflates `resetLogs` with duplicate-day entries.

**Recommendation:** Either skip the resetLog push if one already exists for today, or clearly label repeated slips vs. initial resets in the reset log data:
```js
if (!alreadySkippedToday) {
  habit.resetLogs.push({ ... });
}
```

---

### EDGE-6 · `dashboardTemplate.js:1460` — Escaped Emoji Regex Doesn't Work in Inline Template

```js
const emojiMatch = habit && habit.name ? habit.name.match(/^[\\p{Emoji}\\u200d]+/u) : null;
```

**Problem:** Inside the template literal string, `\\p{Emoji}` becomes the literal string `\p{Emoji}` in the HTML `<script>`. This is correct for template strings. However, `\p{Emoji}` is a *deprecated/legacy* Unicode category — the modern equivalent is `\p{Extended_Pictographic}`. This regex may silently fail to match some emojis in newer browser versions.

**Recommendation:** Use `\p{Extended_Pictographic}` for consistency with `importFromNote.js:60` which already uses it.

---

## 🔧 Quality & Improvement Recommendations

### IMP-1 · **Defensive Guard on `handleCreateFromTemplate` Template Index**

`createHabit.js:136`:
```js
const template = PRESET_TEMPLATES[templateIndex];
```

If `templateIndex` comes from the embed as a string (which it does — `args[1]` from `onEmbedCall`), `PRESET_TEMPLATES["3"]` works by implicit coercion, but `PRESET_TEMPLATES["abc"]` returns `undefined` silently.

**Fix:** Parse to integer:
```js
const idx = parseInt(templateIndex, 10);
const template = (!isNaN(idx) && idx >= 0 && idx < PRESET_TEMPLATES.length) ? PRESET_TEMPLATES[idx] : null;
```

---

### IMP-2 · **`loadState` Error Status Propagation**

Currently `loadState` calls `loadStateWithStatus` but discards the `status` and `rawContent`. Feature handlers that call `loadState` (like `handleEditHabit`, `handleSkipToday`, `handleDeleteHabit`, etc.) cannot detect corruption and proceed with stale/default data.

**Recommendation:** Consider having these handlers use `loadStateWithStatus` directly, or having `loadState` throw on corruption so the error propagates to the `catch` block in `onEmbedCall`.

---

### IMP-3 · **Missing `renderEmbed` Return in Corrupt State**

When state is corrupt, `renderEmbed` in `habit-streak.js:113-148` will render the dashboard with empty habits (the normalized default). The user sees an empty dashboard with no indication that their data exists but is corrupt.

**Recommendation:** Check for `state._isCorrupt` in `renderEmbed` and return a visible error banner:
```js
if (state._isCorrupt) {
  return `<div style="color: red; padding: 20px;">
    ⚠️ Your habit data note appears corrupted. Please check the note manually.
  </div>`;
}
```

---

### IMP-4 · **Event Array Unbounded Growth**

`normalizeHabit` caps `events` at 500 and `resetLogs` at 100 (via `.slice(-N)`). However, the cap is only applied during normalization (load time). During a session, repeated `handleSkipToday` and `handleCompleteToday` calls push events without checking the cap. If a user rapidly clicks 501+ times without a save/reload cycle, the array exceeds bounds until the next normalize.

**Fix:** Either enforce the cap at push time, or accept the current behavior as intentional (load-time GC).

---

### IMP-5 · **`generateUniqueId` Fallback Has Collision Risk**

`constants.js:119-121`:
```js
const timestamp = Date.now().toString(36);
const randomPart = Math.random().toString(36).substring(2, 10);
return `${prefix}_${timestamp}_${randomPart}`;
```

The fallback (non-crypto) path uses `Math.random()`, which has only ~52 bits of entropy. For a single-user plugin this is fine, but if two habits are created in the same millisecond (e.g., rapid batch import), the timestamp portion is identical, and collision relies entirely on `Math.random()`.

**Recommendation:** Add a monotonic counter as tie-breaker:
```js
let _counter = 0;
// ...
return `${prefix}_${timestamp}_${randomPart}_${(++_counter).toString(36)}`;
```

---

### IMP-6 · **`getNoteUUID` Calls `filterNotes({})` — Fetches ALL Notes**

`store.js:221` and `store.js:270`:
```js
const allNotes = await app.filterNotes({});
```

**Impact:** On accounts with thousands of notes, this loads the entire note list into memory to find one note. If Amplenote's `filterNotes` supports tag-based filtering, use it:
```js
const allNotes = await app.filterNotes({ tag: DATA_NOTE_TAGS[0] });
```

This would dramatically reduce the search space.

---

### IMP-7 · **Dashboard Template is a 93KB Monolith**

`dashboardTemplate.js` is 2,434 lines of inlined HTML/CSS/JS inside a single template literal. This is the standard pattern for Amplenote embed plugins, but it makes debugging, linting, and testing the client-side JS nearly impossible.

**Recommendation:** Consider splitting the CSS, JS, and HTML generation into separate builder functions within the file. The output remains a single string, but development-time readability improves significantly.

---

### IMP-8 · **No Habit Count Limit**

There's no maximum number of habits enforced. A user who imports 100+ habits will cause `calculateAllHabitsSummary` to call `calculateHabitStats` for each one on every render, which iterates over all tracked days per habit.

**Recommendation:** Add a soft limit (e.g., 50 habits) with a user-facing warning.

---

### IMP-9 · **`handleSaveCalendarEdits` — Inconsistent Event Logging**

Calendar edits log a `calendar_edit` event but do not log individual day flips. This means the audit trail shows "Calendar edited (15 done, 3 skips)" without recording *which* specific days changed.

**Recommendation for future:** Optionally record a diff of changed dates in the event note.

---

### IMP-10 · **Missing Input Sanitization in Template HTML**

In `dashboardTemplate.js`, habit names and icons are rendered with `escapeHtml()` in most places, which is good. However, some interpolations like `activeHabit.interval?.n` and `activeHabit.interval?.period` are injected directly into HTML without escaping. These are constrained values from normalization, so XSS risk is negligible, but defensive escaping is best practice.

---

### IMP-11 · **`handleUndoToday` Doesn't Re-anchor Streak Timestamp**

When a skip is undone, the streak anchor (`streakAnchor` / `streakStartedAt`) is not restored to its previous value. This means the live ticker will show time elapsed from the reset moment, even after the undo removes the skip.

**Recommendation:** Store the previous anchor value in the event before overwriting, and restore it on undo.

---

### IMP-12 · **`refreshData` Action Has No Guarantee of Re-render**

`habit-streak.js:93-95`:
```js
case "refreshData":
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
  break;
```

If `app.context.renderEmbed` is unavailable (which the Amplenote API doesn't guarantee), this silently does nothing. The embed has no fallback mechanism to force a state refresh.

---

## 📊 Summary Matrix

| Category | Count | Severity |
|---|---|---|
| 🐛 Confirmed Bugs | 3 | 1 High, 1 Medium, 1 Low-Medium |
| ⚠️ Edge-Case Risks | 6 | 1 Medium, 5 Low |
| 🔧 Quality Improvements | 12 | All Low (enhancement) |

## ✅ Strengths Worth Noting

- **Corruption Guard:** The `_isCorrupt` flag + refusal to overwrite is excellent defensive design
- **Mutation Queue:** Promise-based serialization prevents lost updates within a single embed instance
- **Optimistic Concurrency:** Revision-based conflict detection adds a second safety layer
- **Normalization Layer:** Every load path runs through `normalizeState` → `normalizeHabit`, ensuring schema consistency
- **Comprehensive Tests:** 95 tests across 5 suites covering happy paths, error handling, and design-spec scenarios
- **Proper HTML Escaping:** `escapeHtml()` is used consistently in user-facing content
- **Bounded Arrays:** Events capped at 500, reset logs at 100 prevents unbounded growth

---

> **Next Steps:** Address BUG-1, BUG-2, and BUG-3 as priority fixes. EDGE-1 (DST) and IMP-3 (corrupt state visibility) are recommended for the next release.

---

### 1. 🔴 Must-Fix (Critical Bugs & Data Integrity) — ✅ ALL RESOLVED
*These directly cause incorrect behavior, potential data loss, or silent failure.*

| Item | Location | Why It Is Necessary | Status |
| :--- | :--- | :--- | :--- |
| **BUG-1** | [`editHabit.js:99`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/features/editHabit.js#L99) | **Broken validation logic:** Checks `habitToEdit.type === TRACK_TYPES.SKIP` instead of `typeVal === TRACK_TYPES.SKIP`. | ✅ Fixed & Tested |
| **BUG-2** | [`store.js:394-401`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/data/store.js#L394-L401) | **False "ok" status on hard error:** Returns `status: "error"`, marks `_isCorrupt` & `_loadError`, guards `mutateState`. | ✅ Fixed & Tested |
| **BUG-3** | [`store.js:215`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/data/store.js#L215) | **Improper settings access:** Defensively checks `app.settings && typeof app.settings === "object"`. | ✅ Fixed & Tested |
| **IMP-1** | [`createHabit.js:136`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/features/createHabit.js#L136) | **Type coercion & bounds check:** Parses `templateIndex` with `parseInt` and validates array bounds. | ✅ Fixed & Tested |
| **IMP-3** | [`habit-streak.js:113-148`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/habit-streak.js#L113-L148) | **Corrupt state visibility:** Renders prominent warning banner when note is corrupted or unreadable. | ✅ Fixed & Tested |

---

### 2. 🟡 Strongly Recommended (Edge Cases & Performance) — ✅ ALL RESOLVED
*These prevent real-world glitches in edge cases like DST transitions, large data sets, and emoji handling.*

| Item | Location | Why It Is Recommended | Status |
| :--- | :--- | :--- | :--- |
| **EDGE-1** | [`streakEngine.js:109`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/engine/streakEngine.js#L109) | **DST / Timezone Skew:** Uses UTC midnight parsing (`T00:00:00Z` and UTC methods) across all calculations. | ✅ Fixed & Tested |
| **EDGE-3** | [`resetStreak.js:385`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/features/resetStreak.js#L385) | **$O(N^2)$ Range Deletion:** Uses ES6 `Set` for $O(N + M)$ deletion on large date spans. | ✅ Fixed & Tested |
| **EDGE-4** | [`store.js:312`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/data/store.js#L312) | **Markdown Regex Guard:** Prioritizes matching fenced ```` ```json ```` blocks over arbitrary code blocks. | ✅ Fixed & Tested |
| **EDGE-5** | [`resetStreak.js:87-93`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/features/resetStreak.js#L87-L93) | **Duplicate Reset Logs:** Prevents redundant `resetLogs` entries when skipping multiple times on same date. | ✅ Fixed & Tested |
| **EDGE-6** | [`dashboardTemplate.js`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/ui/dashboardTemplate.js) / [`importFromNote.js`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/features/importFromNote.js) | **Unicode Emoji Regex:** Uses `\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u2600-\u27BF]`. | ✅ Verified & Tested |
| **IMP-4 / IMP-5** | [`constants.js:115-123`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/constants.js#L115-L123) | Monotonic counter added to `generateUniqueId` fallback to prevent millisecond collisions. | ✅ Fixed & Tested |
| **IMP-11** | [`resetStreak.js:210-216`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/lib/features/resetStreak.js#L210-L216) | Restores streak anchor timestamp on undo based on recalculated stats. | ✅ Fixed & Tested |

---

### 3. 🟢 Optional / Context-Dependent (Architectural / Non-blocking)
*These are stylistic or long-term architectural suggestions that do not affect runtime stability.*

- **EDGE-2 (Cross-embed concurrency queue):** Amplenote embed iframes are isolated sandboxes with separate memory contexts. The existing optimistic concurrency revision checks in `saveState` already handle collision rejection.
- **IMP-6 (`filterNotes({})` tag filter):** Amplenote's API can filter by tag, but data note UUID caching in plugin settings already minimizes note lookups after initial run.
- **IMP-7 (Splitting `dashboardTemplate.js`):** The 93KB template is standard for single-file embed bundling in Amplenote plugins.
- **IMP-8, IMP-9, IMP-10, IMP-12:** Nice polish items (soft habit limit, granular diff logs, HTML escaping on numeric fields), but non-blocking.

---

### 🏁 Verification Status
- **Test Suite:** **101 / 101 passing** (5 test suites)
- **Compilation:** `node esbuild.js 22` completed cleanly (`build/habit-streak.compiled.js`)
- **Regressions:** None detected; all previous scenarios and new edge-case tests pass 100%.