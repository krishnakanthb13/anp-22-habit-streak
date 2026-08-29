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
            { label: "Quitting / Bad Habit (Sobriety & Abstinence: clean unless slipped)", value: TRACK_TYPES.SKIP },
            { label: "Building / Good Habit (Positive Action: completed when marked)", value: TRACK_TYPES.COMPLETE }
          ],
          value: TRACK_TYPES.SKIP
        }
      ]
    });

    if (!result || !Array.isArray(result)) {
      return;
    }

    const [iconVal, nameVal, themeVal, typeVal] = result;

    if (!nameVal || !String(nameVal).trim()) {
      await app.alert("Habit name cannot be empty.");
      return;
    }

    const habitName = String(nameVal).trim();
    const habitIcon = (iconVal && String(iconVal).trim()) ? String(iconVal).trim() : "🔥";
    const colorTheme = (themeVal && COLOR_THEMES[themeVal]) ? themeVal : "blue";
    const habitType = (typeVal === TRACK_TYPES.COMPLETE || typeVal === TRACK_TYPES.SKIP) ? typeVal : TRACK_TYPES.SKIP;

    const nowISO = new Date().toISOString();
    const todayStr = getTodayString();

    const newHabit = {
      id: generateUniqueId("habit"),
      name: habitName,
      icon: habitIcon,
      colorTheme: colorTheme,
      type: habitType,
      interval: {
        n: 1,
        period: INTERVAL_PERIODS.DAY
      },
      createdAt: nowISO,
      trackingStartDate: todayStr,
      streakAnchor: nowISO,
      streakStartedAt: nowISO,
      skips: [],
      completions: [],
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
    const idx = parseInt(templateIndex, 10);
    const template = (!isNaN(idx) && idx >= 0 && idx < PRESET_TEMPLATES.length) ? PRESET_TEMPLATES[idx] : null;
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
      completions: [],
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
