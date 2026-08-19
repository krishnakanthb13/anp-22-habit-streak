import { DATA_NOTE_NAME, DATA_NOTE_TAGS, DEFAULT_STATE } from "../constants.js";

export const SETTING_DATA_NOTE_UUID = "Habit_Streak_Data_UUID [Do not Edit!]";

/**
 * Resolves the UUID for a persistent plugin data note.
 * Handles temporary local- UUID resolution and updates plugin settings automatically.
 * Follows the repository standard from common-issues-and-fixes/local-uuid-handling.md.
 *
 * @param {Object} app - Amplenote plugin API object.
 * @param {string} noteName - Exact title of the target note.
 * @param {Array<string>} tagNames - Array of tag strings associated with the note.
 * @param {string} settingKey - The plugin setting key used to persist the UUID.
 * @returns {Promise<string>} - Resolves to the permanent online note UUID.
 */
export async function getNoteUUID(app, noteName, tagNames, settingKey) {
  // 1. Retrieve the stored UUID from settings
  const existingUUID = app.settings ? await app.settings[settingKey] : null;

  if (existingUUID) {
    // 2. Check if stored UUID is a temporary local reference
    if (existingUUID.startsWith("local-")) {
      try {
        const allNotes = await app.filterNotes({});

        if (allNotes && Array.isArray(allNotes)) {
          const matchingNotes = allNotes.filter(note => {
            const nameMatches = note.name === noteName;
            const tagMatches = note.tags && tagNames.every(tag => note.tags.includes(tag));
            return nameMatches && tagMatches;
          });

          // Find first synced online note (UUID without "local-" prefix)
          const onlineNote = matchingNotes.find(note => note.uuid && !note.uuid.startsWith("local-"));

          if (onlineNote && onlineNote.uuid) {
            if (typeof app.setSetting === "function") {
              await app.setSetting(settingKey, onlineNote.uuid);
            }
            return onlineNote.uuid;
          }

          if (matchingNotes.length > 0 && matchingNotes[0].uuid) {
            return matchingNotes[0].uuid;
          }
        }

        // Verify local note still exists
        try {
          const localNote = await app.findNote({ uuid: existingUUID });
          if (localNote) return existingUUID;
        } catch (findErr) {
          console.warn("[HabitStreak] Verification of local UUID note failed:", findErr);
        }
      } catch (error) {
        console.error("[HabitStreak] Error resolving note UUID:", error);
      }
    } else {
      // Already a valid online UUID
      return existingUUID;
    }
  }

  // 3. Search notes in-memory before creating a duplicate
  try {
    const allNotes = await app.filterNotes({});
    if (allNotes && Array.isArray(allNotes)) {
      const match = allNotes.find(n => n.name === noteName);
      if (match && match.uuid) {
        if (typeof app.setSetting === "function") {
          await app.setSetting(settingKey, match.uuid);
        }
        return match.uuid;
      }
    }
  } catch (err) {
    console.warn("[HabitStreak] filterNotes search error:", err);
  }

  // 4. Create new note and persist UUID in settings
  try {
    const newUUID = await app.createNote(noteName, tagNames);
    if (typeof app.setSetting === "function") {
      await app.setSetting(settingKey, newUUID);
    }
    return newUUID;
  } catch (error) {
    console.error("[HabitStreak] Error creating note:", error);
    throw error;
  }
}

/**
 * Extracts and parses JSON stored inside a markdown code block (```json ... ``` or ``` ... ```).
 * @param {string} content - Markdown content of the note.
 * @returns {object|null} - Parsed JavaScript object, or null if not found/invalid.
 */
export function extractJsonFromMarkdown(content) {
  if (!content || typeof content !== "string") {
    return null;
  }

  // Match ```json ... ``` or generic ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = content.match(codeBlockRegex);

  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (err) {
      console.error("[HabitStreak] Error parsing JSON from code block:", err);
    }
  }

  // Fallback: try parsing whole content if bare JSON
  try {
    return JSON.parse(content.trim());
  } catch (err) {
    return null;
  }
}

/**
 * Formats a state object into markdown containing a fenced JSON code block.
 * @param {object} state - State to serialize.
 * @returns {string} - Markdown string with ```json block.
 */
export function formatStateAsMarkdown(state) {
  const jsonStr = JSON.stringify(state, null, 2);
  return `# Habit Streak Data\n\n> This note is automatically managed by the Habit Streak plugin. Do not modify the JSON code block manually unless you know what you are doing.\n\n\`\`\`json\n${jsonStr}\n\`\`\`\n`;
}

/**
 * Loads the current plugin state from the habit_streak_data note.
 * @param {object} app - Amplenote App instance.
 * @returns {Promise<object>} - Plugin state object.
 */
export async function loadState(app) {
  try {
    const dataNoteUUID = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    const content = await app.getNoteContent({ uuid: dataNoteUUID });
    const parsed = extractJsonFromMarkdown(content);

    if (parsed && typeof parsed === "object") {
      return {
        ...DEFAULT_STATE,
        ...parsed,
        habits: Array.isArray(parsed.habits) ? parsed.habits : []
      };
    }

    // Initialize with default state if empty
    const fallbackState = { ...DEFAULT_STATE };
    const markdown = formatStateAsMarkdown(fallbackState);
    await app.replaceNoteContent({ uuid: dataNoteUUID }, markdown);
    return fallbackState;
  } catch (err) {
    console.error("[HabitStreak] Failed to load state:", err);
    return { ...DEFAULT_STATE };
  }
}

/**
 * Saves the given plugin state into the habit_streak_data note.
 * @param {object} app - Amplenote App instance.
 * @param {object} state - Full plugin state to save.
 * @returns {Promise<boolean>} - True if saved successfully.
 */
export async function saveState(app, state) {
  try {
    const dataNoteUUID = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    const markdown = formatStateAsMarkdown(state);
    await app.replaceNoteContent({ uuid: dataNoteUUID }, markdown);
    return true;
  } catch (err) {
    console.error("[HabitStreak] Failed to save state:", err);
    return false;
  }
}
