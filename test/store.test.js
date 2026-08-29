import { jest } from "@jest/globals";
import { 
  extractJsonFromMarkdown, 
  formatStateAsMarkdown, 
  getNoteUUID, 
  loadState, 
  saveState, 
  saveStateOrThrow,
  mutateState,
  normalizeHabit,
  normalizeState,
  isValidTimestamp,
  SETTING_DATA_NOTE_UUID 
} from "../lib/data/store.js";
import { DATA_NOTE_NAME, DATA_NOTE_TAGS, DEFAULT_STATE } from "../lib/constants.js";

describe("store module — Schema Normalization & Happy Path", () => {
  test("normalizeHabit validates and provides defaults for partial habit objects", () => {
    const raw = {
      name: "   Reading Daily   ",
      type: "complete",
      interval: { n: "3", period: "day" },
      skips: ["2026-08-01", "2026-08-01", "invalid-date"]
    };

    const normalized = normalizeHabit(raw);
    expect(normalized.name).toBe("Reading Daily");
    expect(normalized.type).toBe("complete");
    expect(normalized.interval).toEqual({ n: 1, period: "day" });
    expect(normalized.skips).toEqual(["2026-08-01"]);
    expect(normalized.completions).toEqual([]);
    expect(normalized.id).toMatch(/^habit_/);
    expect(normalized.createdAt).toBeDefined();
    expect(normalized.trackingStartDate).toBeDefined();
  });

  test("normalizeState cleans up activeHabitId and habit arrays", () => {
    const raw = {
      version: 1,
      theme: "dark",
      activeHabitId: "non_existent_id",
      habits: [{ id: "h1", name: "Gym", type: "complete" }]
    };

    const state = normalizeState(raw);
    expect(state.activeHabitId).toBe("h1");
    expect(state.habits.length).toBe(1);
    expect(state.theme).toBe("dark");
  });

  test("formatStateAsMarkdown generates valid json fenced in ```json", () => {
    const state = {
      version: 2,
      revision: 1,
      activeHabitId: "habit_1",
      habits: [
        {
          id: "habit_1",
          name: "Morning Run",
          type: "skip",
          skips: ["2026-08-05"]
        }
      ]
    };

    const markdown = formatStateAsMarkdown(state);
    expect(markdown).toContain("```json");
    expect(markdown).toContain('"activeHabitId": "habit_1"');
    expect(markdown).toContain("```");

    const parsed = extractJsonFromMarkdown(markdown);
    expect(parsed).toEqual(state);
  });

  test("loadState loads and normalizes existing note content", async () => {
    const mockState = {
      version: 2,
      revision: 5,
      activeHabitId: "h1",
      habits: [{ id: "h1", name: "Reading", type: "complete", completions: ["2026-08-19"] }]
    };

    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid-1234", name: DATA_NOTE_NAME }),
      getNoteContent: jest.fn().mockResolvedValue(formatStateAsMarkdown(mockState)),
      replaceNoteContent: jest.fn()
    };

    const loaded = await loadState(app);
    expect(loaded.activeHabitId).toBe("h1");
    expect(loaded.habits.length).toBe(1);
    expect(app.getNoteContent).toHaveBeenCalledWith({ uuid: "note-uuid-1234" });
  });

  test("saveState formats, increments revision, and replaces note content", async () => {
    const mockState = {
      version: 2,
      revision: 3,
      activeHabitId: "h1",
      habits: []
    };

    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid-1234" }),
      replaceNoteContent: jest.fn().mockResolvedValue(true)
    };

    const result = await saveState(app, mockState);
    expect(result).toBe(true);
    expect(mockState.revision).toBe(4);
    expect(app.replaceNoteContent).toHaveBeenCalledWith(
      { uuid: "note-uuid-1234" },
      expect.stringContaining('"revision": 4')
    );
  });
});

describe("store module — Data Integrity, Concurrency & UUID Verification", () => {
  test("loadState refuses destructive overwrite when content is malformed", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid-1234" }),
      getNoteContent: jest.fn().mockResolvedValue("Some interrupted markdown without valid json ```json { unfinished"),
      replaceNoteContent: jest.fn().mockResolvedValue(true)
    };

    const state = await loadState(app);
    expect(state.version).toBe(2);
    expect(state.habits).toEqual([]);
    // Crucially: replaceNoteContent should NOT be called on non-empty corrupted note
    expect(app.replaceNoteContent).not.toHaveBeenCalled();
  });

  test("loadState initializes default note when note is truly empty", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid-1234" }),
      getNoteContent: jest.fn().mockResolvedValue(""),
      replaceNoteContent: jest.fn().mockResolvedValue(true)
    };

    const state = await loadState(app);
    expect(state.version).toBe(2);
    expect(app.replaceNoteContent).toHaveBeenCalledWith(
      { uuid: "note-uuid-1234" },
      expect.stringContaining("```json")
    );
  });

  test("loadState initializes default note when note contains title header only (fresh install scenario)", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid-1234" }),
      getNoteContent: jest.fn().mockResolvedValue("# habit_streak_data\n"),
      replaceNoteContent: jest.fn().mockResolvedValue(true)
    };

    const state = await loadState(app);
    expect(state.version).toBe(2);
    expect(state._isCorrupt).toBeUndefined();
    expect(app.replaceNoteContent).toHaveBeenCalledWith(
      { uuid: "note-uuid-1234" },
      expect.stringContaining("```json")
    );
  });

  test("getNoteUUID serializes concurrent calls to avoid duplicate note creation", async () => {
    let createCount = 0;
    const app = {
      settings: {},
      filterNotes: jest.fn().mockResolvedValue([]),
      createNote: jest.fn().mockImplementation(() => {
        createCount++;
        return new Promise(resolve => setTimeout(() => resolve(`note-uuid-concurrent-${createCount}`), 10));
      }),
      setSetting: jest.fn().mockResolvedValue(true)
    };

    // Run 3 concurrent calls
    const [uuid1, uuid2, uuid3] = await Promise.all([
      getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID),
      getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID),
      getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID)
    ]);

    expect(uuid1).toBe("note-uuid-concurrent-1");
    expect(uuid2).toBe("note-uuid-concurrent-1");
    expect(uuid3).toBe("note-uuid-concurrent-1");
    expect(app.createNote).toHaveBeenCalledTimes(1);
  });

  test("getNoteUUID validates online UUID existence and falls back if stale", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "stale-deleted-uuid" },
      findNote: jest.fn().mockResolvedValue(null), // stale UUID does not exist
      filterNotes: jest.fn().mockResolvedValue([
        { uuid: "recovered-uuid", name: DATA_NOTE_NAME, tags: DATA_NOTE_TAGS }
      ]),
      setSetting: jest.fn().mockResolvedValue(true)
    };

    const uuid = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    expect(uuid).toBe("recovered-uuid");
    expect(app.setSetting).toHaveBeenCalledWith(SETTING_DATA_NOTE_UUID, "recovered-uuid");
  });

  test("getNoteUUID requires BOTH exact name and tag during search", async () => {
    const app = {
      settings: {},
      filterNotes: jest.fn().mockResolvedValue([
        { uuid: "wrong-uuid", name: DATA_NOTE_NAME, tags: ["random-tag"] },
        { uuid: "correct-uuid", name: DATA_NOTE_NAME, tags: DATA_NOTE_TAGS }
      ]),
      setSetting: jest.fn().mockResolvedValue(true)
    };

    const uuid = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    expect(uuid).toBe("correct-uuid");
  });

  test("mutateState executes sequential queue without lost updates", async () => {
    let persistedContent = formatStateAsMarkdown({
      version: 2,
      revision: 0,
      habits: []
    });

    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid-1234" }),
      getNoteContent: jest.fn().mockImplementation(async () => persistedContent),
      replaceNoteContent: jest.fn().mockImplementation(async (opts, content) => {
        persistedContent = content;
        return true;
      })
    };

    // Run 3 concurrent mutations in parallel
    const p1 = mutateState(app, async state => {
      state.habits.push({ id: "h1", name: "Habit 1" });
    });
    const p2 = mutateState(app, async state => {
      state.habits.push({ id: "h2", name: "Habit 2" });
    });
    const p3 = mutateState(app, async state => {
      state.habits.push({ id: "h3", name: "Habit 3" });
    });

    await Promise.all([p1, p2, p3]);

    const finalState = extractJsonFromMarkdown(persistedContent);
    expect(finalState.habits.length).toBe(3);
    expect(finalState.habits.map(h => h.id)).toEqual(["h1", "h2", "h3"]);
    expect(finalState.revision).toBe(3);
  });

  test("saveStateOrThrow throws error if save fails", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid-1234" }),
      replaceNoteContent: jest.fn().mockRejectedValue(new Error("Network write error"))
    };

    await expect(saveStateOrThrow(app, { version: 2, habits: [] })).rejects.toThrow(
      "Failed to persist Habit Streak state to note."
    );
  });

  test("mutateState refuses to execute mutator or write when persisted note is corrupt", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid-1234" }),
      getNoteContent: jest.fn().mockResolvedValue("```json\n{ corrupted json content that fails parsing\n```"),
      replaceNoteContent: jest.fn().mockResolvedValue(true)
    };

    const mutatorFn = jest.fn();
    await expect(mutateState(app, mutatorFn)).rejects.toThrow(
      "Cannot mutate state: Habit Streak data note is corrupt or unparseable. Refusing to overwrite."
    );
    expect(mutatorFn).not.toHaveBeenCalled();
    expect(app.replaceNoteContent).not.toHaveBeenCalled();
  });

  test("isValidTimestamp strictly rejects impossible calendar dates and malformed strings", () => {
    expect(isValidTimestamp("2026-08-20T14:30:00.000Z")).toBe(true);
    expect(isValidTimestamp("2026-02-28T12:00:00Z")).toBe(true);
    expect(isValidTimestamp("2024-02-29T12:00:00Z")).toBe(true); // Leap year valid
    expect(isValidTimestamp("2026-02-29T12:00:00Z")).toBe(false); // 2026 is not a leap year
    expect(isValidTimestamp("2026-02-31T12:00:00Z")).toBe(false); // Impossible date
    expect(isValidTimestamp("2026-04-31T12:00:00Z")).toBe(false); // April has 30 days
    expect(isValidTimestamp("2026-13-01T12:00:00Z")).toBe(false); // Month 13 invalid
    expect(isValidTimestamp("2026-08-20T25:00:00Z")).toBe(false); // Hour 25 invalid
    expect(isValidTimestamp("not-a-date")).toBe(false);
    expect(isValidTimestamp(null)).toBe(false);
  });

  test("normalizeState deduplicates duplicate habit IDs", () => {
    const raw = {
      version: 2,
      habits: [
        { id: "duplicate_id", name: "Habit 1" },
        { id: "duplicate_id", name: "Habit 2" }
      ]
    };

    const state = normalizeState(raw);
    expect(state.habits.length).toBe(2);
    expect(state.habits[0].id).toBe("duplicate_id");
    expect(state.habits[1].id).not.toBe("duplicate_id");
    expect(state.habits[1].id).toMatch(/^habit_/);
  });

  test("saveState detects optimistic concurrency revision conflict and returns false", async () => {
    const persistedStateOnDisk = {
      version: 2,
      revision: 10,
      habits: []
    };

    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid-1234" }),
      getNoteContent: jest.fn().mockResolvedValue(formatStateAsMarkdown(persistedStateOnDisk)),
      replaceNoteContent: jest.fn().mockResolvedValue(true)
    };

    const localStaleState = {
      version: 2,
      revision: 8,
      habits: []
    };

    // Attempt to save state expecting base revision 8 when disk is at 10
    const result = await saveState(app, localStaleState, 8);
    expect(result).toBe(false);
    expect(app.replaceNoteContent).not.toHaveBeenCalled();
  });

  test("extractJsonFromMarkdown prioritizes ```json code block over arbitrary code block", () => {
    const markdown = `# Note Title
\`\`\`bash
echo "do not parse me"
\`\`\`

\`\`\`json
{
  "version": 2,
  "habits": [{"id": "h1", "name": "Target Habit"}]
}
\`\`\`
`;
    const parsed = extractJsonFromMarkdown(markdown);
    expect(parsed).not.toBeNull();
    expect(parsed.habits[0].name).toBe("Target Habit");
  });

  test("loadStateWithStatus returns error status and corrupt flag on fatal read failure", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid-1234" }),
      getNoteContent: jest.fn().mockRejectedValue(new Error("Amplenote network error"))
    };

    const { state, status } = await loadState(app).then(() => ({})).catch(() => ({}));
    const fullResult = await import("../lib/data/store.js").then(m => m.loadStateWithStatus(app));
    expect(fullResult.status).toBe("error");
    expect(fullResult.state._isCorrupt).toBe(true);
    expect(fullResult.state._loadError).toBe(true);
  });

  test("getNoteUUID works defensively when app.settings is undefined", async () => {
    const app = {
      settings: undefined,
      filterNotes: jest.fn().mockResolvedValue([{ uuid: "found-uuid", name: DATA_NOTE_NAME, tags: DATA_NOTE_TAGS }])
    };

    const uuid = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    expect(uuid).toBe("found-uuid");
  });
});
