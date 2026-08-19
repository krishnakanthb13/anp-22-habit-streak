import { mutateState } from "../data/store.js";
import { getTodayString } from "../engine/streakEngine.js";
import { generateUniqueId } from "../constants.js";

/**
 * Handles toggling a specific day between completed and skipped.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - Habit ID.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} currentStatus - Current status string ("completed" | "skipped" | "not_applicable")
 * @returns {Promise<void>}
 */
export async function handleToggleDay(app, habitId, dateStr, currentStatus) {
  if (!habitId || !dateStr) return;

  try {
    let linkedTaskUUID = null;
    let toggledToDone = false;

    await mutateState(app, async state => {
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;

      habit.skips = habit.skips || [];
      habit.completions = habit.completions || [];
      habit.events = habit.events || [];

      if (currentStatus === "completed") {
        // Toggle to skipped
        habit.completions = habit.completions.filter(d => d !== dateStr);
        if (!habit.skips.includes(dateStr)) {
          habit.skips.push(dateStr);
        }
        toggledToDone = false;
      } else {
        // Toggle to completed
        habit.skips = habit.skips.filter(d => d !== dateStr);
        if (!habit.completions.includes(dateStr)) {
          habit.completions.push(dateStr);
        }
        toggledToDone = true;
      }

      if (habit.taskUUID) {
        linkedTaskUUID = habit.taskUUID;
      }
    });

    // Update underlying Amplenote task if linked and today is toggled
    const todayStr = getTodayString();
    if (dateStr === todayStr && linkedTaskUUID) {
      try {
        if (toggledToDone) {
          await app.updateTask(linkedTaskUUID, { completedAt: Math.floor(Date.now() / 1000) });
        } else {
          await app.updateTask(linkedTaskUUID, { completedAt: null });
        }
      } catch (err) {
        console.warn("[HabitStreak] Task update sync:", err);
      }
    }

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleToggleDay:", err);
    await app.alert(`Failed to toggle day: ${err.message || err}`);
  }
}

/**
 * Handles batch saving full calendar edits for a habit.
 * Maintains immutable createdAt and records an explicit audit event.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - Habit ID.
 * @param {string[]} skips - Array of skipped date strings (YYYY-MM-DD).
 * @param {string[]} completions - Array of completed date strings (YYYY-MM-DD).
 * @returns {Promise<void>}
 */
export async function handleSaveCalendarEdits(app, habitId, skips, completions) {
  if (!habitId) return;

  try {
    await mutateState(app, async state => {
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;

      if (Array.isArray(skips)) habit.skips = Array.from(new Set(skips)).sort();
      if (Array.isArray(completions)) habit.completions = Array.from(new Set(completions)).sort();
      habit.events = habit.events || [];

      // If there are recorded dates earlier than trackingStartDate, adjust trackingStartDate
      const allRecordedDates = [...(habit.completions || []), ...(habit.skips || [])].filter(Boolean).sort();
      if (allRecordedDates.length > 0) {
        const earliest = allRecordedDates[0];
        const currentTrackingStart = habit.trackingStartDate || (habit.createdAt ? habit.createdAt.split("T")[0] : earliest);
        if (earliest < currentTrackingStart) {
          habit.trackingStartDate = earliest;
        }
      }

      // Record calendar edit audit log
      habit.events.push({
        id: generateUniqueId("event"),
        type: "calendar_edit",
        date: getTodayString(),
        note: `Calendar history edited (${habit.completions.length} done, ${habit.skips.length} skips)`,
        timestamp: new Date().toISOString()
      });
    });

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleSaveCalendarEdits:", err);
    await app.alert(`Failed to save calendar edits: ${err.message || err}`);
  }
}
