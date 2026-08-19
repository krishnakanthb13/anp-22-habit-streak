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

/**
 * Handles batch saving full calendar edits for a habit.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - Habit ID.
 * @param {string[]} skips - Array of skipped date strings (YYYY-MM-DD).
 * @param {string[]} completions - Array of completed date strings (YYYY-MM-DD).
 */
export async function handleSaveCalendarEdits(app, habitId, skips, completions) {
  if (!habitId) return;

  const state = await loadState(app);
  const habit = state.habits.find(h => h.id === habitId);

  if (!habit) return;

  if (Array.isArray(skips)) habit.skips = skips;
  if (Array.isArray(completions)) habit.completions = completions;

  // If there are recorded dates earlier than createdAt, update createdAt and anchor
  const allRecordedDates = [...(habit.completions || []), ...(habit.skips || [])].filter(Boolean).sort();
  if (allRecordedDates.length > 0) {
    const earliest = allRecordedDates[0];
    const currentStart = habit.createdAt ? habit.createdAt.split("T")[0] : earliest;
    if (earliest < currentStart) {
      habit.createdAt = earliest + "T00:00:00Z";
      habit.streakAnchor = earliest + "T00:00:00Z";
    }
  }

  await saveState(app, state);

  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
