# Code Documentation: Habit Streaks Plugin (`anp-22-habit-streak`)

## 1. Overview & Architecture

The Habit Streaks Plugin runs as an interactive Amplenote Embed Dashboard plugin. It combines an in-memory client-side reactive state engine with an authoritative persistent JSON data note (`habit_streak_data` tagged `-reports/-habit-streak`).

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Amplenote Host Context                           │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
      ┌───────────────────────────┐     ┌───────────────────────────┐
      │   lib/data/store.js       │     │   habit-streak.js         │
      │   - loadState/saveState   │     │   - Embed Handlers        │
      │   - mutationQueue         │     │   - Action Router         │
      │   - normalizeHabit/State  │     │   - setTheme/onEmbedCall  │
      └─────────────┬─────────────┘     └─────────────┬─────────────┘
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │   lib/engine/streakEngine.js    │
                    │   - isScheduledDate()           │
                    │   - getHabitDayStatus()         │
                    │   - calculateHabitStats()       │
                    │   - calculateTierProgress()     │
                    │   - calculateWeeklyFrequency()  │
                    │   - calculateAllHabitsSummary() │
                    └────────────────┬────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │   lib/ui/dashboardTemplate.js   │
                    │   - Main Overview Screen        │
                    │   - Counter Detail (Ticker/Bars)│
                    │   - Interactive Dot Calendar    │
                    │   - Multi-Action Timeline Log   │
                    │   - Themes & Settings Drawer    │
                    └─────────────────────────────────┘
```

---

## 2. Core Modules & Subsystems

### `lib/constants.js`
- `DATA_NOTE_NAME = "habit_streak_data"`
- `DATA_NOTE_TAGS = ["-reports/-habit-streak"]`
- `TRACK_TYPES`:
  - `SKIP`: Quitly auto-tracked model (Clean/done unless skipped).
  - `COMPLETE`: Amplenote intentional practice model (Done only when explicitly completed).
- `INTERVAL_PERIODS`: `{ DAY: "day", WEEK: "week", MONTH: "month" }`.
- `VALID_THEMES`: `["midnight", "glass", "dark", "light", "neon"]`.
- `VALID_EVENT_TYPES`: `["done", "skip", "slip", "reset", "calendar_edit"]`.
- `QUITLY_TIERS`: Array of 11 progressive milestone tiers (1d, 3d, 7d, 14d, 30d, 60d, 90d, 180d, 365d, 730d, 1825d).
- `QUITLY_TEMPLATES` & `AMPLENOTE_TEMPLATES`: Categorized preset templates.
- `COLOR_THEMES`: 8 gradient palette tokens.
- `generateUniqueId(prefix)`: Generates collision-resistant IDs using `crypto.randomUUID()` when available, falling back to a combination of base-36 timestamps, random entropy, and a monotonic counter (`_idCounter`) to prevent collisions during same-millisecond batch operations.

---

### `lib/data/store.js`
- **`mutationQueue`**: In-process serialized execution promise queue ensuring all `load -> mutate -> save` transactions execute sequentially without race conditions.
- **`isValidTimestamp(ts)`**: Validates strict ISO 8601 strings, extracting date components and running strict calendar validation (`isValidDateString`) along with 24-hour time range checks (rejecting rollover dates like `2026-02-31T12:00:00Z`).
- **`normalizeHabit(habit)`**:
  - Enforces mutually exclusive sets: $\text{skips} \cap \text{completions} = \emptyset$ (with `skips` taking precedence).
  - Normalizes `createdAt` and `streakAnchor` from `YYYY-MM-DD` to full ISO timestamps (`${d}T00:00:00.000Z`).
  - Constrains `colorTheme` to `COLOR_THEMES` and `type` to `TRACK_TYPES`.
  - Filters `events` to recognized `VALID_EVENT_TYPES` and bounds history to 500 entries (reset logs bounded to 100 entries).
- **`normalizeState(state)`**: Validates `version: 2`, integer `revision`, constrains `theme` to `VALID_THEMES`, and deduplicates identical habit IDs.
- **`loadStateWithStatus(app)`**: Resolves UUID (with safe handling when `app.settings` is undefined), reads note content, and returns `{ state, status: "ok"|"empty"|"corrupt"|"error", rawContent }`. On read/network failure, returns `status: "error"` and flags `state._isCorrupt = true` and `state._loadError = true`.
- **`extractJsonFromMarkdown(content)`**: Prioritizes extraction from fenced ```` ```json ```` code blocks before attempting generic code block or bare JSON parsing.
- **`loadState(app)`**: Loads current state with corruption protection (marks `state._isCorrupt = true` when JSON extraction fails).
- **`saveState(app, state, expectedRevision)`**: Verifies against `expectedRevision` before overwriting the note, preventing lost updates from concurrent runtimes/devices, and refuses to write if state is marked corrupt.
- **`mutateState(app, mutator)`**: Serialized transaction queue that blocks execution and refuses to overwrite if `status === "corrupt"` or `status === "error"`.

---

### `lib/engine/streakEngine.js`
- **`getDateRange(startStr, endStr)`**: Generates inclusive date sequences using UTC midnight date arithmetic, ensuring exact 86,400,000 ms increments immune to Daylight Saving Time (DST) 23h/25h shifts.
- **`isScheduledDate(habit, dateStr, refStartStr, allowBackdated)`**:
  - Validates recurrence cadence for Daily ($N=1$), Every $N$ Days, Weekly (same weekday $\text{diffWeeks} \pmod N = 0$), and Monthly (same clamped day-of-month $\text{diffMonths} \pmod N = 0$).
  - Evaluates day differences using UTC timestamps (`(target.getTime() - start.getTime()) / 86400000`) and UTC methods (`getUTCDay()`, `getUTCMonth()`, `getUTCDate()`) for cross-timezone and DST invariance.
  - Supports bidirectional grid calculation against the anchor date when `allowBackdated = true`.
  - Defensive fallback: returns `false` on any parsing or NaN error.
- **`getHabitDayStatus(habit, dateStr, todayStr, cachedSets)`**:
  - **Schedule-First Evaluation Ordering**:
    1. Future (`dateStr > todayStr`) $\implies$ `future`
    2. Before start (`dateStr < habitStart`) $\implies$ `before_start`
    3. Recurrence check (`!isScheduledDate(...)`) $\implies$ `not_applicable`
    4. Explicit skips (`dateStr ∈ skips`) $\implies$ `skipped`
    5. Explicit completions (`dateStr ∈ completions`) $\implies$ `completed`
    6. Default philosophy fallback: `complete` habits $\implies$ `skipped`; `skip` habits $\implies$ `completed`.
- **`calculateHabitStats(habit, todayStr)`**: Computes current streak, longest record, completion rate, and verified sub-second anchor timestamp. Uniformly defensive against `null`/`undefined` habits.
- **`calculateTierProgress(currentStreak)`**: Computes active laurel tier, milestone percentage, and days remaining.
- **`calculateWeeklyFrequency(habit, todayStr)`**: Calculates 7-day repetition counts for frequency bar charts using UTC date windows (defensive against `null` habits).
- **`calculateAllHabitsSummary(habits, todayStr)`**: Aggregates dashboard-level statistics.
- **`generateMonthCalendar(habit, year, month, todayStr)`**: Builds calendar grid days with off-day classification and parameter bounds validation.

---

### `lib/features/`
- **`createHabit.js`**: Instantiates new custom counters and 1-click templates (with `parseInt` and bounds checking on `templateIndex`) with initial `completions: []` for positive habits (streak = 0 until check-in).
- **`importFromNote.js`**: Multi-step note scanner extracting native Amplenote tasks and `- [ ]` markdown checkboxes into an interactive setup wizard:
  - **Task Discovery & Fallback**: Attempts `app.getNoteTasks({ uuid }, { includeDone: true })`, falling back to line-by-line regex scanning (`/^\s*[-*]?\s*\[\s*[xX]?\s*\]\s*(.+)/`) if `getNoteTasks` is unavailable.
  - **`cleanTaskTitle(raw)` Pipeline**:
    1. *Multi-line Normalization*: Extracts the primary first line (`raw.split(/\r?\n/)[0].trim()`), omitting indented subtasks and context notes.
    2. *Checkbox Marker Stripping*: Strips `- [ ]`, `* [x]`, etc.
    3. *Image Embed Removal*: Strips markdown image tags `![alt](url)` and reference images `![alt][ref]`.
    4. *Markdown Link Unwrapping*: Converts `[Link Text](url)` to clean display label `Link Text`.
    5. *Wiki-link Conversion*: Converts transclusions/note links `[[Note Title]]` to `Note Title`.
    6. *HTML Tag Stripping*: Removes raw HTML tags `<tag>...</tag>`.
    7. *Format Marker Removal*: Strips `**bold**`, `*italic*`, `~~strikethrough~~`, and `` `code` `` wrappers.
    8. *Hashtag Cleaning*: Strips trailing filtering hashtags (e.g., `#habit`, `#daily`).
    9. *Whitespace Normalization*: Collapses multiple whitespace to single spaces.
  - **`extractTaskEmojiAndTitle(text, defaultEmoji)`**: Scans for leading Unicode pictographic/presentation emojis using `\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u2600-\u27BF]`, auto-populating the emoji selector and assigning the remaining clean string as the habit title.
  - **Batch Limit Notification**: Displays `Showing first 25 of N` if note contains $> 25$ tasks.
  - **Baseline Consistency**: Initializes positive habits with `completions: []` (0-day streak until check-in), matching `createHabit.js`.
- **`editHabit.js`**: Edits counter metadata with proper `typeVal` validation. Prompts for explicit user confirmation if cadence or tracking philosophy is altered on habits with existing history to prevent accidental historical streak recalculation.
- **`resetStreak.js`**:
  - `handleSkipToday`: Enforces `isScheduledDate` check, logs slip with optional reflection note, prevents duplicate `resetLogs` entries for same-day skips, and updates live anchors.
  - `handleCompleteToday`: Enforces `isScheduledDate` check, records positive completion event.
  - `handleResetToDate`: Backdates relapse, applying skips **only** to scheduled dates in the range using high-performance $O(N + M)$ `Set` operations.
  - `handleUndoToday`: Verifies an action event (`done`, `skip`, `slip`) exists today before modifying state, restores previous streak anchors based on recalculated stats, and preserves calendar-only edits.
- **`toggleDay.js`**:
  - `handleToggleDay`: **Invariant-First Anchor Validation** — validates against existing `scheduleAnchor` before mutating `trackingStartDate`. Rejects toggling off-days.
  - `handleSaveCalendarEdits`: Filters out non-scheduled dates, ensures mutual exclusivity, logs audit events only when changes occurred, and extends `trackingStartDate` only after validation passes.
- **`habitManagement.js`**: Safe deletion and tab switching.
- **`launcher.js`**: Opens embed in sidebar or main workspace.

---

### `lib/ui/dashboardTemplate.js`
- Full single-page client-side embedded application.
- **Responsive Theme Engine**: 5 visual appearance modes (`theme-midnight`, `theme-glass`, `theme-dark`, `theme-light`, `theme-neon`).
- **Off-Schedule Rest Day Display**: Renders `☕ Off-Schedule / Rest Day` badge and suppresses active check-in buttons when `statusToday === "not_applicable"`.
- **Calendar Save Invariant**: Updates `trackingStartDate` rather than mutating immutable `createdAt`.
- **Audit Timeline**: Dedicated ✏️ *Calendar History Edited* badge distinguishing administrative audit events from slips.
- **Live Digital Ticker**: Sub-second ticking counter (`[Days] [Hours] [Mins] [Secs]`).
- **Keyboard Navigation**: <kbd>←</kbd> / <kbd>→</kbd> for months, <kbd>Esc</kbd> / <kbd>Backspace</kbd> for navigation.

---

## 3. Data Schema (`version: 2`)

The persistent JSON stored in `habit_streak_data` conforms to the following schema:

```json
{
  "version": 2,
  "revision": 14,
  "theme": "midnight",
  "activeHabitId": "habit_1724000000000_abc12",
  "habits": [
    {
      "id": "habit_1724000000000_abc12",
      "name": "I am Sober",
      "icon": "🍷",
      "type": "skip",
      "colorTheme": "blue",
      "interval": {
        "n": 1,
        "period": "day"
      },
      "createdAt": "2026-08-01T00:00:00.000Z",
      "trackingStartDate": "2026-08-01",
      "streakAnchor": "2026-08-01T00:00:00.000Z",
      "streakStartedAt": "2026-08-01T00:00:00.000Z",
      "skips": ["2026-08-05"],
      "completions": [],
      "events": [
        {
          "id": "event_1724000000000_def34",
          "type": "skip",
          "date": "2026-08-05",
          "timestamp": "2026-08-05T14:30:00.000Z",
          "note": "Slip at dinner party"
        }
      ],
      "resetLogs": [
        {
          "id": "reset_1724000000000_ghi56",
          "date": "2026-08-05",
          "streakLength": 4,
          "note": "Slip at dinner party",
          "timestamp": "2026-08-05T14:30:00.000Z"
        }
      ]
    }
  ]
}
```

---

## 4. Invariant Test Matrix (101 Unit Tests across 5 Suites)

The test suite in [`test/`](./test/) verifies complete behavioral integrity:
1. **Off-Day Isolation**: Non-scheduled days cannot be transformed into scheduled days by skips or completions.
2. **Range Reset Filtering**: `handleResetToDate` skips only scheduled days within the range with $O(N + M)$ performance.
3. **Mutual Exclusivity**: $\text{skips} \cap \text{completions} = \emptyset$ at the normalization boundary.
4. **Strict Date Validation**: `isValidDateString` strictly rejects invalid calendar days (e.g. `2026-02-30`).
5. **Theme Normalization**: Host and habit themes are validated against `VALID_THEMES` and `COLOR_THEMES`.
6. **Multi-Event Undo Reconstruction**: Undoing one of multiple today actions restores the date state from the remaining event and re-anchors streak timestamps.
7. **Off-Day Toggle Rejection**: `handleToggleDay` rejects toggling `not_applicable` dates.
8. **Defensive Scheduling Fallback**: `isScheduledDate` returns `false` on any invalid/NaN input.
9. **Schedule Anchor Preservation**: Backdated off-days cannot redefine the recurrence anchor; backdated scheduled occurrences safely extend `trackingStartDate`.
10. **Action Undo vs Audit Isolation**: Undoing check-in actions preserves `calendar_edit` audit records and only removes matching `resetLog` records.
11. **Strict ISO 8601 Validation**: `isValidTimestamp` strictly validates ISO 8601 formatting, parseability, and calendar ranges.
12. **Event Schema Filtering**: `normalizeHabit` drops unrecognized event types and limits history bounds.
13. **Calendar-Edit vs Undo Contract**: "Undo Today" operates specifically on daily check-in actions while preserving the full calendar audit history.
14. **Corruption & Read Error Protection**: `mutateState` blocks all writes when data note content fails JSON parsing or read errors occur.
15. **Optimistic Concurrency**: `saveState` detects and rejects writes when persisted note revision > expected revision.
16. **UTC Daylight Saving Invariance**: Date range and cadence calculations execute over UTC midnight timestamps to eliminate seasonal 23h/25h offsets.
17. **Corrupt State Banner**: `renderEmbed` renders a prominent error banner when data note parsing fails.
18. **Defensive Bootstrap Settings**: `getNoteUUID` safely falls back when `app.settings` is undefined.
