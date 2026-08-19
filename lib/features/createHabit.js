import { INTERVAL_PERIODS, TRACK_TYPES, PRESET_TEMPLATES, generateUniqueId, COLOR_THEMES } from "../constants.js";
import { mutateState } from "../data/store.js";
import { getTodayString } from "../engine/streakEngine.js";

/**
 * Handles creating a new habit via user prompts and saving to habit_streak_data note.
 * @param {object} app - Amplenote App instance.
 * @returns {Promise<void>}
 */
export async function handleCreateHabit(app) {
  try {
    const result = await app.prompt("Create New Counter", {
      inputs: [
        {
          type: "string",
          label: "Emoji Icon (Paste or type any emoji: 🔥, 🏃, 🍷, 📚...)",
          placeholder: "🔥",
          value: "🔥"
        },
        {
          type: "string",
          label: "Habit / Counter Name",
          placeholder: "e.g., Daily Meditation, No Sugar..."
        },
        {
          type: "select",
          label: "Color Theme",
          options: [
            { label: "Amber (Orange/Gold)", value: "amber" },
            { label: "Rose (Pink/Red)", value: "rose" },
            { label: "Sky Blue", value: "blue" },
            { label: "Emerald (Green)", value: "emerald" },
            { label: "Purple (Violet)", value: "purple" },
            { label: "Bronze (Warm Brown)", value: "bronze" },
            { label: "Teal (Cyan)", value: "teal" },
            { label: "Indigo", value: "indigo" }
          ],
          value: "blue"
        },
        {
          type: "select",
          label: "Tracking Philosophy",
          options: [
            { label: "⚡ Quitly Style: Auto-Done (Considered done unless skipped)", value: TRACK_TYPES.SKIP },
            { label: "📝 Amplenote Style: Manual Log (Considered done only when marked)", value: TRACK_TYPES.COMPLETE }
          ],
          value: TRACK_TYPES.SKIP
        },
        {
          type: "string",
          label: "Every (Number)",
          placeholder: "1",
          value: "1"
        },
        {
          type: "select",
          label: "Period",
          options: [
            { label: "Day(s)", value: INTERVAL_PERIODS.DAY },
            { label: "Week(s)", value: INTERVAL_PERIODS.WEEK },
            { label: "Month(s)", value: INTERVAL_PERIODS.MONTH }
          ],
          value: INTERVAL_PERIODS.DAY
        }
      ]
    });

    if (!result || !Array.isArray(result)) {
      return;
    }

    const [iconVal, nameVal, themeVal, typeVal, periodNVal, periodUnitVal] = result;

    if (!nameVal || !String(nameVal).trim()) {
      await app.alert("Habit name cannot be empty.");
      return;
    }

    const habitName = String(nameVal).trim();
    const habitIcon = (iconVal && String(iconVal).trim()) ? String(iconVal).trim() : "🔥";
    const colorTheme = (themeVal && COLOR_THEMES[themeVal]) ? themeVal : "blue";
    const habitType = (typeVal === TRACK_TYPES.COMPLETE || typeVal === TRACK_TYPES.SKIP) ? typeVal : TRACK_TYPES.SKIP;

    const parsedN = parseInt(periodNVal, 10);
    const periodN = (!isNaN(parsedN) && parsedN >= 1 && parsedN <= 365) ? parsedN : 1;
    const periodUnit = [INTERVAL_PERIODS.DAY, INTERVAL_PERIODS.WEEK, INTERVAL_PERIODS.MONTH].includes(periodUnitVal)
      ? periodUnitVal
      : INTERVAL_PERIODS.DAY;

    const nowISO = new Date().toISOString();
    const todayStr = getTodayString();

    const newHabit = {
      id: generateUniqueId("habit"),
      name: habitName,
      icon: habitIcon,
      colorTheme: colorTheme,
      type: habitType,
      interval: {
        n: periodN,
        period: periodUnit
      },
      createdAt: nowISO,
      trackingStartDate: todayStr,
      streakAnchor: nowISO,
      streakStartedAt: nowISO,
      skips: [],
      completions: habitType === TRACK_TYPES.COMPLETE ? [todayStr] : [],
      events: [],
      resetLogs: []
    };

    await mutateState(app, async state => {
      state.habits = state.habits || [];
      state.habits.push(newHabit);
      state.activeHabitId = newHabit.id;
    });

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleCreateHabit:", err);
    await app.alert(`Failed to create habit: ${err.message || err}`);
  }
}

/**
 * Creates a new habit from a preset Quitly template.
 * @param {object} app - Amplenote App instance.
 * @param {number} templateIndex - Index in PRESET_TEMPLATES.
 * @returns {Promise<void>}
 */
export async function handleCreateFromTemplate(app, templateIndex) {
  try {
    const template = PRESET_TEMPLATES[templateIndex];
    if (!template) return;

    const nowISO = new Date().toISOString();
    const todayStr = getTodayString();

    const newHabit = {
      id: generateUniqueId("habit"),
      name: template.name,
      icon: template.icon || "🔥",
      type: template.type || TRACK_TYPES.SKIP,
      colorTheme: template.colorTheme || "blue",
      interval: {
        n: 1,
        period: INTERVAL_PERIODS.DAY
      },
      createdAt: nowISO,
      trackingStartDate: todayStr,
      streakAnchor: nowISO,
      streakStartedAt: nowISO,
      skips: [],
      completions: template.type === TRACK_TYPES.COMPLETE ? [todayStr] : [],
      events: [],
      resetLogs: []
    };

    await mutateState(app, async state => {
      state.habits = state.habits || [];
      state.habits.push(newHabit);
      state.activeHabitId = newHabit.id;
    });

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleCreateFromTemplate:", err);
    await app.alert(`Failed to create habit from template: ${err.message || err}`);
  }
}
