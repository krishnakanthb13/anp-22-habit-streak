import { loadState, saveState, mutateState } from "./lib/data/store.js";
import { 
  calculateHabitStats, 
  calculateTierProgress, 
  calculateAllHabitsSummary,
  generateMonthCalendar 
} from "./lib/engine/streakEngine.js";
import { buildDashboardTemplate } from "./lib/ui/dashboardTemplate.js";
import { launchHabitDashboard } from "./lib/features/launcher.js";
import { handleCreateHabit, handleCreateFromTemplate } from "./lib/features/createHabit.js";
import { handleEditHabit } from "./lib/features/editHabit.js";
import { handleToggleDay, handleSaveCalendarEdits } from "./lib/features/toggleDay.js";
import { handleSkipToday, handleCompleteToday, handleUndoToday, handleResetToDate } from "./lib/features/resetStreak.js";
import { handleDeleteHabit, handleSelectHabit } from "./lib/features/habitManagement.js";
import { handleImportFromNote } from "./lib/features/importFromNote.js";
import { VALID_THEMES } from "./lib/constants.js";

const plugin = {
  // App-level action: launches the Habit Streaks Dashboard (Fullscreen or Sidebar)
  appOption: {
    "Open Dashboard": async function(app) {
      await launchHabitDashboard(app);
    }
  },

  /**
   * Dispatches events sent from the embed iframe UI.
   * @param {object} app - Amplenote App instance.
   * @param  {...any} args - Action arguments from the embed.
   */
  async onEmbedCall(app, ...args) {
    const action = args[0];

    try {
      switch (action) {
        case "createHabit":
          await handleCreateHabit(app);
          break;

        case "createFromTemplate":
          await handleCreateFromTemplate(app, args[1]);
          break;

        case "importFromNote":
          await handleImportFromNote(app);
          break;

        case "editHabit":
          await handleEditHabit(app, args[1]);
          break;

        case "selectHabit":
          await handleSelectHabit(app, args[1]);
          break;

        case "deleteHabit":
          await handleDeleteHabit(app, args[1]);
          break;

        case "toggleDay":
          await handleToggleDay(app, args[1], args[2], args[3]);
          break;

        case "saveCalendarEdits":
          await handleSaveCalendarEdits(app, args[1], args[2], args[3]);
          break;

        case "skipToday":
          await handleSkipToday(app, args[1]);
          break;

        case "completeToday":
          await handleCompleteToday(app, args[1]);
          break;

        case "undoToday":
          await handleUndoToday(app, args[1]);
          break;

        case "resetToDate":
          await handleResetToDate(app, args[1]);
          break;

        case "setTheme":
          if (args[1] && VALID_THEMES.includes(args[1])) {
            await mutateState(app, async state => {
              state.theme = args[1];
            });
          }
          break;

        case "refreshData":
          if (app.context && typeof app.context.renderEmbed === "function") {
            await app.context.renderEmbed();
          }
          break;

        default:
          console.warn("[HabitStreak] Unhandled embed action:", action);
      }
    } catch (err) {
      console.error("[HabitStreak] Error processing onEmbedCall:", err);
      await app.alert(`Action error: ${err.message || err}`);
    }
  },

  /**
   * Renders the interactive Habit Streak dashboard.
   * @param {object} app - Amplenote App instance.
   * @param  {...any} args - Embed rendering arguments.
   * @returns {Promise<string>} - Complete HTML string.
   */
  async renderEmbed(app, ...args) {
    const state = await loadState(app);
    if (state && (state._isCorrupt === true || state._loadError === true)) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Habit Streaks — Data Error</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #ef4444; border-radius: 16px; padding: 32px; max-width: 520px; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    .icon { font-size: 40px; margin-bottom: 16px; }
    h2 { margin: 0 0 10px 0; font-size: 20px; color: #fca5a5; }
    p { margin: 0 0 16px 0; color: #94a3b8; font-size: 14px; line-height: 1.6; }
    code { background: #0f172a; padding: 3px 8px; border-radius: 6px; color: #38bdf8; font-family: monospace; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h2>Habit Streak Data Error</h2>
    <p>Your habit data note could not be parsed or loaded cleanly. Automatic saving is paused to protect your data from being overwritten.</p>
    <p>Please inspect the <code>Habit Streak Data</code> note to ensure its JSON structure is valid.</p>
  </div>
</body>
</html>`;
    }

    const habits = state.habits || [];

    const summary = calculateAllHabitsSummary(habits);

    let activeHabit = null;
    if (state.activeHabitId) {
      activeHabit = habits.find(h => h.id === state.activeHabitId) || null;
    }

    const embedOpts = (args && args.length > 0 && typeof args[0] === "object") ? args[0] : {};
    const now = new Date();
    const viewingYear = embedOpts.year || now.getFullYear();
    const viewingMonth = embedOpts.month || (now.getMonth() + 1);

    let stats = null;
    let tiers = [];
    let calendar = null;

    if (activeHabit) {
      stats = calculateHabitStats(activeHabit);
      tiers = calculateTierProgress(stats.currentStreak);
      calendar = generateMonthCalendar(activeHabit, viewingYear, viewingMonth);
    }

    return buildDashboardTemplate({
      habits,
      summary,
      activeHabit,
      stats,
      tiers,
      calendar,
      theme: state.theme || "midnight"
    });
  }
};

export default plugin;
