# Habit Streaks Plugin (Beautiful Streaks & Days-Since Counter)

> A modern, high-fidelity habit and streak tracking plugin for Amplenote with Quitly-inspired dual philosophy (Break Bad Habits vs Build Positive Habits), real-time live digital tickers, 7-day repeatingness bar charts, interactive monthly dot calendars, tiered milestone badges, per-task import wizard, and reflection history logging.

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
5. **Open Dashboard**: Run the app option (`Habit Streaks Dashboard`) or insert the widget into any note.

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
2. **Select Tasks**: Check the tasks you want to track from the discovered list (supports both native tasks and `- [ ]` markdown checkboxes).
3. **Configure Each Habit**: For each selected task, an interactive setup wizard opens pre-filled with the task's title:
   * **Tracking Philosophy**: Choose whether this is a **`✨ Positive Habit`** (done when checked in) or a **`🛡️ Bad Habit / Abstinence`** (auto-done unless skipped).
   * **Emoji Icon**: Assign any emoji (🏃, 📚, 🧘, 🔥, 🍷, etc.).
   * **Color Theme**: Choose from 8 vibrant gradients (Emerald, Sky Blue, Indigo, Teal, Purple, Amber, Rose, Bronze).
   * **Recurrence**: Set cadence (Every 1 Day, 1 Week, etc.).
4. **Immediate Activation**: The newly imported habit opens directly on your dashboard.

### 3. Understanding the Dual Tracking Philosophies
* **🛡️ Bad Habits & Sobriety (Quitly Style)**:
  * **Concept**: You are succeeding every single second simply by staying clean (e.g. *No Alcohol*, *No Smoking*, *No Junk Food*).
  * **Interaction**: Auto-tracked! Days count up continuously without requiring daily check-ins.
  * **When a slip occurs**: Tap **`🚨 Log Slip / Reset Today`** or **`🔄 Backdate Relapse Date with Note`** to record your reflection note.
* **🎯 Positive Daily Habits (Amplenote Style)**:
  * **Concept**: Intentional daily practices that require physical effort (e.g. *Exercise*, *Reading*, *Meditation*).
  * **Interaction**: Tap **`✅ Mark Done Today`** each day to advance your streak. Supports multiple check-ins per day.

### 4. Interactive Monthly Calendar & Keyboard Navigation
* View any month using the smooth navigation buttons with modern vector icons (`←` / `→`).
* **Keyboard Shortcuts**: Navigate months instantly with <kbd>←</kbd> / <kbd>→</kbd> or <kbd>&lt;</kbd> / <kbd>&gt;</kbd>; press <kbd>Esc</kbd> or <kbd>Backspace</kbd> to return to the counters overview.
* Completed days appear **Green**; skipped/relapsed days appear **Red**.
* **Click-to-Toggle**: Click any past or current day cell directly to toggle its status between completed and skipped.
* **Edit Calendar Mode**: Use **`✏️ Edit Calendar`** to stage multi-day changes with one-click batch actions (*Mark Month Clean*, *Mark Month Missed*, or *Discard*).

### 5. Goals & Milestone Badges
* Track progress toward 11 milestone tiers (1d, 3d, 7d, 14d, 30d, 60d, 90d, 180d, 365d, 730d, 1825d).
* View your current goal card with real-time percentage progress bars and an interactive goals checklist with vector trophy and checkmark badges.

### 6. Themes & Appearance Customization
Open Settings (**⚙️**) to choose from 5 aesthetic visual themes:
* **🌌 Midnight**: Deep Obsidian with crisp white card sheets.
* **🔮 Frosted Glass**: Modern glassmorphism with dynamic backdrop blur.
* **🌙 Pure Dark**: OLED true dark mode.
* **☀️ Light Clean**: Minimal daylight appearance.
* **⚡ Cyberpunk Neon**: High-contrast dark theme with neon cyan & purple accents.

### 7. Support the Developer
* If Habit Streak empowers your daily routines, visit the **Support the Developer** section at the bottom of the Settings sheet or support future development directly at [krishnakanthb13.github.io/S](https://krishnakanthb13.github.io/S/).

---

## 🛠️ Configuration & Data Storage

| Setting Key | Description | Default |
| :--- | :--- | :--- |
| `Habit_Streak_Data_UUID [Do not Edit!]` | UUID of the authoritative `habit_streak_data` note tagged `-reports/-habit-streak`. | Auto-populated on initial load |

* **Zero Data Loss**: All streak history, reflection notes, and custom settings are stored in JSON format inside the authoritative data note.
* **Device Portability**: Synchronizes automatically across all your devices using standard Amplenote note syncing.

---

## 📁 Technical Architecture

- [`habit-streak.js`](./habit-streak.js): Plugin entry point and action router.
- [`lib/constants.js`](./lib/constants.js): Core constants, 11 milestone tiers, and categorized templates.
- [`lib/data/store.js`](./lib/data/store.js): Authoritative JSON data note persistence.
- [`lib/engine/streakEngine.js`](./lib/engine/streakEngine.js): Mathematical calculations for continuous streaks, milestone tiers, and 7-day frequencies.
- [`lib/features/`](./lib/features/):
  - `createHabit.js`: Custom habit creation and 1-click template instantiation.
  - `importFromNote.js`: Note scanner with task normalization and interactive setup wizard.
  - `editHabit.js`: Edit existing counter settings.
  - `resetStreak.js`: Reset handlers with reflection note logging.
  - `toggleDay.js`: Direct calendar day toggle engine.
  - `habitManagement.js`: Counter deletion and active tab selection.
  - `launcher.js`: Embed opener and sidebar dispatcher.
- [`lib/ui/dashboardTemplate.js`](./lib/ui/dashboardTemplate.js): Responsive single-page client-side embedded application.

---

## 📄 License

GNU General Public License v3.0 (GPL-3.0). See [`LICENSE`](./LICENSE) for details.