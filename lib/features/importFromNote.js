import { mutateState } from "../data/store.js";
import { TRACK_TYPES, INTERVAL_PERIODS, generateUniqueId, COLOR_THEMES } from "../constants.js";
import { getTodayString } from "../engine/streakEngine.js";

/**
 * Cleans raw task text by stripping markdown images, link wrappers, HTML tags,
 * transclusions, text formatting markers, and extraneous tags, returning a clean display title.
 * @param {string} raw - Raw task text or markdown string.
 * @returns {string} Cleaned single-line task title.
 */
export function cleanTaskTitle(raw) {
  if (!raw) return "";
  let text = String(raw).trim();

  // 1. Multi-line normalization: take only the first line
  if (text.includes("\n")) {
    text = text.split(/\r?\n/)[0].trim();
  }

  // 2. Strip task checkbox syntax if still present (- [ ], * [x], etc.)
  text = text.replace(/^[-*]?\s*\[\s*[xX]?\s*\]\s*/, "");

  // 3. Strip markdown image tags: ![alt](url) or ![alt][ref]
  text = text.replace(/!\[.*?\](?:\(.*?\)|\[.*?\])/g, "");

  // 4. Convert markdown links [Label](url) -> Label
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 5. Convert Amplenote/Obsidian wiki links [[Note Title]] -> Note Title
  text = text.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1");

  // 6. Strip HTML tags <span ...>text</span> -> text
  text = text.replace(/<[^>]+>/g, "");

  // 7. Strip bold/italic/strikethrough/code markers: **text**, *text*, ~~text~~, `text`
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  text = text.replace(/~~(.*?)~~/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");

  // 8. Clean trailing hashtag tokens (#habit, #daily, etc.) commonly appended for filtering
  text = text.replace(/\s+#[\w/-]+/g, "");

  // 9. Collapse multiple whitespace and trim
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Extracts a leading emoji if present, returning both the emoji and remaining title.
 * @param {string} text - Cleaned task text.
 * @param {string} defaultEmoji - Fallback emoji icon.
 * @returns {{ emoji: string, title: string }}
 */
export function extractTaskEmojiAndTitle(text, defaultEmoji = "📝") {
  if (!text) return { emoji: defaultEmoji, title: "" };

  // Match leading emoji (Extended Pictographic, Presentation, Dingbats/Misc symbols)
  const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u2600-\u27BF])\s*/u;
  const match = text.match(emojiRegex);

  if (match) {
    const emoji = match[1];
    const title = text.slice(match[0].length).trim();
    return {
      emoji,
      title: title || text
    };
  }

  return {
    emoji: defaultEmoji,
    title: text
  };
}

/**
 * Extracts a readable, cleaned task label from a task object.
 * @param {object} taskObj - Task object from Amplenote or markdown parser.
 * @param {string} fallback - Fallback label if text is empty.
 * @returns {string}
 */
export function getTaskDisplayText(taskObj, fallback = "Task") {
  if (!taskObj) return fallback;
  const raw = taskObj.content || taskObj.name || taskObj.text || fallback;
  const cleaned = cleanTaskTitle(raw);
  return cleaned || fallback;
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

    const taskLimit = 25;
    const taskSlice = tasks.slice(0, taskLimit);
    const taskInputs = taskSlice.map((t, idx) => ({
      type: "checkbox",
      label: `${idx + 1}. ${getTaskDisplayText(t, "Task")}`,
      value: true
    }));

    const promptTitle = tasks.length > taskLimit
      ? `Select Tasks to Track (Showing first ${taskLimit} of ${tasks.length})`
      : "Select Tasks to Track as Habits";

    const confirmResult = await app.prompt(promptTitle, {
      inputs: taskInputs
    });

    if (confirmResult === null || confirmResult === undefined) {
      return;
    }

    const isCheckedArray = Array.isArray(confirmResult) ? confirmResult : [confirmResult];
    const selectedTasks = taskSlice.filter((_, idx) => isCheckedArray[idx]);

    if (selectedTasks.length === 0) {
      return;
    }

    const todayStr = getTodayString();
    const nowISO = new Date().toISOString();
    const colorThemes = ["emerald", "blue", "indigo", "teal", "purple", "amber", "rose", "bronze"];
    const newHabits = [];

    for (let i = 0; i < selectedTasks.length; i++) {
      const taskObj = selectedTasks[i];
      const rawText = taskObj.content || taskObj.name || taskObj.text || "";
      const cleaned = cleanTaskTitle(rawText) || `Task ${i + 1}`;
      const { emoji: detectedEmoji, title: defaultTitle } = extractTaskEmojiAndTitle(cleaned, "📝");
      const defaultTheme = colorThemes[i % colorThemes.length];

      const titlePrefix = selectedTasks.length > 1 ? `(${i + 1}/${selectedTasks.length}) ` : "";
      const configResult = await app.prompt(`Configure Habit: ${titlePrefix}${defaultTitle.slice(0, 28)}`, {
        inputs: [
          {
            type: "string",
            label: "Emoji Icon (🔥, 🏃, 📚, 🧘, 🍷...)",
            value: detectedEmoji
          },
          {
            type: "string",
            label: "Habit / Counter Name",
            value: defaultTitle
          },
          {
            type: "select",
            label: "Tracking Philosophy",
            options: [
              { label: "Building / Good Habit (Positive Action: completed when marked)", value: TRACK_TYPES.COMPLETE },
              { label: "Quitting / Bad Habit (Sobriety & Abstinence: clean unless slipped)", value: TRACK_TYPES.SKIP }
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
          }
        ]
      });

      if (!configResult) {
        continue;
      }

      const configArray = Array.isArray(configResult) ? configResult : [configResult];
      const [iconVal, nameVal, typeVal, themeVal] = configArray;

      const finalName = (nameVal && String(nameVal).trim()) ? String(nameVal).trim() : defaultTitle;
      const finalIcon = (iconVal && String(iconVal).trim()) ? String(iconVal).trim() : detectedEmoji;
      const finalType = (typeVal === TRACK_TYPES.COMPLETE || typeVal === TRACK_TYPES.SKIP) ? typeVal : TRACK_TYPES.COMPLETE;
      const finalTheme = (themeVal && COLOR_THEMES[themeVal]) ? themeVal : defaultTheme;

      const habitId = generateUniqueId("habit");
      const newHabit = {
        id: habitId,
        name: finalName,
        icon: finalIcon,
        type: finalType,
        colorTheme: finalTheme,
        interval: {
          n: 1,
          period: INTERVAL_PERIODS.DAY
        },
        createdAt: nowISO,
        trackingStartDate: todayStr,
        streakAnchor: nowISO,
        streakStartedAt: nowISO,
        skips: [],
        completions: [],
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
