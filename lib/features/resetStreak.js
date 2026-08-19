import { loadState, saveState } from "../data/store.js";
import { getDateRange, getTodayString, calculateHabitStats } from "../engine/streakEngine.js";

/**
 * Marks today as skipped for the active habit (or adds a new skip event).
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
  habit.resetLogs = habit.resetLogs || [];
  habit.events = habit.events || [];

  const stats = calculateHabitStats(habit, todayStr);

  habit.events.push({
    type: "skip",
    date: todayStr,
    timestamp: new Date().toISOString()
  });

  if (!habit.skips.includes(todayStr)) {
    habit.skips.push(todayStr);
    habit.resetLogs.push({
      date: todayStr,
      streakLength: stats.currentStreak,
      note: "Daily slip logged",
      timestamp: new Date().toISOString()
    });
  }
  habit.completions = habit.completions.filter(d => d !== todayStr);

  await saveState(app, state);

  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}

/**
 * Marks today as completed for the active habit (or adds multiple completions).
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
  habit.events = habit.events || [];

  habit.events.push({
    type: "done",
    date: todayStr,
    timestamp: new Date().toISOString()
  });

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
 * Prompts user to pick a date and optional note/reason to reset streak (Reset with Notes).
 * @param {object} app
 * @param {string} habitId
 */
export async function handleResetToDate(app, habitId) {
  if (!habitId) return;

  const todayStr = getTodayString();
  const result = await app.prompt("Reset Counter with Note", {
    inputs: [
      {
        type: "string",
        label: "Reset From Date (YYYY-MM-DD)",
        placeholder: todayStr,
        value: todayStr
      },
      {
        type: "string",
        label: "Reset Reflection / Reason Note (Optional)",
        placeholder: "e.g., Felt overwhelmed at party, resolved to restart tomorrow"
      },
      {
        type: "checkbox",
        label: "Mark all days between this date and today as skipped / reset",
        value: true
      }
    ]
  });

  if (!result || !Array.isArray(result)) {
    return;
  }

  const [startDateVal, noteVal, confirmVal] = result;

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

  const stats = calculateHabitStats(habit, todayStr);

  habit.skips = habit.skips || [];
  habit.completions = habit.completions || [];
  habit.resetLogs = habit.resetLogs || [];
  habit.events = habit.events || [];

  for (const d of rangeDates) {
    if (!habit.skips.includes(d)) {
      habit.skips.push(d);
    }
    habit.completions = habit.completions.filter(c => c !== d);
  }

  habit.events.push({
    type: "skip",
    date: String(startDateVal).trim(),
    note: (noteVal && String(noteVal).trim()) ? String(noteVal).trim() : "Reset logged",
    timestamp: new Date().toISOString()
  });

  habit.resetLogs.push({
    date: String(startDateVal).trim(),
    streakLength: stats.currentStreak,
    note: (noteVal && String(noteVal).trim()) ? String(noteVal).trim() : "Reset logged",
    timestamp: new Date().toISOString()
  });

  await saveState(app, state);

  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
