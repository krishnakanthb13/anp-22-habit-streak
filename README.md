# Habit Streaks Plugin (Beautiful Streaks & Days-Since Counter)

> A modern, high-fidelity habit and streak tracking plugin for Amplenote with Quitly-inspired dual philosophy (Break Bad Habits vs Build Positive Habits), flexible recurrence (Daily, Every N Days, Weekly, Monthly), real-time live digital tickers, 7-day repeatingness bar charts, interactive monthly dot calendars, tiered milestone badges, per-task import wizard, non-destructive undo, and robust reflection history logging.

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
5. **Open Dashboard**: Run the app option (`Open Dashboard`).

---

## 📖 User Guide: How to Use

### 1. Adding a New Habit Counter
Tap the **`+`** button in the top header or navigate to **Templates**. You have 3 intuitive options:
* **Option A: 1-Click Templates**: Browse curated presets (*I am Sober*, *No Smoking*, *Daily Workout*, *Meditation*, etc.) and tap `+` to add immediately.
* **Option B: Custom Counter**: Tap **`+ Create a Custom Counter`** to define your own habit name, emoji icon, gradient color theme, tracking philosophy, and cadence.
* **Option C: Import Tasks from Any Note**: Tap **`📥 Import Tasks from Note`**.

### 2. Step-by-Step Note Import Wizard
When importing tasks from your existing Amplenote notes:
1. **Select Source Note**: A dialog appears to select the note containing your tasks or checklist items.
2. **Select Tasks**: Check the tasks you want to track from the discovered list (supports both native tasks and `- [ ]` markdown checkboxes; automatically sanitizes images, links, formatting, and multi-line notes).
3. **Configure Each Habit**: For each selected task, an interactive setup wizard opens pre-filled with the task's cleaned title:
   * **Smart Emoji Detection**: Automatically extracts leading emojis (e.g. `🏃 5km Run` -> emoji `🏃`, title `5km Run`).
   * **Tracking Philosophy**: Choose whether this is a **`✨ Positive Habit`** (done when checked in) or a **`🛡️ Bad Habit / Abstinence`** (auto-done unless skipped).
   * **Emoji Icon**: Assign or keep the detected emoji (🏃, 📚, 🧘, 🔥, 🍷, etc.).
   * **Color Theme**: Choose from 8 vibrant gradients (Emerald, Sky Blue, Indigo, Teal, Purple, Amber, Rose, Bronze).
   * **Recurrence Cadence**: Set schedule (*Every 1 Day*, *Every 2 Days*, *Every 1 Week*, *Every 1 Month*).
4. **Immediate Activation**: The newly imported habit opens directly on your dashboard with a clean 0-day baseline.

### 3. Understanding the Dual Tracking Philosophies
* **🛡️ Bad Habits & Sobriety (Quitly Style)**:
  * **Concept**: You are succeeding every single second simply by staying clean (e.g. *No Alcohol*, *No Smoking*, *No Junk Food*).
  * **Interaction**: Auto-tracked! Days count up continuously without requiring daily check-ins.
  * **When a slip occurs**: Tap **`🚨 Log Slip / Reset Today`** or **`🔄 Backdate Relapse Date with Note`** to record your reflection note.
* **🎯 Positive Daily Habits (Amplenote Style)**:
  * **Concept**: Intentional practices that require physical effort (e.g. *Exercise*, *Reading*, *Meditation*).
  * **Interaction**: Tap **`✅ Mark Done Today`** each day to advance your streak. Supports multiple check-ins per day.
  * **Creation Baseline**: Positive habits start at 0 days completed until your first check-in.

### 4. Recurrence Schedules & Off-Day Isolation
* Supports **Daily**, **Every N Days**, **Weekly** (e.g. Every Monday), and **Monthly** (same day of month) recurrence.
* **Off-Day Immunity**: Non-scheduled calendar days are classified as `not_applicable` and are visually disabled in the calendar. They never break your streak, never contribute false missed days, and cannot be corrupted by manual edits.
* **Invariant-First Backdating**: Backdating an entry validates against the established schedule grid before extending the start date, preventing accidental weekday cadence drift.

### 5. Interactive Monthly Calendar & Keyboard Navigation
* View any month using the smooth navigation buttons with modern vector icons (`←` / `→`).
* **Keyboard Shortcuts**: Navigate months instantly with <kbd>←</kbd> / <kbd>→</kbd> or <kbd>&lt;</kbd> / <kbd>&gt;</kbd>; press <kbd>Esc</kbd> or <kbd>Backspace</kbd> to return to the counters overview.
* Completed days appear **Green**; skipped/relapsed days appear **Red**; off-days appear dim and non-interactive.
* **Click-to-Toggle**: Click any scheduled past or current day cell directly to toggle its status between completed and skipped.
* **Edit Calendar Mode**: Use **`✏️ Edit Calendar`** to stage multi-day changes with one-click batch actions (*Mark Month Clean*, *Mark Month Missed*, or *Discard*).

### 6. Action Undo & Audit History
* **Non-Destructive Undo**: Tapping **`Undo Today`** rolls back your latest daily check-in action (`done`, `skip`, `slip`) and reconstructs today's status from any remaining check-in events.
* **Audit Trail Preservation**: Calendar modifications are recorded with dedicated ✏️ *Calendar History Edited* badges and are preserved when rolling back daily check-ins.
* **Reset Log Isolation**: Undoing a `done` action preserves earlier today's `resetLog` records.

### 7. Goals & Milestone Badges
* Track progress toward 11 milestone tiers (1d, 3d, 7d, 14d, 30d, 60d, 90d, 180d, 365d, 730d, 1825d).
* View your current goal card with real-time percentage progress bars and an interactive goals checklist with vector trophy and checkmark badges.

### 8. Themes & Appearance Customization
Open Settings (**⚙️**) to choose from 5 aesthetic visual themes:
* **🌌 Midnight**: Deep Obsidian with crisp white card sheets.
* **🔮 Frosted Glass**: Modern glassmorphism with dynamic backdrop blur.
* **🌙 Pure Dark**: OLED true dark mode.
* **☀️ Light Clean**: Minimal daylight appearance.
* **⚡ Cyberpunk Neon**: High-contrast dark theme with neon cyan & purple accents.

### 9. Support the Developer
* If Habit Streak empowers your daily routines, visit the **Support the Developer** section at the bottom of the Settings sheet or support future development directly at [krishnakanthb13.github.io/S](https://krishnakanthb13.github.io/S/).

---

## 🛠️ Configuration & Data Storage

| Setting Key | Description | Default |
| :--- | :--- | :--- |
| `Habit_Streak_Data_UUID [Do not Edit!]` | UUID of the authoritative `habit_streak_data` note tagged `-reports/-habit-streak`. | Auto-populated on initial load |

* **Zero Data Loss & Fresh-Install Auto-Seeding**: All streak history, reflection notes, and custom settings are stored in JSON format inside the authoritative data note. Fresh installs auto-initialize cleanly without false corruption alerts.
* **Concurrent Resolution Locking**: In-flight promise locking prevents duplicate `habit_streak_data` notes during concurrent embed initialization.
* **Corruption Protection**: The storage layer detects corrupted notes with `loadStateWithStatus` and strictly blocks all mutators and writes (`mutateState` / `saveState`) from overwriting damaged data with empty defaults.
* **Optimistic Concurrency & Revision Control**: Every state write verifies `expectedRevision` against the persisted note to prevent multi-device and multi-runtime lost updates.
* **Cadence & History Safeguards**: Changing the recurrence interval or tracking philosophy on active habits requires explicit user confirmation to prevent accidental recalculation of past historical streaks.
* **Off-Schedule Day Immunity**: Non-scheduled days are guarded server-side and visually designated (`☕ Off-Schedule / Rest Day`) to prevent phantom check-in records.
* **Mutation Serialization**: Concurrent mutations are serialized in an in-memory execution queue.
* **Device Portability**: Synchronizes automatically across all your devices using standard Amplenote note syncing.

---

## 🧪 Testing & Verification

The plugin includes an extensive Jest test suite (100% passing across 103 tests):
* `test/streakEngine.test.js` (28 tests): Core math, recurrence interval bridging, UTC daylight saving time (DST) calculations, leap-year handling, and defensive guards.
* `test/store.test.js` (20 tests): Schema normalization, markdown code block prioritization, concurrent note resolution deduplication, uninitialized note auto-seeding, corruption & load error protection, strict ISO timestamp validation, and optimistic concurrency checks.
* `test/features.test.js` (19 tests): Habit lifecycle, template bounds validation, off-schedule rejection, action event undoing with streak anchor restoration, and note import.
* `test/ds_scenarios.test.js` (31 tests): End-to-end design spec scenarios (1–18) and formal recurrence invariants (1–13).
* `test/plugin.test.js` (5 tests): Amplenote lifecycle hooks, action dispatching, embed HTML rendering, and corrupt note error banner display.

---

## 📁 Technical Architecture

- [`habit-streak.js`](./habit-streak.js): Plugin entry point, embed handlers, and theme action routers.
- [`lib/constants.js`](./lib/constants.js): Core constants, 11 milestone tiers, categorized templates, allowed themes, and valid event types.
- [`lib/data/store.js`](./lib/data/store.js): Authoritative JSON data note persistence, corruption guard, optimistic revision concurrency, mutation queue, and schema normalization.
- [`lib/engine/streakEngine.js`](./lib/engine/streakEngine.js): Mathematical calculations for continuous streaks, schedule-first status ordering, recurrence grids, and live digital tickers.
- [`lib/features/`](./lib/features/):
  - `createHabit.js`: Custom habit creation and 1-click template instantiation.
  - `importFromNote.js`: Note scanner with task normalization and interactive setup wizard.
  - `editHabit.js`: Edit existing counter settings with historical recalculation warnings.
  - `resetStreak.js`: Reset handlers with reflection notes, isolated reset logs, and multi-action state reconstruction undo.
  - `toggleDay.js`: Direct calendar day toggle engine with invariant-first anchor validation.
  - `habitManagement.js`: Counter deletion and active tab selection.
  - `launcher.js`: Embed opener and sidebar dispatcher.
- [`lib/ui/dashboardTemplate.js`](./lib/ui/dashboardTemplate.js): Responsive single-page client-side embedded application with off-schedule badges and immutable creation dates.

---

## 📄 License

GNU General Public License v3.0 (GPL-3.0). See [`LICENSE`](./LICENSE) for details.