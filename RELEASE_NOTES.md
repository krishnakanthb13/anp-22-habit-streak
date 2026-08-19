# Release Notes: Habit Streaks Plugin

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

