import { TRACK_TYPES } from "../constants.js";
import { loadState, saveState } from "../data/store.js";
import { getTodayString } from "../engine/streakEngine.js";

/**
 * Handles toggling a specific day between completed and skipped.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - Habit ID.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} currentStatus - Current status string ("completed" | "skipped")
 */
export async function handleToggleDay(app, habitId, dateStr, currentStatus) {
  if (!habitId || !dateStr) return;

  const state = await loadState(app);
  const habit = state.habits.find(h => h.id === habitId);

  if (!habit) return;

  habit.skips = habit.skips || [];
  habit.completions = habit.completions || [];

  if (habit.type === TRACK_TYPES.COMPLETE) {
    if (currentStatus === "completed") {
      // Remove from completions and add to skips
      habit.completions = habit.completions.filter(d => d !== dateStr);
      if (!habit.skips.includes(dateStr)) habit.skips.push(dateStr);
    } else {
      // Mark as completed
      habit.skips = habit.skips.filter(d => d !== dateStr);
      if (!habit.completions.includes(dateStr)) habit.completions.push(dateStr);
    }
  } else {
    // Skip-tracked default
    if (currentStatus === "completed") {
      // Mark as skipped
      if (!habit.skips.includes(dateStr)) habit.skips.push(dateStr);
      habit.completions = habit.completions.filter(d => d !== dateStr);
    } else {
      // Mark as completed
      habit.skips = habit.skips.filter(d => d !== dateStr);
      if (!habit.completions.includes(dateStr)) habit.completions.push(dateStr);
    }
  }

  // Update underlying Amplenote task if linked and today is toggled
  const todayStr = getTodayString();
  if (dateStr === todayStr && habit.taskUUID) {
    try {
      if (currentStatus === "completed") {
        await app.updateTask(habit.taskUUID, { completedAt: null });
      } else {
        await app.updateTask(habit.taskUUID, { completedAt: Math.floor(Date.now() / 1000) });
      }
    } catch (err) {
      console.warn("[HabitStreak] Task update sync:", err);
    }
  }

  await saveState(app, state);

  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
