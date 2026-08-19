import { INTERVAL_PERIODS, TRACK_TYPES, PRESET_TEMPLATES } from "../constants.js";
import { loadState, saveState } from "../data/store.js";
import { getTodayString } from "../engine/streakEngine.js";

/**
 * Handles creating a new habit via user prompts and saving to habit_streak_data note.
 * @param {object} app - Amplenote App instance.
 */
export async function handleCreateHabit(app) {
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
    return;
  }

  const habitName = String(nameVal).trim();
  const habitIcon = (iconVal && String(iconVal).trim()) ? String(iconVal).trim() : "🔥";
  const colorTheme = themeVal || "blue";
  const habitType = typeVal || TRACK_TYPES.SKIP;
  const periodN = parseInt(periodNVal, 10) || 1;
  const periodUnit = periodUnitVal || INTERVAL_PERIODS.DAY;

  const newHabit = {
    id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: habitName,
    icon: habitIcon,
    colorTheme: colorTheme,
    type: habitType,
    interval: {
      n: periodN,
      period: periodUnit
    },
    createdAt: `${getTodayString()}T00:00:00Z`,
    streakAnchor: new Date().toISOString(),
    skips: [],
    completions: habitType === TRACK_TYPES.COMPLETE ? [getTodayString()] : []
  };

  const state = await loadState(app);
  state.habits.push(newHabit);
  state.activeHabitId = newHabit.id;

  await saveState(app, state);

  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}

/**
 * Creates a new habit from a preset Quitly template.
 * @param {object} app - Amplenote App instance.
 * @param {number} templateIndex - Index in PRESET_TEMPLATES.
 */
export async function handleCreateFromTemplate(app, templateIndex) {
  const template = PRESET_TEMPLATES[templateIndex];
  if (!template) return;

  const newHabit = {
    id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: template.name,
    icon: template.icon || "🔥",
    type: template.type || TRACK_TYPES.SKIP,
    colorTheme: template.colorTheme || "blue",
    interval: {
      n: 1,
      period: INTERVAL_PERIODS.DAY
    },
    createdAt: `${getTodayString()}T00:00:00Z`,
    streakAnchor: new Date().toISOString(),
    skips: [],
    completions: template.type === TRACK_TYPES.COMPLETE ? [getTodayString()] : []
  };

  const state = await loadState(app);
  state.habits.push(newHabit);
  state.activeHabitId = newHabit.id;

  await saveState(app, state);

  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
