import { loadState, saveState } from "../data/store.js";
import { TRACK_TYPES, INTERVAL_PERIODS } from "../constants.js";
import { getTodayString } from "../engine/streakEngine.js";

/**
 * Prompts user to select a note, parses tasks from that note, and imports selected tasks as habit streaks.
 * @param {object} app
 */
export async function handleImportFromNote(app) {
  const notePrompt = await app.prompt("Select a Note to Import Tasks", {
    inputs: [
      {
        type: "note",
        label: "Source Note",
        placeholder: "Choose note containing recurring tasks..."
      }
    ]
  });

  if (!notePrompt || !Array.isArray(notePrompt) || !notePrompt[0]) {
    return;
  }

  const selectedNote = notePrompt[0];
  const noteUUID = selectedNote.uuid || selectedNote;

  let tasks = [];
  try {
    if (typeof app.getNoteTasks === "function") {
      tasks = await app.getNoteTasks({ uuid: noteUUID });
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
          const match = line.match(/^(\s*[-*]\s*\[[ xX]\]\s*)(.+)/);
          if (match) {
            tasks.push({ content: match[2].trim() });
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

  const taskInputs = tasks.slice(0, 15).map((t, idx) => ({
    type: "checkbox",
    label: `${idx + 1}. ${t.content || t.name || 'Task'}`,
    value: true
  }));

  const confirmResult = await app.prompt("Select Tasks to Track as Habits", {
    inputs: taskInputs
  });

  if (!confirmResult || !Array.isArray(confirmResult)) {
    return;
  }

  const todayStr = getTodayString();
  const state = await loadState(app);
  state.habits = state.habits || [];

  const colorThemes = ["emerald", "blue", "indigo", "teal", "purple", "amber", "rose"];
  let importedCount = 0;

  confirmResult.forEach((isChecked, idx) => {
    if (isChecked && tasks[idx]) {
      const taskObj = tasks[idx];
      const taskText = taskObj.content || taskObj.name || `Task ${idx + 1}`;
      
      const newHabit = {
        id: `habit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        name: taskText,
        icon: "📝",
        type: TRACK_TYPES.SKIP, // Default to Quitly style (done unless skipped)
        colorTheme: colorThemes[(state.habits.length + importedCount) % colorThemes.length],
        interval: 1,
        intervalPeriod: INTERVAL_PERIODS.DAY,
        createdAt: `${todayStr}T00:00:00.000Z`,
        streakAnchor: `${todayStr}T00:00:00.000Z`,
        skips: [],
        completions: [],
        events: [],
        resetLogs: []
      };

      state.habits.push(newHabit);
      importedCount++;
    }
  });

  if (importedCount > 0) {
    await saveState(app, state);
    await app.alert(`Successfully imported ${importedCount} task(s) to Habit Streaks!`);
    
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  }
}
