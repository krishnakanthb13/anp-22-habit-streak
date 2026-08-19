import { loadState, saveState } from "../data/store.js";
import { getDateRange, getTodayString } from "../engine/streakEngine.js";

/**
 * Marks today as skipped for the active habit.
 * @param {object} app
 * @param {string} habitId
 */
export async function handleSkipToday(app, habitId) {
  if (!habitId) return;

  const state = await loadState(app);
  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;

  const todayStr = getTodayString();
  habit.skips = habit.skips || [];
  habit.completions = habit.completions || [];

  if (!habit.skips.includes(todayStr)) {
    habit.skips.push(todayStr);
  }
  habit.completions = habit.completions.filter(d => d !== todayStr);

  await saveState(app, state);

  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}

/**
 * Marks today as completed for the active habit.
 * @param {object} app
 * @param {string} habitId
 */
export async function handleCompleteToday(app, habitId) {
  if (!habitId) return;

  const state = await loadState(app);
  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;

  const todayStr = getTodayString();
  habit.skips = habit.skips || [];
  habit.completions = habit.completions || [];

  habit.skips = habit.skips.filter(d => d !== todayStr);
  if (!habit.completions.includes(todayStr)) {
    habit.completions.push(todayStr);
  }

  await saveState(app, state);

  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}

/**
 * Prompts user to pick a date from which all days up to today are marked as skipped (Streak Reset).
 * @param {object} app
 * @param {string} habitId
 */
export async function handleResetToDate(app, habitId) {
  if (!habitId) return;

  const todayStr = getTodayString();
  const result = await app.prompt("Reset Streak / Backdate Skips", {
    inputs: [
      {
        type: "string",
        label: "Start Skip Date (YYYY-MM-DD)",
        placeholder: todayStr,
        value: todayStr
      },
      {
        type: "checkbox",
        label: "Mark all days between this date and today as skipped",
        value: true
      }
    ]
  });

  if (!result || !Array.isArray(result)) {
    return;
  }

  const [startDateVal, confirmVal] = result;

  if (!startDateVal || !confirmVal) {
    return;
  }

  const rangeDates = getDateRange(String(startDateVal).trim(), todayStr);
  if (rangeDates.length === 0) {
    await app.alert("Invalid start date provided.");
    return;
  }

  const state = await loadState(app);
  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;

  habit.skips = habit.skips || [];
  habit.completions = habit.completions || [];

  for (const d of rangeDates) {
    if (!habit.skips.includes(d)) {
      habit.skips.push(d);
    }
    habit.completions = habit.completions.filter(c => c !== d);
  }

  await saveState(app, state);

  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
