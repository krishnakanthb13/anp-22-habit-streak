# Habit Streaks Plugin (Beautiful Streaks & Days-Since Counter)

> A modern, high-fidelity habit and streak tracking plugin for Amplenote with Quitly-inspired dual philosophy (Break Bad Habits vs Build Positive Habits), real-time live digital tickers, 7-day repeatingness bar charts, interactive monthly dot calendars, tiered milestone badges, and reflection history logging.

Icon: `local_fire_department`  
Author: [Krishna Kanth B](https://github.com/krishnakanthb13)  
Repository: [amplenote_stg_plugins/anp-22-habit-streak](https://github.com/krishnakanthb13/amplenote_stg_plugins)

---

## ⚡ Quick Start

1. **Create a Plugin Note**: Create a new note in Amplenote named `Habit Streaks Plugin`.
2. **Setup Metadata Table**: At the top of the note, insert a table:

| Field | Value |
| :--- | :--- |
| `name` | Habit Streaks |
| `description` | Beautiful habit streak counter with interactive calendar, live ticker, and milestone tiers. |
| `icon` | `local_fire_department` |
| `setting` | `Habit_Streak_Data_UUID [Do not Edit!]` |

3. **Insert Code Block**: Below the table, insert a Javascript code block (```` ```javascript ````).
4. **Paste Compiled Code**: Copy the bundle from [`habit-streak.compiled.js`](https://github.com/krishnakanthb13/amplenote_stg_plugins/blob/main/anp-22-habit-streak/build/habit-streak.compiled.js) and paste it inside the code block.
5. **Open Dashboard**: Run the app option or open the embedded habit dashboard.

---

## 🚀 Key Features

### 1. Dual Habit Philosophy
- **🛡️ Break Bad Habits / Sobriety (Quitly Style)**:
  - Default: Passive auto-tracking. Days count up automatically as long as you stay clean.
  - Interaction: Only check in to log a slip/relapse with an optional reflection note.
  - Phrasing: *"Clean & sober for"*, *"🛡️ Clean Today (Auto-Tracked)"*.
- **🎯 Build Positive Daily Habits (Amplenote Style)**:
  - Default: Action-based practice requiring daily intentional completion.
  - Interaction: Tap *"Mark Done Today"* to build your streak. Supports multiple session check-ins per day.
  - Phrasing: *"Continuous unbroken streak"*, *"⏳ Pending Check-In"* / *"✅ Completed for Today!"*.

### 2. Main Screen Segmentation
- **Segmented Filter Bar**: Filter between `[ All ]`, `[ 🛡️ Quitting ]`, and `[ 🎯 Positive Habits ]`.
- **Vibrant Gradient Pill Cards**: 8 curated gradient themes (Amber, Rose, Sky Blue, Emerald, Purple, Bronze, Teal, Indigo) displaying formatted duration (`2 mths, 3 days`), custom emoji icon, and status badge.

### 3. Live Digital Ticker Hero Banner
- 4-Column real-time ticking sub-clock: **`[Days]` `[Hours]` `[Minutes]` `[Seconds]`** live ticking sub-clock.
- Unit toggles `[Y] [M] [D]`.

### 4. Goals & Tier Milestones
- **Quitly Laurel Tier Card**: `🌿 Tier X / 30 days`, animated blue progress fill bar, `% completed`, and `X days left`.
- **3-Column All Goals Checklist**: Grid displaying unlocked (`☑`) vs locked (`🔒`) tiers from 1 Day to 5 Years.

### 5. Multi-Event Tracking & 7-Day Frequency Chart
- Log multiple completions or slips for the same day.
- **7-Day Repeatingness Bar Chart**: Visualizes daily action frequency over the past week with total weekly count.

### 6. Interactive Monthly Activity Calendar
- Clean dot calendar with month navigation (`‹ Month Year ›`).
- Color-coded: Green for completed, Red for skipped/relapsed.
- Tap any past or current day to toggle completion state.

### 7. Reset Counters with Reflection Notes
- When logging a relapse or backdating skips, add an optional reflection reason note.
- **`📝 Reset & Reflection History`**: Chronological log of past streaks, reset dates, and reflection notes.

### 8. Recommended Counter Templates
- Categorized template catalog for 1-click creation:
  - **🛡️ Quitting**: *I am Sober (Alcohol)*, *No Smoking*, *No Junk Food*, *No Refined Sugar*, *Without Caffeine*, *No Social Media*, *No Impulse Shopping*.
  - **🎯 Positive Habits**: *Daily Workout*, *Daily Reading*, *Morning Meditation*, *Drink 2L Water*, *Daily Journaling*, *Deep Work Session*.

### 9. Zero-Lag Note Syncing
- Synchronization with the authoritative `habit_streak_data` note is strictly scoped to:
  1. Opening the dashboard.
  2. Mutating state (create/edit/delete/toggle/skip/reset).
  3. Manual refresh (`🔄 Force Refresh from Note`).
- Tab navigation and month switching run 100% in-memory with 0ms delay.

---

## 🛠️ Configuration & Settings

| Setting Key | Description | Default |
| :--- | :--- | :--- |
| `Habit_Streak_Data_UUID [Do not Edit!]` | Holds the UUID of the authoritative `habit_streak_data` note. | Auto-populated on initial load |

---

## 📁 Technical Architecture

- [`habit-streak.js`](./habit-streak.js): Plugin entry point and action router.
- [`lib/constants.js`](./lib/constants.js): Core constants, 11 milestone tiers, and categorized templates.
- [`lib/data/store.js`](./lib/data/store.js): Read/write parser for the `habit_streak_data` note.
- [`lib/engine/streakEngine.js`](./lib/engine/streakEngine.js): Mathematical calculations for continuous streaks, milestone tiers, and 7-day frequencies.
- [`lib/features/`](./lib/features/): Modular action handlers (`createHabit.js`, `editHabit.js`, `resetStreak.js`, `toggleDay.js`, `importFromNote.js`).
- [`lib/ui/dashboardTemplate.js`](./lib/ui/dashboardTemplate.js): Quitly-styled single-sheet responsive UI template.

---

## 📄 License

GNU General Public License v3.0 (GPL-3.0). See [`LICENSE`](./LICENSE) for details.