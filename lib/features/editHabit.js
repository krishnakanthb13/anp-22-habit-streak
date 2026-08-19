import { INTERVAL_PERIODS, TRACK_TYPES } from "../constants.js";
import { loadState, saveState } from "../data/store.js";

/**
 * Handles editing an existing habit's settings via user prompt.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - ID of habit to edit.
 */
export async function handleEditHabit(app, habitId) {
  if (!habitId) return;

  const state = await loadState(app);
  const habit = state.habits.find(h => h.id === habitId);

  if (!habit) {
    await app.alert("Habit not found.");
    return;
  }

  const currentIcon = habit.icon || "🔥";
  const currentTheme = habit.colorTheme || "blue";
  const currentIntervalN = (habit.interval && habit.interval.n) ? String(habit.interval.n) : "1";
  const currentIntervalPeriod = (habit.interval && habit.interval.period) ? habit.interval.period : INTERVAL_PERIODS.DAY;
  const currentType = habit.type || TRACK_TYPES.SKIP;

  const result = await app.prompt(`Edit Counter: ${habit.name}`, {
    inputs: [
      {
        type: "string",
        label: "Emoji Icon (Paste or type any emoji: 🔥, 🏃, 🍷, 📚...)",
        value: currentIcon
      },
      {
        type: "string",
        label: "Habit / Counter Name",
        value: habit.name
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
        value: currentTheme
      },
      {
        type: "select",
        label: "Tracking Philosophy",
        options: [
          { label: "⚡ Quitly Style: Auto-Done (Considered done unless skipped)", value: TRACK_TYPES.SKIP },
          { label: "📝 Amplenote Style: Manual Log (Considered done only when marked)", value: TRACK_TYPES.COMPLETE }
        ],
        value: currentType
      },
      {
        type: "string",
        label: "Every (Number)",
        value: currentIntervalN
      },
      {
        type: "select",
        label: "Period",
        options: [
          { label: "Day(s)", value: INTERVAL_PERIODS.DAY },
          { label: "Week(s)", value: INTERVAL_PERIODS.WEEK },
          { label: "Month(s)", value: INTERVAL_PERIODS.MONTH }
        ],
        value: currentIntervalPeriod
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

  habit.icon = (iconVal && String(iconVal).trim()) ? String(iconVal).trim() : "🔥";
  habit.name = String(nameVal).trim();
  habit.colorTheme = themeVal || "blue";
  habit.type = typeVal || TRACK_TYPES.SKIP;
  habit.interval = {
    n: parseInt(periodNVal, 10) || 1,
    period: periodUnitVal || INTERVAL_PERIODS.DAY
  };

  await saveState(app, state);

  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
