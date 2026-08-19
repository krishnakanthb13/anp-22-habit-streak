import { loadState } from "./lib/data/store.js";
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
import { handleToggleDay } from "./lib/features/toggleDay.js";
import { handleSkipToday, handleCompleteToday, handleResetToDate } from "./lib/features/resetStreak.js";
import { handleDeleteHabit, handleSelectHabit } from "./lib/features/habitManagement.js";
import { handleImportFromNote } from "./lib/features/importFromNote.js";

const plugin = {
  // App-level action: launches the Habit Streaks Dashboard (Fullscreen or Sidebar)
  appOption: {
    "Habit Streaks Dashboard": async function(app) {
      await launchHabitDashboard(app);
    }
  },

  // Note-level action to open dashboard or embed widget into any note
  noteOption: {
    "Habit Streaks Dashboard": async function(app) {
      await launchHabitDashboard(app);
    },
    "Insert Habit Streaks Widget": async function(app, noteUUID) {
      const pluginUUID = app.context ? app.context.pluginUUID : "";
      const embedHtml = `<object data="plugin://${pluginUUID}" data-aspect-ratio="1" type="text/html"></object>`;
      await app.insertNoteContent({ uuid: noteUUID }, embedHtml);
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

        case "skipToday":
          await handleSkipToday(app, args[1]);
          break;

        case "completeToday":
          await handleCompleteToday(app, args[1]);
          break;

        case "resetToDate":
          await handleResetToDate(app, args[1]);
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
      calendar
    });
  }
};

export default plugin;
