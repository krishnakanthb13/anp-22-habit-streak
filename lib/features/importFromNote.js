import { mutateState } from "../data/store.js";
import { TRACK_TYPES, INTERVAL_PERIODS, generateUniqueId, COLOR_THEMES } from "../constants.js";
import { getTodayString } from "../engine/streakEngine.js";

/**
 * Extracts a readable task label from a task object.
 * @param {object} taskObj - Task object from Amplenote or markdown parser.
 * @param {string} fallback - Fallback label if text is empty.
 * @returns {string}
 */
function getTaskDisplayText(taskObj, fallback = "Task") {
  if (!taskObj) return fallback;
  const raw = taskObj.content || taskObj.name || taskObj.text || fallback;
  return String(raw).trim() || fallback;
}

/**
 * Prompts user to select a note, parses tasks from that note, and imports selected tasks as habit streaks.
 * @param {object} app - Amplenote App instance.
 * @returns {Promise<void>}
 */
export async function handleImportFromNote(app) {
  try {
    const notePrompt = await app.prompt("Select a Note to Import Tasks", {
      inputs: [
        {
          type: "note",
          label: "Source Note",
          placeholder: "Choose note containing recurring tasks..."
        }
      ]
    });

    if (!notePrompt) {
      return;
    }

    // When app.prompt has a single input with no actions, it returns the value directly (not an array)
    const selectedNote = Array.isArray(notePrompt) ? notePrompt[0] : notePrompt;
    if (!selectedNote) {
      return;
    }

    let noteUUID = null;
    if (typeof selectedNote === "object" && selectedNote !== null) {
      noteUUID = selectedNote.uuid || selectedNote.id;
    } else if (typeof selectedNote === "string") {
      // If it's a markdown link or raw UUID string
      const match = selectedNote.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      noteUUID = match ? match[1] : selectedNote;
    }

    if (!noteUUID) {
      await app.alert("Could not identify the selected note.");
      return;
    }

    let tasks = [];
    try {
      if (typeof app.getNoteTasks === "function") {
        tasks = await app.getNoteTasks({ uuid: noteUUID }, { includeDone: true });
      }
    } catch (err) {
      console.warn("[HabitStreak] app.getNoteTasks error, falling back to note content parsing:", err);
    }

    // Fallback to parsing task markdown lines if getNoteTasks returned empty
    if (!tasks || tasks.length === 0) {
      try {
        const content = await app.getNoteContent({ uuid: noteUUID });
        if (content) {
          const lines = content.split("\n");
          for (const line of lines) {
            const match = line.match(/^\s*[-*]?\s*\[\s*[xX]?\s*\]\s*(.+)/);
            if (match) {
              tasks.push({ content: match[1].trim() });
            }
          }
        }
      } catch (err) {
        console.error("[HabitStreak] Error getting note content:", err);
      }
    }

    if (!tasks || tasks.length === 0) {
      await app.alert("No tasks found in the selected note.");
      return;
    }

    const taskInputs = tasks.slice(0, 25).map((t, idx) => ({
      type: "checkbox",
      label: `${idx + 1}. ${getTaskDisplayText(t, "Task")}`,
      value: true
    }));

    const confirmResult = await app.prompt("Select Tasks to Track as Habits", {
      inputs: taskInputs
    });

    if (confirmResult === null || confirmResult === undefined) {
      return;
    }

    const isCheckedArray = Array.isArray(confirmResult) ? confirmResult : [confirmResult];
    const selectedTasks = tasks.filter((_, idx) => isCheckedArray[idx]);

    if (selectedTasks.length === 0) {
      return;
    }

    const todayStr = getTodayString();
    const nowISO = new Date().toISOString();
    const colorThemes = ["emerald", "blue", "indigo", "teal", "purple", "amber", "rose", "bronze"];
    const newHabits = [];

    for (let i = 0; i < selectedTasks.length; i++) {
      const taskObj = selectedTasks[i];
      const taskText = getTaskDisplayText(taskObj, `Task ${i + 1}`);
      const defaultTheme = colorThemes[i % colorThemes.length];

      const titlePrefix = selectedTasks.length > 1 ? `(${i + 1}/${selectedTasks.length}) ` : "";
      const configResult = await app.prompt(`Configure Habit: ${titlePrefix}${taskText.slice(0, 28)}`, {
        inputs: [
          {
            type: "string",
            label: "Emoji Icon (🔥, 🏃, 📚, 🧘, 🍷...)",
            value: "📝"
          },
          {
            type: "string",
            label: "Habit / Counter Name",
            value: taskText
          },
          {
            type: "select",
            label: "Tracking Philosophy",
            options: [
              { label: "✨ Positive Habit (Considered done when marked)", value: TRACK_TYPES.COMPLETE },
              { label: "🛡️ Bad Habit / Abstinence (Considered done unless skipped)", value: TRACK_TYPES.SKIP }
            ],
            value: TRACK_TYPES.COMPLETE
          },
          {
            type: "select",
            label: "Color Theme",
            options: [
              { label: "Emerald (Green)", value: "emerald" },
              { label: "Sky Blue", value: "blue" },
              { label: "Indigo (Navy)", value: "indigo" },
              { label: "Teal (Cyan)", value: "teal" },
              { label: "Purple (Violet)", value: "purple" },
              { label: "Amber (Orange/Gold)", value: "amber" },
              { label: "Rose (Pink/Red)", value: "rose" },
              { label: "Bronze (Warm Brown)", value: "bronze" }
            ],
            value: defaultTheme
          },
          {
            type: "string",
            label: "Every (Number)",
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

      if (!configResult) {
        continue;
      }

      const configArray = Array.isArray(configResult) ? configResult : [configResult];
      const [iconVal, nameVal, typeVal, themeVal, periodNVal, periodUnitVal] = configArray;

      const finalName = (nameVal && String(nameVal).trim()) ? String(nameVal).trim() : taskText;
      const finalIcon = (iconVal && String(iconVal).trim()) ? String(iconVal).trim() : "📝";
      const finalType = (typeVal === TRACK_TYPES.COMPLETE || typeVal === TRACK_TYPES.SKIP) ? typeVal : TRACK_TYPES.COMPLETE;
      const finalTheme = (themeVal && COLOR_THEMES[themeVal]) ? themeVal : defaultTheme;

      const parsedN = parseInt(periodNVal, 10);
      const periodN = (!isNaN(parsedN) && parsedN >= 1 && parsedN <= 365) ? parsedN : 1;
      const periodUnit = [INTERVAL_PERIODS.DAY, INTERVAL_PERIODS.WEEK, INTERVAL_PERIODS.MONTH].includes(periodUnitVal)
        ? periodUnitVal
        : INTERVAL_PERIODS.DAY;

      const habitId = generateUniqueId("habit");
      const newHabit = {
        id: habitId,
        name: finalName,
        icon: finalIcon,
        type: finalType,
        colorTheme: finalTheme,
        interval: {
          n: periodN,
          period: periodUnit
        },
        createdAt: nowISO,
        trackingStartDate: todayStr,
        streakAnchor: nowISO,
        streakStartedAt: nowISO,
        skips: [],
        completions: finalType === TRACK_TYPES.COMPLETE ? [todayStr] : [],
        events: [],
        resetLogs: []
      };

      newHabits.push(newHabit);
    }

    if (newHabits.length > 0) {
      await mutateState(app, async state => {
        state.habits = state.habits || [];
        for (const habit of newHabits) {
          state.habits.push(habit);
        }
        state.activeHabitId = newHabits[newHabits.length - 1].id;
      });

      await app.alert(`Successfully imported ${newHabits.length} habit(s)!`);

      if (app.context && typeof app.context.renderEmbed === "function") {
        await app.context.renderEmbed();
      }
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleImportFromNote:", err);
    await app.alert(`Failed to import habits: ${err.message || err}`);
  }
}
