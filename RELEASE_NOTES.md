# Release Notes: Habit Streaks Plugin

## v0.0.7 (2026-08-19)

### 🎨 Vector Iconography & Keyboard Ergonomics
- **Precision SVG Vector Icons (`ICONS`)**: Replaced all text glyphs and basic ascii characters with custom high-DPI inline SVGs:
  - Month Navigation: Vector `chevronLeft` / `chevronRight` icons.
  - View Navigation: Vector `arrowLeft` back button with keytooltips.
  - Modals & Close Actions: Vector `close` cross icon.
  - Habit Cards: Animated vector `chevronRight` indicators.
  - Templates & Catalogs: Vector `plus` and `chevronDown` accordion indicators.
- **Enhanced Goal Milestone Checklist**:
  - Unlocked goals render a custom glowing `checkCircle` SVG vector.
  - Locked goals render a crisp `lock` vector icon.
- **Global Keyboard Navigation**:
  - Paging: <kbd>←</kbd> / <kbd>→</kbd> or <kbd>&lt;</kbd> / <kbd>&gt;</kbd> to switch months instantly.
  - Back & Dismissal: <kbd>Esc</kbd> or <kbd>Backspace</kbd> to return to the counters overview or exit calendar edit mode.
- **💖 Support the Developer Section**: Added a dedicated card in the Settings & Theming drawer with encouraging copy and a direct link to [krishnakanthb13.github.io/S](https://krishnakanthb13.github.io/S/).

---

## v0.0.6 (2026-08-19)

### 🚀 New Features & Calendar UI/UX Overhaul
- **Auto-Navigation to Main Page on Creation**: Adding a habit from templates, creating a custom counter, or importing tasks now automatically navigates to the **Main Dashboard Homescreen (`"main"`)**, showing your updated list of counters immediately.
- **Symmetric Action Flow & Reflection Notes for Both Types**:
  - **Amplenote Positive Habits**: Tapping **`✅ Mark Done Today`** or **`+ Log Additional Done (+1)`** now prompts with an interactive dialog to record an optional session reflection note (*"Morning meditation completed"*, *"Read Chapter 4"*) and displays the count of daily sessions (*"2 Sessions Completed Today!"*).
  - **Quitly Abstinence Counters**: Users can now log multiple slips in a single day with individual timestamped notes via **`🚨 Log Additional Slip (+1)`**, in addition to having **`↩️ Undo Slip / Mark Clean Today`**.
- **Interactive Ticker Unit Toggles (`[Y] [M] [D]`)**: The Hero digital sub-clock ticker now features 1-tap unit switching between **Days (`D`)**, **Months (`M`)**, and **Years (`Y`)** with instant sub-clock calculation.
- **Fixed `setTheme` Import Reference**: Added missing `saveState` import in [`habit-streak.js`](file:///c:/Users/ADMIN/OneDrive/Documents/GitHub/amplenote_stg_plugins/anp-22-habit-streak/habit-streak.js), preventing `ReferenceError: saveState is not defined` when syncing theme settings.
- **Seamless Scroll Position Retention**: Editing, toggling days, saving the calendar, or logging check-ins now preserves your exact vertical scroll position in real-time (`sessionStorage` + `requestAnimationFrame`), preventing page jumps back to the top.
- **Return to Homescreen on Deletion**: Deleting a counter from the detail view now automatically cleans up session tracking and returns the dashboard cleanly to the main homescreen list.
- **↩️ Undo for Bad Habits (Abstinence)**: When a slip is logged for a Quitly habit, the dashboard now shows a dedicated **`↩️ Undo Slip / Mark Clean Today`** button, allowing instant reversal of accidental slips.
- **Confirmation & Reflection Prompt on Slip/Reset**: Clicking **`🚨 Log Slip / Reset Today`** now presents an interactive confirmation dialog with the current streak length and an optional reflection note input so users don't accidentally reset streaks.
- **In-Place View Session Persistence**: The embed now persists the active view and selected habit in `sessionStorage`. Marking completions, logging additional sessions (`+1`), or undoing slips will keep you seamlessly on the same habit screen instead of pushing back to the main list.
- **Full Calendar UI/UX Redesign**:
  - **Weekday Headers Row**: Added clean standard weekday column headers (`Su Mo Tu We Th Fr Sa`) aligning all dates with real calendars.
  - **Dynamic State Visuals**: Clear color-coded distinction between `Done / Clean` (Emerald Green), `Missed / Slip` (Rose Red), `Today` (Active Blue Ring), and `Before Start` (subtle gray).
  - **Quick Action Batch Controls**: Added 1-tap buttons in Edit Mode to **`✅ Mark Month Clean`**, **`🚫 Mark Month Missed`**, and **`✕ Discard`**.
  - **Live Month Metrics Footer**: Real-time breakdown of **`🟢 X Done`**, **`🔴 Y Missed`**, and total resets.
- **In-Calendar Direct Edit & Save Engine**: Fixed an issue where edits on dates earlier than habit creation date were filtered out by `before_start`. Both the client renderer and host engine now dynamically expand `habit.createdAt` and calculate streaks backdating seamlessly.
- **Timestamped Activity & History Logs**: All check-in sessions and reset slips now display exact formatted local timestamps (e.g. `• 09:30 AM`, `• 02:15 PM`) supporting multiple check-in entries per day for both Quitly and Amplenote tracking styles.

## v0.0.5 (2026-08-19)

### 🚀 New Features & Enhancements
- **Interactive Per-Habit Import Wizard**: Importing tasks from notes now walks through each selected item with a pre-filled dialog allowing users to customize title, emoji icon, color theme gradient, and choose between **✨ Positive Habit** vs **🛡️ Bad Habit / Abstinence**.
- **Collapsible In-App Guide Accordion**: Replaced static guide banners with a sleek, one-tap expandable accordion (**`💡 How to Add & Track Habits ▼`**) below the Import Tasks button with adaptive styling across all 5 themes.
- **Cross-Device Appearance Theme Sync**: Selected visual themes now save directly to the authoritative `habit_streak_data` note (`state.theme`) via `setTheme` in addition to 0ms `localStorage` instant caching.
- **Enhanced Empty State**: Main dashboard empty state provides direct 1-click access to both template catalog and note task import.

### 🐛 Bug Fixes & Code Audit
- **`app.prompt` Single-Input Normalization**: Fixed an issue where `app.prompt` with single inputs (e.g. single note selection or single task checkbox) returned direct primitive values/objects instead of arrays, which previously caused imports to exit prematurely.
- **Robust Task Parsing**: Expanded task extraction to support `includeDone: true` and added markdown regex fallback for all checklist patterns (`- [ ]`, `- [x]`, `* [ ]`, `[ ]`).
- **Client-Side Scope Fix**: Fixed `ReferenceError: dashboardData is not defined` in client-side script by scoping theme initialization to `INITIAL_DATA.theme`.
- **Schema Conformity in Creation**: Initialized `events: []` and `resetLogs: []` across custom and template habit creation in `createHabit.js`.
- **Local Timezone Consistency**: Replaced UTC date slicing with `getTodayString()` in `toggleDay.js` to prevent midnight timezone boundary discrepancies.

### 📚 Documentation
- Systematically refreshed `README.md`, `CODE_DOCUMENTATION.md`, and `DESIGN_PHILOSOPHY.md` to document user workflows, import wizard details, and data model persistence.

---

## v0.0.3 (2026-08-19)

### 🚀 New Features
- **Quitly-Inspired Dual Tracking Philosophy**: Full support for both *Abstinence / Breaking Bad Habits* (auto-tracked count-up) and *Positive Daily Habits* (action check-in).
- **Live Digital Ticker Hero**: Real-time 4-column ticking sub-clock (`[Days] [Hours] [Minutes] [Seconds]`) with unit toggles (`[Y] [M] [D]`).
- **Main Screen Segmentation**: Top filter segment bar (`All` | `🛡️ Quitting` | `🎯 Positive Habits`) with vibrant gradient pill cards.
- **Quitly Laurel Tiers & Goals Checklist**: 11 milestone tiers (1d to 5yr) with progress fill bars and 3-column goal checklist grid.
- **Multi-Event Tracking & 7-Day Frequency Chart**: Log multiple completions per day with a visual 7-day repeatingness bar chart.
- **Interactive Monthly Dot Calendar**: Horizontal month navigation with instant click-to-toggle completion states.
- **Reset Counters with Reflection Notes**: Log resets with reasons and view chronological past streak history.
- **Categorized Templates Catalog**: 1-click counter templates organized by Sobriety, Health, Fitness, and Mindfulness.
- **5 Visual Appearance Themes**: Instant 0ms switching between *Midnight*, *Frosted Glass (Glassmorphism)*, *Pure Dark*, *Light Clean*, and *Cyberpunk Neon*.
- **Task Import from Any Note**: Scan workspace notes to discover recurring tasks and import them directly into your streak board in one click.
- **Settings & Data Drawer**: Dedicated settings modal with visual theme picker, on-demand force note resync, and aggregate overview metrics.

### ⚡ Improvements
- **Zero-Lag In-Memory Navigation**: All view transitions, tab switches, and calendar navigations run 100% in-memory with 0ms latency.
- **Authoritative Data Note Storage**: Stores clean JSON inside `habit_streak_data` tagged `-reports/-habit-streak` with UUID settings cache.

### 🐛 Bug Fixes
- **Iframe Height & Scroll Lock**: Fixed iframe scrolling using flexible viewport rules (`overflow-y: auto !important`).

### 📚 Documentation
- Added comprehensive `README.md`, `CODE_DOCUMENTATION.md`, and `DESIGN_PHILOSOPHY.md`.
- Added GPL-3.0 `LICENSE`.

