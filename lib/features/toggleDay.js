import { mutateState } from "../data/store.js";
import { getTodayString, isValidDateString } from "../engine/streakEngine.js";
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
  if (!habitId || !dateStr || !isValidDateString(dateStr)) return;

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
 * Maintains immutable createdAt and records an explicit audit event only when edits actually changed.
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

      const oldSkipsStr = (habit.skips || []).slice().sort().join(",");
      const oldCompsStr = (habit.completions || []).slice().sort().join(",");

      const validSkips = Array.isArray(skips)
        ? Array.from(new Set(skips.filter(isValidDateString))).sort()
        : [];
      const skipSet = new Set(validSkips);

      const rawCompletions = Array.isArray(completions)
        ? Array.from(new Set(completions.filter(isValidDateString))).sort()
        : [];
      // Invariant: mutually exclusive sets (skips take precedence)
      const validCompletions = rawCompletions.filter(d => !skipSet.has(d));

      habit.skips = validSkips;
      habit.completions = validCompletions;
      habit.events = habit.events || [];

      // If there are recorded dates earlier than trackingStartDate, adjust trackingStartDate
      const allRecordedDates = [...habit.completions, ...habit.skips].sort();
      if (allRecordedDates.length > 0) {
        const earliest = allRecordedDates[0];
        const currentTrackingStart = (habit.trackingStartDate && isValidDateString(habit.trackingStartDate))
          ? habit.trackingStartDate
          : (habit.createdAt ? habit.createdAt.split("T")[0] : earliest);
        if (earliest < currentTrackingStart) {
          habit.trackingStartDate = earliest;
        }
      }

      const newSkipsStr = habit.skips.join(",");
      const newCompsStr = habit.completions.join(",");
      const hasChanged = (oldSkipsStr !== newSkipsStr || oldCompsStr !== newCompsStr);

      // Record calendar edit audit log only if data actually changed
      if (hasChanged) {
        habit.events.push({
          id: generateUniqueId("event"),
          type: "calendar_edit",
          date: getTodayString(),
          note: `Calendar history edited (${habit.completions.length} done, ${habit.skips.length} skips)`,
          timestamp: new Date().toISOString()
        });
      }
    });

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleSaveCalendarEdits:", err);
    await app.alert(`Failed to save calendar edits: ${err.message || err}`);
  }
}
