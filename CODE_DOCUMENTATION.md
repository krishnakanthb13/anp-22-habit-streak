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
                    │   - calculateAllHabitsSummary() │
                    │   - generateMonthCalendar()     │
                    └────────────────┬────────────────┘
                    │
                    ▼
                    ┌─────────────────────────────────┐
                    │   lib/ui/dashboardTemplate.js   │
                    │   - Main Overview Screen        │
                    │   - Counter Detail (Live Ticker)│
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
  - `SKIP`: Quitting / Bad habit model (Clean/done continuous streak unless a slip/reset is logged).
  - `COMPLETE`: Building / Good habit model (Intentional practice; streak grows only with daily check-in).
- `INTERVAL_PERIODS`: `{ DAY: "day" }` (Pure daily tracking model).
- `VALID_THEMES`: `["midnight", "glass", "dark", "light", "neon"]`.
- `VALID_EVENT_TYPES`: `["done", "skip", "slip", "reset", "calendar_edit"]`.
- `QUITLY_TIERS`: Array of 11 progressive milestone tiers (1d, 3d, 7d, 14d, 30d, 60d, 90d, 180d, 365d, 730d, 1825d).
- `QUITLY_TEMPLATES` & `AMPLENOTE_TEMPLATES`: Categorized preset templates for Quitting and Building.
- `COLOR_THEMES`: 8 gradient palette tokens.
- `generateUniqueId(prefix)`: Generates collision-resistant IDs using `crypto.randomUUID()` when available, falling back to a combination of base-36 timestamps, random entropy, and a monotonic counter (`_idCounter`) to prevent collisions during same-millisecond batch operations.

---

### `lib/data/store.js`
- **`inFlightNoteResolutions` & `inMemoryUUIDCache`**: In-flight Promise deduplication map and in-memory cache that serializes concurrent asynchronous note resolution requests, preventing race conditions from creating duplicate `habit_streak_data` notes on fresh installs.
- **`mutationQueue`**: In-process serialized execution promise queue ensuring all `load -> mutate -> save` transactions execute sequentially without race conditions.
- **`isValidTimestamp(ts)`**: Validates strict ISO 8601 strings, extracting date components and running strict calendar validation (`isValidDateString`) along with 24-hour time range checks (rejecting rollover dates like `2026-02-31T12:00:00Z`).
- **`normalizeHabit(habit)`**:
  - Enforces mutually exclusive sets: $\text{skips} \cap \text{completions} = \emptyset$ (with `skips` taking precedence).
  - Normalizes interval to `{ n: 1, period: "day" }`.
  - Normalizes `createdAt` and `streakAnchor` from `YYYY-MM-DD` to full ISO timestamps (`${d}T00:00:00.000Z`).
  - Constrains `colorTheme` to `COLOR_THEMES` and `type` to `TRACK_TYPES`.
  - Filters `events` to recognized `VALID_EVENT_TYPES` and bounds history to 500 entries (reset logs bounded to 100 entries).
- **`normalizeState(state)`**: Validates `version: 2`, integer `revision`, constrains `theme` to `VALID_THEMES`, and deduplicates identical habit IDs.
- **`isUninitializedContent(content)`**: Checks if raw note content represents an uninitialized or fresh note (empty, title headers `# habit_streak_data`, or comments without code blocks) rather than corrupted JSON data, allowing safe auto-seeding on fresh installs without false corruption alerts.
- **`loadStateWithStatus(app)`**: Resolves UUID (with concurrency locking and safe fallback when `app.settings` is undefined), reads note content, auto-seeds uninitialized notes, and returns `{ state, status: "ok"|"empty"|"corrupt"|"error", rawContent }`. On read/network failure, returns `status: "error"` and flags `state._isCorrupt = true` and `state._loadError = true`.
- **`extractJsonFromMarkdown(content)`**: Prioritizes extraction from fenced ```` ```json ```` code blocks before attempting generic code block or bare JSON parsing.
- **`loadState(app)`**: Loads current state with corruption protection (marks `state._isCorrupt = true` when JSON extraction fails on damaged code blocks).
- **`saveState(app, state, expectedRevision)`**: Verifies against `expectedRevision` before overwriting the note, preventing lost updates from concurrent runtimes/devices, and refuses to write if state is marked corrupt.
- **`mutateState(app, mutator)`**: Serialized transaction queue that blocks execution and refuses to overwrite if `status === "corrupt"` or `status === "error"`.

---

### `lib/engine/streakEngine.js`
- **`getDateRange(startStr, endStr)`**: Generates inclusive date sequences using UTC midnight date arithmetic, ensuring exact 86,400,000 ms increments immune to Daylight Saving Time (DST) 23h/25h shifts.
- **`isScheduledDate(habit, dateStr, refStartStr, allowBackdated)`**: Daily schedule evaluation; returns `true` for all dates $\ge \text{start}$ (or bidirectional when `allowBackdated = true`).
- **`getHabitDayStatus(habit, dateStr, todayStr, cachedSets)`**:
  - **Deterministic Status Evaluation**:
    1. Future (`dateStr > todayStr`) $\implies$ `future`
    2. Before start (`dateStr < habitStart`) $\implies$ `before_start`
    3. Explicit skips (`dateStr ∈ skips`) $\implies$ `skipped`
    4. Explicit completions (`dateStr ∈ completions`) $\implies$ `completed`
    5. Default philosophy fallback: `complete` habits $\implies$ `skipped`; `skip` habits $\implies$ `completed`.
- **`calculateHabitStats(habit, todayStr)`**: Computes contiguous current streak, longest record, completion rate, and verified sub-second anchor timestamp. Uniformly defensive against `null`/`undefined` habits.
- **`calculateTierProgress(currentStreak)`**: Computes active laurel tier, milestone percentage, and days remaining.
- **`calculateAllHabitsSummary(habits, todayStr)`**: Aggregates dashboard-level statistics.
- **`generateMonthCalendar(habit, year, month, todayStr)`**: Builds monthly calendar grid with interactive daily status dots and parameter bounds validation.

---

### `lib/features/`
- **`createHabit.js`**: Instantiates new custom counters and 1-click templates with initial `completions: []` for positive habits (streak = 0 until check-in).
- **`importFromNote.js`**: Multi-step note scanner extracting native Amplenote tasks and `- [ ]` markdown checkboxes into an interactive setup wizard with clean title sanitization and leading emoji extraction.
- **`editHabit.js`**: Edits counter metadata (name, emoji, color theme, tracking type) with proper `typeVal` validation.
- **`resetStreak.js`**:
  - `handleSkipToday`: Logs reset/slip with optional reflection note, updates live anchors, and records streak length before reset.
  - `handleCompleteToday`: Records positive completion check-in with optional reflection notes.
  - `handleResetToDate`: Backdates relapse / reset to a specified date using high-performance $O(N + M)$ `Set` operations.
  - `handleUndoToday`: Verifies an action event (`done`, `skip`, `slip`) exists today before modifying state, restores previous streak anchors based on recalculated stats, and preserves calendar-only edits.
- **`toggleDay.js`**:
  - `handleToggleDay`: Rejects toggling future dates (`dateStr > todayStr`) and safely flips between done and slip/reset for past and current days.
  - `handleSaveCalendarEdits`: Batch applies staged calendar changes, ensures mutual exclusivity, logs audit events only when changes occurred, and extends `trackingStartDate` only after validation passes.
- **`habitManagement.js`**: Safe deletion and tab switching.
- **`launcher.js`**: Opens embed in sidebar or main workspace.

---

### `lib/ui/dashboardTemplate.js`
- Full single-page client-side embedded application.
- **Pure Material Design SVG Iconography**: Replaced all UI emojis across navigation, action buttons, card headers, calendar controls, and badges with crisp, modern SVGs (`ICONS`). User-selected habit icons remain preserved.
- **Symmetrical Terminology & Grouping**:
  - Tabs: **`Quitting`** and **`Building`**.
  - Section Headers: **`Bad habits to quit`** and **`Good habits to build`**.
  - Actions: **`Reset counter today`** and **`Reset counter on date`**.
- **Responsive Theme Engine**: 5 visual appearance modes (`theme-midnight`, `theme-glass`, `theme-dark`, `theme-light`, `theme-neon`).
- **Live Digital Ticker**: Sub-second ticking counter (`[Days/Years/Months] [Hours] [Mins] [Secs]`).
- **Interactive Dot Calendar**: Full month interactive calendar with staged edit mode, quick actions (Mark Month Clean / Mark Month Missed), and visual feedback.
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

## 4. Invariant Test Matrix (103 Unit Tests across 5 Suites)

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
19. **Concurrent Resolution Locking**: `getNoteUUID` serializes concurrent note requests through in-flight Promise tracking, preventing duplicate note creation.
20. **Fresh-Install Auto-Seeding**: `loadStateWithStatus` initializes brand-new notes (even with title headers `# habit_streak_data`) without false corruption flags.
