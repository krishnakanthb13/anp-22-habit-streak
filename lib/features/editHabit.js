import { INTERVAL_PERIODS, TRACK_TYPES, COLOR_THEMES } from "../constants.js";
import { loadState, mutateState } from "../data/store.js";

/**
 * Handles editing an existing habit's settings via user prompt.
 * @param {object} app - Amplenote App instance.
 * @param {string} habitId - ID of habit to edit.
 * @returns {Promise<void>}
 */
export async function handleEditHabit(app, habitId) {
  if (!habitId) return;

  try {
    const state = await loadState(app);
    const habitToEdit = (state.habits || []).find(h => h.id === habitId);

    if (!habitToEdit) {
      await app.alert("Habit not found.");
      return;
    }

    const currentIcon = habitToEdit.icon || "🔥";
    const currentTheme = habitToEdit.colorTheme || "blue";
    const currentIntervalN = (habitToEdit.interval && habitToEdit.interval.n) ? String(habitToEdit.interval.n) : "1";
    const currentIntervalPeriod = (habitToEdit.interval && habitToEdit.interval.period) ? habitToEdit.interval.period : INTERVAL_PERIODS.DAY;
    const currentType = habitToEdit.type || TRACK_TYPES.SKIP;

    const result = await app.prompt(`Edit Counter: ${habitToEdit.name}`, {
      inputs: [
        {
          type: "string",
          label: "Emoji Icon (Paste or type any emoji: 🔥, 🏃, 🍷, 📚...)",
          value: currentIcon
        },
        {
          type: "string",
          label: "Habit / Counter Name",
          value: habitToEdit.name
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
            { label: "Quitting / Bad Habit (Sobriety & Abstinence: clean unless slipped)", value: TRACK_TYPES.SKIP },
            { label: "Building / Good Habit (Positive Action: completed when marked)", value: TRACK_TYPES.COMPLETE }
          ],
          value: currentType
        }
      ]
    });

    if (!result || !Array.isArray(result)) {
      return;
    }

    const [iconVal, nameVal, themeVal, typeVal] = result;

    if (!nameVal || !String(nameVal).trim()) {
      await app.alert("Habit name cannot be empty.");
      return;
    }

    const colorTheme = (themeVal && COLOR_THEMES[themeVal]) ? themeVal : "blue";
    const habitType = (typeVal === TRACK_TYPES.COMPLETE || typeVal === TRACK_TYPES.SKIP) ? typeVal : TRACK_TYPES.SKIP;

    const hasHistory = (habitToEdit.completions && habitToEdit.completions.length > 0) ||
                       (habitToEdit.skips && habitToEdit.skips.length > 0);
    const typeChanged = habitToEdit.type !== habitType;

    if (hasHistory && typeChanged) {
      const confirmRecalc = await app.prompt("Warning: Tracking Philosophy Changed", {
        inputs: [
          {
            type: "checkbox",
            label: "Changing tracking philosophy will recalculate historical streaks and stats against the new rules. Confirm?",
            value: true
          }
        ]
      });
      const confirmed = Array.isArray(confirmRecalc) ? confirmRecalc[0] : (confirmRecalc && confirmRecalc.confirm);
      if (!confirmed) {
        await app.alert("Habit settings change cancelled to preserve historical streaks.");
        return;
      }
    }

    await mutateState(app, async state => {
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;

      habit.icon = (iconVal && String(iconVal).trim()) ? String(iconVal).trim() : "🔥";
      habit.name = String(nameVal).trim();
      habit.colorTheme = colorTheme;
      habit.type = habitType;
      habit.interval = {
        n: 1,
        period: INTERVAL_PERIODS.DAY
      };
    });

    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleEditHabit:", err);
    await app.alert(`Failed to edit habit: ${err.message || err}`);
  }
}
