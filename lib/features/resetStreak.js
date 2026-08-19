import { loadState, mutateState } from "../data/store.js";
import { getDateRange, getTodayString, calculateHabitStats } from "../engine/streakEngine.js";
import { generateUniqueId, TRACK_TYPES } from "../constants.js";

/**
 * Marks today as skipped for the active habit (or adds a new skip event).
 * Prompts user for confirmation and optional reflection note.
 * Supports logging multiple slip events for the day.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - Habit ID.
 * @returns {Promise<void>}
 */
export async function handleSkipToday(app, habitId) {
  if (!habitId) return;

  try {
    const todayStr = getTodayString();
    const state = await loadState(app);
    const habit = (state.habits || []).find(h => h.id === habitId);
    if (!habit) return;

    const habitName = habit.name;
    const isQuitly = habit.type === TRACK_TYPES.SKIP;
    const alreadySkippedToday = (habit.skips || []).includes(todayStr);
    const stats = calculateHabitStats(habit, todayStr);
    const currentStreak = stats.currentStreak;

    const promptTitle = isQuitly
      ? (alreadySkippedToday ? "Log Additional Slip (+1)" : "Log Slip / Reset Today")
      : "Mark Missed / Skip Today";

    const result = await app.prompt(promptTitle, {
      inputs: [
        {
          type: "string",
          label: "Reflection / Reason Note (Optional)",
          placeholder: "e.g., Felt tempted or overwhelmed, resetting with renewed focus"
        },
        {
          type: "checkbox",
          label: `Confirm logging a ${isQuitly ? "slip/reset" : "missed day"} for ${habitName}? (Current streak: ${currentStreak} days)`,
          value: true
        }
      ]
    });

    if (!result) return;
    const noteVal = Array.isArray(result) ? result[0] : (typeof result === "object" ? result.note : "");
    const confirmVal = Array.isArray(result) ? result[1] : (typeof result === "object" ? result.confirm : true);

    if (confirmVal === false) return;

    const noteText = (noteVal && String(noteVal).trim()) ? String(noteVal).trim() : (isQuitly ? "Daily slip logged" : "Marked missed today");
    const nowISO = new Date().toISOString();

    await mutateState(app, async state => {
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;

      const stats = calculateHabitStats(habit, todayStr);

      habit.skips = habit.skips || [];
      habit.completions = habit.completions || [];
      habit.resetLogs = habit.resetLogs || [];
      habit.events = habit.events || [];

      // Add audit event with unique ID
      habit.events.push({
        id: generateUniqueId("event"),
        type: "skip",
        date: todayStr,
        note: noteText,
        streakLength: stats.currentStreak,
        timestamp: nowISO
      });

      if (!habit.skips.includes(todayStr)) {
        habit.skips.push(todayStr);
      }

      habit.resetLogs.push({
        id: generateUniqueId("reset"),
        date: todayStr,
        streakLength: stats.currentStreak,
        note: noteText,
        timestamp: nowISO
      });

      habit.completions = habit.completions.filter(d => d !== todayStr);

      // Re-anchor streak timestamp to now for live timer
      habit.streakAnchor = nowISO;
      habit.streakStartedAt = nowISO;
    });

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleSkipToday:", err);
    await app.alert(`Failed to log slip/skip: ${err.message || err}`);
  }
}

/**
 * Undoes today's latest action or restores previous day status without destroying full audit trail.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - Habit ID.
 * @returns {Promise<void>}
 */
export async function handleUndoToday(app, habitId) {
  if (!habitId) return;

  try {
    const todayStr = getTodayString();

    await mutateState(app, async state => {
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;

      habit.skips = (habit.skips || []).filter(d => d !== todayStr);
      habit.completions = (habit.completions || []).filter(d => d !== todayStr);

      // Remove only the latest event for today if present
      if (Array.isArray(habit.events) && habit.events.length > 0) {
        let lastTodayIdx = -1;
        for (let i = habit.events.length - 1; i >= 0; i--) {
          if (habit.events[i].date === todayStr) {
            lastTodayIdx = i;
            break;
          }
        }
        if (lastTodayIdx !== -1) {
          habit.events.splice(lastTodayIdx, 1);
        }
      }

      // Remove latest resetLog for today if present
      if (Array.isArray(habit.resetLogs) && habit.resetLogs.length > 0) {
        let lastTodayResetIdx = -1;
        for (let i = habit.resetLogs.length - 1; i >= 0; i--) {
          if (habit.resetLogs[i].date === todayStr) {
            lastTodayResetIdx = i;
            break;
          }
        }
        if (lastTodayResetIdx !== -1) {
          habit.resetLogs.splice(lastTodayResetIdx, 1);
        }
      }
    });

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleUndoToday:", err);
    await app.alert(`Failed to undo today's action: ${err.message || err}`);
  }
}

/**
 * Marks today as completed for the active habit (or adds multiple completions).
 * Prompts user for optional reflection/log message.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - Habit ID.
 * @returns {Promise<void>}
 */
export async function handleCompleteToday(app, habitId) {
  if (!habitId) return;

  try {
    const todayStr = getTodayString();
    const state = await loadState(app);
    const habit = (state.habits || []).find(h => h.id === habitId);
    if (!habit) return;

    const habitName = habit.name;
    const alreadyDoneToday = (habit.completions || []).includes(todayStr);

    const result = await app.prompt(alreadyDoneToday ? "Log Additional Completion (+1)" : "Mark Done Today", {
      inputs: [
        {
          type: "string",
          label: "Session Note / Reflection (Optional)",
          placeholder: "e.g., Completed morning workout, read chapter 3"
        },
        {
          type: "checkbox",
          label: `Confirm logging completion for ${habitName}?`,
          value: true
        }
      ]
    });

    if (!result) return;
    const noteVal = Array.isArray(result) ? result[0] : (typeof result === "object" ? result.note : "");
    const confirmVal = Array.isArray(result) ? result[1] : (typeof result === "object" ? result.confirm : true);

    if (confirmVal === false) return;

    const noteText = (noteVal && String(noteVal).trim()) ? String(noteVal).trim() : "Completed session";
    const nowISO = new Date().toISOString();

    await mutateState(app, async state => {
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;

      habit.skips = habit.skips || [];
      habit.completions = habit.completions || [];
      habit.events = habit.events || [];

      habit.events.push({
        id: generateUniqueId("event"),
        type: "done",
        date: todayStr,
        note: noteText,
        timestamp: nowISO
      });

      habit.skips = habit.skips.filter(d => d !== todayStr);
      if (!habit.completions.includes(todayStr)) {
        habit.completions.push(todayStr);
      }

      // If starting new streak, ensure valid streak anchor
      if (!habit.streakStartedAt) {
        habit.streakStartedAt = nowISO;
        habit.streakAnchor = nowISO;
      }
    });

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleCompleteToday:", err);
    await app.alert(`Failed to complete today: ${err.message || err}`);
  }
}

/**
 * Prompts user to pick a date and optional note/reason to reset streak (Reset with Notes).
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - Habit ID.
 * @returns {Promise<void>}
 */
export async function handleResetToDate(app, habitId) {
  if (!habitId) return;

  try {
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

    const startDateStr = String(startDateVal).trim();
    const rangeDates = getDateRange(startDateStr, todayStr);
    if (rangeDates.length === 0) {
      await app.alert("Invalid start date provided.");
      return;
    }

    const noteText = (noteVal && String(noteVal).trim()) ? String(noteVal).trim() : "Reset logged";
    const nowISO = new Date().toISOString();

    await mutateState(app, async state => {
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
        id: generateUniqueId("event"),
        type: "skip",
        date: startDateStr,
        note: noteText,
        timestamp: nowISO
      });

      habit.resetLogs.push({
        id: generateUniqueId("reset"),
        date: startDateStr,
        streakLength: stats.currentStreak,
        note: noteText,
        timestamp: nowISO
      });

      // Update anchor to the chosen reset date
      const resetAnchorISO = `${startDateStr}T00:00:00Z`;
      habit.streakAnchor = resetAnchorISO;
      habit.streakStartedAt = resetAnchorISO;
    });

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleResetToDate:", err);
    await app.alert(`Failed to reset counter: ${err.message || err}`);
  }
}
