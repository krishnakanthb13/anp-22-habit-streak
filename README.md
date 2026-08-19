# Habit Streak Plugin (Beautiful Streaks)

A feature-rich habit and streak tracking plugin for Amplenote with Quitly-inspired streak philosophy, live ticking counters, interactive monthly calendar widgets, tiered milestone goals, and all-time progress analytics.

Icon: `local_fire_department`

## Installation

1. **Create a Plugin Note**: Create a new note in Amplenote named "Habit Streaks Plugin".
2. **Setup Metadata Table**: At the top of the note, create a table with the following rows:

| Field | Value |
| :--- | :--- |
| `name` | Habit Streaks |
| `description` | Beautiful habit streak counter with interactive calendar, live ticker, and milestone tiers. |
| `icon` | local_fire_department |
| `setting` | Habit_Streak_Data_UUID [Do not Edit!] |

3. **Insert Code Block**: Below the table, create a single Javascript code block (type ` ```javascript `).
4. **Paste Compiled Code**: Copy the content from `build/habit-streak.compiled.js` and paste it inside the code block.
5. **Activate**: Go to **Account Settings** -> **Plugins**, and select the note you just created.

## Key Features

- **Quitly Streak Philosophy (Skip-Tracked Default)**: Habits are considered completed every day unless you explicitly mark them as skipped.
- **Top Habit Tab Bar**: Seamlessly switch between tracked habits, create new habits, or import recurring tasks directly from notes.
- **Authoritative Data Note (`habit_streak_data`)**: Stores all habit definitions, intervals, and overrides cleanly in JSON format inside a code block.
- **Live Continuous Streak Clock**: Digital ticker (`Days : Hours : Minutes : Seconds`) calculating real-time streak progress from the anchor timestamp.
- **Interactive Monthly Calendar**:
  - Emerald green cells for completed days, red/slate for skipped days, dashed for future days.
  - Horizontal month navigation.
  - Interactive click-to-toggle (`Complete` ↔ `Skip`) for past and present days.
- **Reset / Skip Controls**:
  - "Skip Today": Mark the current day as skipped with one click.
  - "Mark Done Today": Mark today complete.
  - "Reset / Backdate Skips": Select a past date to backfill skips up to today.
- **Tiered Milestone Goals**: Visual badge milestones (1d, 3d, 1w, 2w, 1m, 2m, 3m, 6m, 1y, 2y, 5y) with animated progress bars and remaining day counters.
- **All-Time Overview**: Live statistics for Current Streak, Longest All-Time Streak, Total Tracked Days, and Overall Completion Rate (%).

## Technical Architecture

- **`lib/constants.js`**: Core configuration constants and Quitly milestone tier definitions.
- **`lib/data/store.js`**: Handles reading/writing the JSON code block in the `habit_streak_data` note.
- **`lib/engine/streakEngine.js`**: Math logic for calculating continuous streaks, month calendar grids, and tiered milestone progress.
- **`lib/features/`**: Modular action handlers for habit creation, note task importing, day toggles, and streak resets.
- **`lib/ui/dashboardTemplate.js`**: Adaptive HTML/CSS/JS template for the isolated embed dashboard.