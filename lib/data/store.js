import { DATA_NOTE_NAME, DATA_NOTE_TAGS, DEFAULT_STATE, TRACK_TYPES, INTERVAL_PERIODS, generateUniqueId, COLOR_THEMES, VALID_THEMES, VALID_EVENT_TYPES } from "../constants.js";
import { isValidDateString } from "../engine/streakEngine.js";

export const SETTING_DATA_NOTE_UUID = "Habit_Streak_Data_UUID [Do not Edit!]";

// In-flight mutation queue to serialize asynchronous read-modify-write operations
let mutationQueue = Promise.resolve();

/**
 * Validates whether a value is a strictly formatted ISO 8601 timestamp string.
 * @param {any} ts
 * @returns {boolean}
 */
/**
 * Validates whether a value is a strictly formatted ISO 8601 timestamp string
 * and corresponds to a real, valid calendar date and time.
 * @param {any} ts
 * @returns {boolean}
 */
export function isValidTimestamp(ts) {
  if (typeof ts !== "string") return false;
  const isoRegex = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
  const match = ts.match(isoRegex);
  if (!match) return false;

  const [, datePart, hh, mm, ss] = match;
  if (!isValidDateString(datePart)) return false;

  const h = Number(hh);
  const m = Number(mm);
  const s = Number(ss);
  if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) return false;

  const d = new Date(ts);
  return !isNaN(d.getTime());
}

/**
 * Normalizes an individual habit object to ensure type safety and schema integrity.
 * @param {object} habit - Raw or partial habit object.
 * @returns {object} - Validated and normalized habit object.
 */
export function normalizeHabit(habit) {
  if (!habit || typeof habit !== "object") {
    return null;
  }

  const id = (habit.id && typeof habit.id === "string" && habit.id.trim().length > 0)
    ? habit.id.trim()
    : generateUniqueId("habit");
  const name = (habit.name && typeof habit.name === "string")
    ? habit.name.trim().slice(0, 200)
    : "Untitled Habit";
  const icon = (habit.icon && typeof habit.icon === "string")
    ? habit.icon.trim().slice(0, 30)
    : "🔥";
  const colorTheme = (habit.colorTheme && COLOR_THEMES[habit.colorTheme]) ? habit.colorTheme : "blue";
  const type = (habit.type === TRACK_TYPES.COMPLETE || habit.type === TRACK_TYPES.SKIP)
    ? habit.type
    : TRACK_TYPES.SKIP;

  // Interval normalization
  let intervalN = 1;
  let intervalPeriod = INTERVAL_PERIODS.DAY;
  if (habit.interval && typeof habit.interval === "object") {
    const rawN = parseInt(habit.interval.n, 10);
    if (!isNaN(rawN) && rawN >= 1 && rawN <= 365) {
      intervalN = rawN;
    }
    if ([INTERVAL_PERIODS.DAY, INTERVAL_PERIODS.WEEK, INTERVAL_PERIODS.MONTH].includes(habit.interval.period)) {
      intervalPeriod = habit.interval.period;
    }
  }

  // Dates normalization
  const nowISO = new Date().toISOString();
  const rawCreated = habit.createdAt;
  const createdAt = (rawCreated && isValidTimestamp(rawCreated))
    ? rawCreated
    : (rawCreated && isValidDateString(rawCreated) ? `${rawCreated}T00:00:00.000Z` : nowISO);
  const createdDateStr = createdAt.split("T")[0];
  const trackingStartDate = (habit.trackingStartDate && isValidDateString(habit.trackingStartDate))
    ? habit.trackingStartDate
    : (isValidDateString(createdDateStr) ? createdDateStr : nowISO.split("T")[0]);

  const rawAnchor = habit.streakAnchor;
  const streakAnchor = (rawAnchor && isValidTimestamp(rawAnchor))
    ? rawAnchor
    : (rawAnchor && isValidDateString(rawAnchor) ? `${rawAnchor}T00:00:00.000Z` : nowISO);

  const rawStartedAt = habit.streakStartedAt;
  const streakStartedAt = (rawStartedAt && isValidTimestamp(rawStartedAt))
    ? rawStartedAt
    : (rawStartedAt && isValidDateString(rawStartedAt) ? `${rawStartedAt}T00:00:00.000Z` : streakAnchor);

  // Set arrays normalization (unique, valid YYYY-MM-DD date strings, sorted)
  const skips = Array.isArray(habit.skips)
    ? Array.from(new Set(habit.skips.filter(isValidDateString))).sort()
    : [];

  const skipSet = new Set(skips);
  const rawCompletions = Array.isArray(habit.completions)
    ? Array.from(new Set(habit.completions.filter(isValidDateString))).sort()
    : [];

  // Invariant: skips and completions must be mutually exclusive (skips take precedence)
  const completions = rawCompletions.filter(d => !skipSet.has(d));

  const events = Array.isArray(habit.events)
    ? habit.events.filter(e => e && typeof e === "object" && typeof e.type === "string" && VALID_EVENT_TYPES.includes(e.type)).map(e => ({
        id: (e.id && typeof e.id === "string") ? e.id : generateUniqueId("event"),
        type: e.type,
        date: (e.date && isValidDateString(e.date)) ? e.date : (e.timestamp && isValidTimestamp(e.timestamp) ? e.timestamp.split("T")[0] : nowISO.split("T")[0]),
        timestamp: (e.timestamp && isValidTimestamp(e.timestamp)) ? e.timestamp : nowISO,
        note: (e.note && typeof e.note === "string") ? e.note.slice(0, 1000) : "",
        ...(Number.isInteger(e.streakLength) ? { streakLength: e.streakLength } : {})
      })).slice(-500) // Bound event history to 500 recent items
    : [];

  const resetLogs = Array.isArray(habit.resetLogs)
    ? habit.resetLogs.filter(r => r && typeof r === "object").map(r => ({
        id: (r.id && typeof r.id === "string") ? r.id : generateUniqueId("reset"),
        date: (r.date && isValidDateString(r.date)) ? r.date : (r.timestamp && isValidTimestamp(r.timestamp) ? r.timestamp.split("T")[0] : nowISO.split("T")[0]),
        timestamp: (r.timestamp && isValidTimestamp(r.timestamp)) ? r.timestamp : nowISO,
        note: (r.note && typeof r.note === "string") ? r.note.slice(0, 1000) : "",
        ...(Number.isInteger(r.streakLength) ? { streakLength: r.streakLength } : {})
      })).slice(-100) // Bound reset logs to 100 recent items
    : [];

  return {
    id,
    name,
    icon,
    colorTheme,
    type,
    interval: {
      n: intervalN,
      period: intervalPeriod
    },
    createdAt,
    trackingStartDate,
    streakAnchor,
    streakStartedAt,
    skips,
    completions,
    events,
    resetLogs,
    ...(habit.taskUUID ? { taskUUID: habit.taskUUID } : {})
  };
}

/**
 * Normalizes the full state object against the target schema.
 * Ensures unique habit IDs across all habits.
 * @param {object} parsed - Parsed state object.
 * @returns {object} - Normalized state object.
 */
export function normalizeState(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return { ...DEFAULT_STATE };
  }

  const rawHabits = Array.isArray(parsed.habits) ? parsed.habits : [];
  const seenHabitIds = new Set();
  const habits = [];

  for (const rawHabit of rawHabits) {
    const normalized = normalizeHabit(rawHabit);
    if (!normalized) continue;

    // Deduplicate IDs
    if (seenHabitIds.has(normalized.id)) {
      normalized.id = generateUniqueId("habit");
    }
    seenHabitIds.add(normalized.id);
    habits.push(normalized);
  }

  let activeHabitId = (parsed.activeHabitId && typeof parsed.activeHabitId === "string")
    ? parsed.activeHabitId
    : null;

  if (activeHabitId && !habits.some(h => h.id === activeHabitId)) {
    activeHabitId = habits.length > 0 ? habits[0].id : null;
  } else if (!activeHabitId && habits.length > 0) {
    activeHabitId = habits[0].id;
  }

  const revision = Number.isInteger(parsed.revision) ? parsed.revision : 0;
  const version = Number.isInteger(parsed.version) ? parsed.version : 2;
  const theme = (parsed.theme && VALID_THEMES.includes(parsed.theme)) ? parsed.theme : "midnight";

  return {
    version,
    revision,
    theme,
    activeHabitId,
    habits
  };
}

/**
 * Resolves the UUID for a persistent plugin data note.
 * Handles temporary local- UUID resolution, validates existing online UUIDs,
 * and updates plugin settings automatically.
 *
 * @param {Object} app - Amplenote plugin API object.
 * @param {string} noteName - Exact title of the target note.
 * @param {Array<string>} tagNames - Array of tag strings associated with the note.
 * @param {string} settingKey - The plugin setting key used to persist the UUID.
 * @returns {Promise<string>} - Resolves to the verified permanent online note UUID.
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
      // 3. Stored online UUID: Verify it actually exists before trusting it
      try {
        const note = await app.findNote({ uuid: existingUUID });
        if (note) {
          return existingUUID;
        }
      } catch {
        console.warn("[HabitStreak] Stored UUID could not be verified, rediscovering note.");
      }
    }
  }

  // 4. Search notes in-memory before creating a duplicate (Requires exact name AND matching tag)
  try {
    const allNotes = await app.filterNotes({});
    if (allNotes && Array.isArray(allNotes)) {
      const match = allNotes.find(n => {
        const nameMatches = n.name === noteName;
        const tagMatches = n.tags && tagNames.every(t => n.tags.includes(t));
        return nameMatches && tagMatches;
      });
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

  // 5. Create new note and persist UUID in settings
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
      return null;
    }
  }

  // Fallback: try parsing whole content if bare JSON
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return JSON.parse(trimmed);
    }
  } catch {
    return null;
  }

  return null;
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
 * Loads the current plugin state from the habit_streak_data note with explicit status reporting.
 * Status values:
 * - "ok": valid persisted JSON was parsed and normalized
 * - "empty": note was empty/new, initialized with default state
 * - "corrupt": note has non-empty text, but valid JSON could not be parsed.
 *
 * @param {object} app - Amplenote App instance.
 * @returns {Promise<{ state: object, status: "ok"|"empty"|"corrupt", rawContent: string }>}
 */
export async function loadStateWithStatus(app) {
  try {
    const dataNoteUUID = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    const content = await app.getNoteContent({ uuid: dataNoteUUID });

    // If note has content, try parsing
    if (content && typeof content === "string" && content.trim().length > 0) {
      const parsed = extractJsonFromMarkdown(content);
      if (parsed && typeof parsed === "object") {
        return {
          state: normalizeState(parsed),
          status: "ok",
          rawContent: content
        };
      }

      // CRITICAL INTEGRITY GUARD:
      // Persistent note content exists but JSON parse failed.
      console.error("[HabitStreak] Refusing to overwrite malformed persisted note content with empty default state.");
      const corruptState = normalizeState({ ...DEFAULT_STATE });
      corruptState._isCorrupt = true;
      return {
        state: corruptState,
        status: "corrupt",
        rawContent: content
      };
    }

    // Truly empty/new note: initialize with default state
    const fallbackState = normalizeState({ ...DEFAULT_STATE });
    const markdown = formatStateAsMarkdown(fallbackState);
    await app.replaceNoteContent({ uuid: dataNoteUUID }, markdown);
    return {
      state: fallbackState,
      status: "empty",
      rawContent: markdown
    };
  } catch (err) {
    console.error("[HabitStreak] Failed to load state:", err);
    const fallbackState = normalizeState({ ...DEFAULT_STATE });
    return {
      state: fallbackState,
      status: "ok",
      rawContent: ""
    };
  }
}

/**
 * Loads the current plugin state from the habit_streak_data note.
 * Safely guards against destructive overwrites when persisted data is corrupted or malformed.
 * @param {object} app - Amplenote App instance.
 * @returns {Promise<object>} - Plugin state object.
 */
export async function loadState(app) {
  const { state } = await loadStateWithStatus(app);
  return state;
}

/**
 * Saves the given plugin state into the habit_streak_data note.
 * Increments the revision counter and normalizes the payload before writing.
 * Optionally verifies against expectedRevision to prevent lost updates from concurrent writes.
 *
 * @param {object} app - Amplenote App instance.
 * @param {object} state - Full plugin state to save.
 * @param {number|null} [expectedRevision=null] - Expected base revision to prevent concurrent overwrite.
 * @returns {Promise<boolean>} - True if saved successfully, false on error or conflict.
 */
export async function saveState(app, state, expectedRevision = null) {
  try {
    if (state && (state._isCorrupt === true || state._status === "corrupt")) {
      console.error("[HabitStreak] Refusing to save state marked as corrupt.");
      return false;
    }

    const dataNoteUUID = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);

    // Optimistic Concurrency Check
    if (expectedRevision !== null && expectedRevision !== undefined) {
      try {
        const currentContent = await app.getNoteContent({ uuid: dataNoteUUID });
        if (currentContent && typeof currentContent === "string" && currentContent.trim().length > 0) {
          const currentParsed = extractJsonFromMarkdown(currentContent);
          if (currentParsed && Number.isInteger(currentParsed.revision) && currentParsed.revision > expectedRevision) {
            console.warn(`[HabitStreak] Concurrency conflict detected: persisted revision (${currentParsed.revision}) > expected (${expectedRevision})`);
            return false;
          }
        }
      } catch (readErr) {
        console.warn("[HabitStreak] Concurrency verification read failed, proceeding with caution:", readErr);
      }
    }

    const normalized = normalizeState(state);
    normalized.revision = (Number.isInteger(normalized.revision) ? normalized.revision : 0) + 1;

    const markdown = formatStateAsMarkdown(normalized);
    await app.replaceNoteContent({ uuid: dataNoteUUID }, markdown);

    // Synchronize caller's state revision if passed by reference
    if (state && typeof state === "object") {
      state.revision = normalized.revision;
    }
    return true;
  } catch (err) {
    console.error("[HabitStreak] Failed to save state:", err);
    return false;
  }
}

/**
 * Saves the given plugin state into the habit_streak_data note, throwing on failure.
 * @param {object} app - Amplenote App instance.
 * @param {object} state - Full plugin state to save.
 * @param {number|null} [expectedRevision=null] - Expected revision.
 * @returns {Promise<void>}
 */
export async function saveStateOrThrow(app, state, expectedRevision = null) {
  const success = await saveState(app, state, expectedRevision);
  if (!success) {
    throw new Error("Failed to persist Habit Streak state to note.");
  }
}

/**
 * Serializes state mutations via an async promise queue to eliminate race conditions / lost updates.
 * Guarantees that corrupted notes are never overwritten.
 * @param {object} app - Amplenote App instance.
 * @param {Function} mutator - Async mutator callback (state) => Promise<any>.
 * @returns {Promise<any>}
 */
export function mutateState(app, mutator) {
  mutationQueue = mutationQueue
    .catch(() => {}) // keep queue alive on previous failures
    .then(async () => {
      const { state, status } = await loadStateWithStatus(app);

      // CRITICAL INTEGRITY GUARD: Refuse to execute mutator or save if data note is corrupt
      if (status === "corrupt" || state._isCorrupt === true) {
        throw new Error("Cannot mutate state: Habit Streak data note is corrupt or unparseable. Refusing to overwrite.");
      }

      const expectedRevision = state.revision;
      const result = await mutator(state);
      await saveStateOrThrow(app, state, expectedRevision);
      return result !== undefined ? result : state;
    });

  return mutationQueue;
}

