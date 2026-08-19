import { loadState, saveState } from "../data/store.js";

/**
 * Handles deleting/untracking a habit.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - Habit ID to delete.
 * @returns {Promise<void>}
 */
export async function handleDeleteHabit(app, habitId) {
  if (!habitId) return;

  try {
    const state = await loadState(app);
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const confirm = await app.prompt(`Delete Habit: "${habit.name}"?`, {
      inputs: [
        {
          type: "checkbox",
          label: "Confirm removing this habit from streak tracking",
          value: true
        }
      ]
    });

    if (!confirm) return;
    const isConfirmed = Array.isArray(confirm) ? confirm[0] : confirm;
    if (!isConfirmed) return;

    state.habits = state.habits.filter(h => h.id !== habitId);
    if (state.activeHabitId === habitId) {
      state.activeHabitId = state.habits.length > 0 ? state.habits[0].id : null;
    }

    await saveState(app, state);

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleDeleteHabit:", err);
    await app.alert(`Failed to delete habit: ${err.message || err}`);
  }
}

/**
 * Handles selecting an active habit tab.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - Habit ID to select.
 * @returns {Promise<void>}
 */
export async function handleSelectHabit(app, habitId) {
  if (!habitId) return;

  try {
    const state = await loadState(app);
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    state.activeHabitId = habitId;
    await saveState(app, state);

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleSelectHabit:", err);
  }
}
