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

---

### `lib/data/store.js`
- **`mutationQueue`**: In-process serialized execution promise queue ensuring all `load -> mutate -> save` transactions execute sequentially without race conditions.
- **`isValidTimestamp(ts)`**: Validates strict ISO 8601 strings (`/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/` and `!isNaN(Date)`).
- **`normalizeHabit(habit)`**:
  - Enforces mutually exclusive sets: $\text{skips} \cap \text{completions} = \emptyset$ (with `skips` taking precedence).
  - Normalizes `createdAt` and `streakAnchor` from `YYYY-MM-DD` to full ISO timestamps (`${d}T00:00:00.000Z`).
  - Constrains `colorTheme` to `COLOR_THEMES` and `type` to `TRACK_TYPES`.
  - Filters `events` to only recognized `VALID_EVENT_TYPES`.
- **`normalizeState(state)`**: Validates `version: 2`, integer `revision`, and constrains `theme` to `VALID_THEMES`.
- **`loadState(app)`**: UUID resolution with settings cache, tag/name fallback search, automatic UUID recovery, and **malformed data protection** (refuses to overwrite corrupted notes).
- **`saveStateOrThrow(app, state)`**: Writes formatted JSON note markdown block with revision counter incrementation.

---

### `lib/engine/streakEngine.js`
- **`isValidDateString(val)`**: Strict calendar date validator ensuring string matches `YYYY-MM-DD` and corresponds to a genuine calendar date (e.g. rejecting `2026-02-30`).
- **`isScheduledDate(habit, dateStr, refStartStr, allowBackdated)`**:
  - Validates recurrence cadence for Daily ($N=1$), Every $N$ Days, Weekly (same weekday $\text{diffWeeks} \pmod N = 0$), and Monthly (same clamped day-of-month $\text{diffMonths} \pmod N = 0$).
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
- **`calculateHabitStats(habit, todayStr)`**: Computes current streak, longest record, completion rate, and verified sub-second anchor timestamp.
- **`calculateTierProgress(currentStreak)`**: Computes active laurel tier, milestone percentage, and days remaining.
- **`calculateWeeklyFrequency(habit, todayStr)`**: Calculates 7-day repetition counts for frequency bar charts.
- **`calculateAllHabitsSummary(habits, todayStr)`**: Aggregates dashboard-level statistics.
- **`generateMonthCalendar(habit, year, month, todayStr)`**: Builds calendar grid days with off-day classification.

---

### `lib/features/`
- **`createHabit.js`**: Instantiates new custom counters and 1-click templates with initial `completions: []` for positive habits (streak = 0 until check-in).
- **`importFromNote.js`**: Multi-step note scanner extracting native Amplenote tasks and `- [ ]` markdown checkboxes into an interactive setup wizard.
- **`editHabit.js`**: Edits counter metadata with schedule and input validation.
- **`resetStreak.js`**:
  - `handleSkipToday`: Logs slip with optional reflection note and updates reset logs.
  - `handleCompleteToday`: Records positive completion event.
  - `handleResetToDate`: Backdates relapse, applying skips **only** to scheduled dates in the range.
  - `handleUndoToday`:
    - Filters specifically for check-in action events (`done`, `skip`, `slip`), preserving audit events (`calendar_edit`).
    - Reconstructs today's date state from remaining check-in events.
    - Removes `resetLog` only if the undone event was a slip/skip.
- **`toggleDay.js`**:
  - `handleToggleDay`: **Invariant-First Anchor Validation** — validates against existing `scheduleAnchor` before mutating `trackingStartDate`. Rejects toggling off-days.
  - `handleSaveCalendarEdits`: Filters out non-scheduled dates, ensures mutual exclusivity, logs audit events only when changes occurred, and extends `trackingStartDate` only after validation passes.
- **`habitManagement.js`**: Safe deletion and tab switching.
- **`launcher.js`**: Opens embed in sidebar or main workspace.

---

### `lib/ui/dashboardTemplate.js`
- Full single-page client-side embedded application.
- **Responsive Theme Engine**: 5 visual appearance modes (`theme-midnight`, `theme-glass`, `theme-dark`, `theme-light`, `theme-neon`).
- **Calendar Dot Matrix**: Visual off-day isolation (`off-day` class), disabling clicks on `not_applicable` days during edit mode.
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

## 4. Invariant Test Matrix (84 Unit Tests)

The test suite in [`test/ds_scenarios.test.js`](./test/ds_scenarios.test.js) verifies 18 design-spec scenarios and 13 core behavioral invariants:
1. **Off-Day Isolation**: Non-scheduled days cannot be transformed into scheduled days by skips or completions.
2. **Range Reset Filtering**: `handleResetToDate` skips only scheduled days within the range.
3. **Mutual Exclusivity**: $\text{skips} \cap \text{completions} = \emptyset$ at the normalization boundary.
4. **Strict Date Validation**: `isValidDateString` strictly rejects invalid calendar days (e.g. `2026-02-30`).
5. **Theme Normalization**: Host and habit themes are validated against `VALID_THEMES` and `COLOR_THEMES`.
6. **Multi-Event Undo Reconstruction**: Undoing one of multiple today actions restores the date state from the remaining event.
7. **Off-Day Toggle Rejection**: `handleToggleDay` rejects toggling `not_applicable` dates.
8. **Defensive Scheduling Fallback**: `isScheduledDate` returns `false` on any invalid/NaN input.
9. **Schedule Anchor Preservation**: Backdated off-days cannot redefine the recurrence anchor; backdated scheduled occurrences safely extend `trackingStartDate`.
10. **Action Undo vs Audit Isolation**: Undoing check-in actions preserves `calendar_edit` audit records and only removes matching `resetLog` records.
11. **Strict ISO 8601 Validation**: `isValidTimestamp` strictly validates ISO 8601 formatting and parseability.
12. **Event Schema Filtering**: `normalizeHabit` drops unrecognized event types.
13. **Calendar-Edit vs Undo Contract**: "Undo Today" operates specifically on daily check-in actions while preserving the full calendar audit history.
