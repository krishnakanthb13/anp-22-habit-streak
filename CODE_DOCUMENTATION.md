# Code Documentation: Habit Streaks Plugin (`anp-22-habit-streak`)

## 1. Overview & Architecture

The Habit Streaks Plugin runs as an Amplenote Embed Dashboard plugin. It uses an in-memory client-side state machine with an authoritative data note (`habit_streak_data` tagged `-reports/-habit-streak`) for persistence.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Amplenote Host Context                           │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
      ┌───────────────────────────┐     ┌───────────────────────────┐
      │   lib/data/store.js       │     │   habit-streak.js         │
      │   (Load/Save JSON note)   │     │   (App options & Actions) │
      └─────────────┬─────────────┘     └─────────────┬─────────────┘
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │   lib/engine/streakEngine.js    │
                    │   - calculateHabitStats()       │
                    │   - calculateTierProgress()     │
                    │   - calculateWeeklyFrequency()  │
                    │   - calculateAllHabitsSummary() │
                    └────────────────┬────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │   lib/ui/dashboardTemplate.js   │
                    │   - Main Screen (Segmented)     │
                    │   - Detail View (Ticker/Bars)   │
                    │   - Templates & Import Guide    │
                    │   - Settings & Sync Drawer      │
                    └─────────────────────────────────┘
```

---

## 2. Core Modules

### `lib/constants.js`
- `DATA_NOTE_NAME = "habit_streak_data"`
- `DATA_NOTE_TAGS = ["-reports/-habit-streak"]`
- `TRACK_TYPES = { SKIP: "skip", COMPLETE: "complete" }`
  - `SKIP`: Quitly auto-tracked model (Clean/done unless skipped).
  - `COMPLETE`: Amplenote intentional practice model (Done only when explicitly completed).
- `QUITLY_TIERS`: Array of 11 progressive milestone tiers (1d, 3d, 7d, 14d, 30d, 60d, 90d, 180d, 365d, 730d, 1825d).
- `QUITLY_TEMPLATES` & `AMPLENOTE_TEMPLATES`: Categorized preset templates.
- `COLOR_THEMES`: 8 gradient palette tokens.

### `lib/data/store.js`
- `loadState(app)`: Looks up note UUID from settings key `Habit_Streak_Data_UUID [Do not Edit!]`. If missing or note not found, searches/creates `habit_streak_data` with `-reports/-habit-streak` and persists UUID to plugin settings.
- `saveState(app, state)`: Formats state into `` ```json `` block and replaces content in the authoritative data note.

### `lib/engine/streakEngine.js`
- `getHabitDayStatus(habit, dateStr, todayStr)`: Determines day status (`completed` vs `skipped`) based on `habit.type`.
  - For `skip`: Clean/completed unless date is in `habit.skips`.
  - For `complete`: Skipped unless date is in `habit.completions`.
- `calculateHabitStats(habit, todayStr)`: Computes current streak, longest record, completion rate, and streak anchor timestamp for sub-second live ticking.
- `calculateTierProgress(currentStreak)`: Determines the user's active laurel tier, percentage progress, and remaining days.
- `calculateWeeklyFrequency(habit, todayStr)`: Computes log/repetition counts across the last 7 days for the weekly frequency bar chart.
- `calculateAllHabitsSummary(habits, todayStr)`: Aggregates metrics across all counters for the main dashboard view.

### `lib/features/`
- `createHabit.js`: Handles custom creation modal and 1-click template instantiation.
- `importFromNote.js`: 
  - Resolves note handle from `app.prompt({ type: "note" })` supporting single values, arrays, and markdown links.
  - Queries `app.getNoteTasks({ uuid }, { includeDone: true })` with fallback regex parser for checklist items (`- [ ]`, `- [x]`, `* [ ]`).
  - Normalizes single-input vs multi-input checkbox confirmations from `app.prompt`.
  - Runs an interactive per-task setup wizard allowing users to customize title, emoji, color theme, cadence, and choose between **Positive Habit** vs **Bad Habit / Abstinence**.
  - Activates newly imported habits immediately on the dashboard.
- `editHabit.js`: Edits existing counter properties.
- `resetStreak.js`: Handles `handleSkipToday`, `handleCompleteToday`, and `handleResetToDate` (logging reflection notes and timestamped multi-events).
- `toggleDay.js`: Handles single-day clicks and batch `handleSaveCalendarEdits` for in-calendar editing mode.
- `habitManagement.js`: Deletes counters and handles tab switching.
- `launcher.js`: Opens the habit embed in full or sidebar mode.

### `lib/ui/dashboardTemplate.js`
- Single-page client-side embedded application.
- Renders **Main View**, **Single Counter View**, **Templates & Import Catalog**, and **Settings & Theming View** with zero host roundtrips.
- **Vector Iconography (`ICONS`)**: Embedded SVG map (`chevronLeft`, `chevronRight`, `chevronDown`, `arrowLeft`, `close`, `checkCircle`, `lock`, `plus`, `externalLink`) replacing legacy text glyphs for crisp rendering across high-DPI displays.
- **Keyboard Navigation**: Global key listener supporting <kbd>←</kbd> / <kbd>→</kbd> / <kbd>&lt;</kbd> / <kbd>&gt;</kbd> for month navigation, and <kbd>Esc</kbd> / <kbd>Backspace</kbd> for rapid view dismissal.
- **In-Calendar Direct Edit Mode**: Enables click-to-stage toggle buffer with `✏️ Edit` / `💾 Save` controls in the calendar header.
- **Timestamped Activity History**: Displays exact formatted local timestamps for multiple check-ins and reset logs.
- **Collapsible In-App Guide**: Interactive accordion providing 3-step creation flow, dual tracking philosophy, and calendar mechanics.
- **Theme Engine**: Provides 5 visual appearance modes (`theme-midnight`, `theme-glass`, `theme-dark`, `theme-light`, `theme-neon`) utilizing CSS custom property cascading with cross-device sync.
- **Support Developer Integration**: Direct developer patronage callout linking to `https://krishnakanthb13.github.io/S/`.
- Runs the 1-second interval live digital sub-clock ticker (`[Days] [Hours] [Mins] [Secs]`).

---

## 3. Data Schema

The persistent JSON stored in `habit_streak_data` has the following schema:

```json
{
  "version": 1,
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
      "streakAnchor": "2026-08-01T00:00:00.000Z",
      "skips": ["2026-08-05"],
      "completions": [],
      "events": [
        { "type": "skip", "date": "2026-08-05", "timestamp": "2026-08-05T14:30:00.000Z" }
      ],
      "resetLogs": [
        {
          "date": "2026-08-05",
          "streakLength": 4,
          "note": "Attended dinner party, resolved to restart",
          "timestamp": "2026-08-05T14:30:00.000Z"
        }
      ]
    }
  ]
}
```

