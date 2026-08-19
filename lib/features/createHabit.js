import { INTERVAL_PERIODS, TRACK_TYPES } from "../constants.js";
import { loadState, saveState } from "../data/store.js";
import { getTodayString } from "../engine/streakEngine.js";

/**
 * Handles creating a new habit via user prompts and saving to habit_streak_data note.
 * @param {object} app - Amplenote App instance.
 */
export async function handleCreateHabit(app) {
  const result = await app.prompt("Create New Habit", {
    inputs: [
      {
        type: "string",
        label: "Habit Name / Description",
        placeholder: "e.g., Daily Morning Meditation"
      },
      {
        type: "select",
        label: "Tracking Philosophy",
        options: [
          { label: "Skip-Tracked (Quitly Default: Considered done unless skipped)", value: TRACK_TYPES.SKIP },
          { label: "Complete-Tracked (Amplenote: Considered done only when marked)", value: TRACK_TYPES.COMPLETE }
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

  const [nameVal, typeVal, periodNVal, periodUnitVal] = result;

  if (!nameVal || !String(nameVal).trim()) {
    return;
  }

  const habitName = String(nameVal).trim();
  const habitType = typeVal || TRACK_TYPES.SKIP;
  const periodN = parseInt(periodNVal, 10) || 1;
  const periodUnit = periodUnitVal || INTERVAL_PERIODS.DAY;

  const newHabit = {
    id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: habitName,
    type: habitType,
    interval: { n: periodN, period: periodUnit },
    createdAt: getTodayString(),
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
