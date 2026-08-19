# Release Notes: Habit Streaks Plugin

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
- **Settings & Data Drawer**: Dedicated settings modal with on-demand force note resync and aggregate overview metrics.

### ⚡ Improvements
- **Zero-Lag In-Memory Navigation**: All view transitions, tab switches, and calendar navigations run 100% in-memory with 0ms latency.
- **Authoritative Data Note Storage**: Stores clean JSON inside `habit_streak_data` tagged `-reports/-habit-streak` with UUID settings cache.

### 🐛 Bug Fixes
- **Iframe Height & Scroll Lock**: Fixed iframe scrolling using flexible viewport rules (`overflow-y: auto !important`).

### 📚 Documentation
- Added comprehensive `README.md`, `CODE_DOCUMENTATION.md`, and `DESIGN_PHILOSOPHY.md`.
- Added GPL-3.0 `LICENSE`.
