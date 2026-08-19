import { jest } from "@jest/globals";
import { 
  extractJsonFromMarkdown, 
  formatStateAsMarkdown, 
  getNoteUUID, 
  loadState, 
  saveState, 
  SETTING_DATA_NOTE_UUID 
} from "../lib/data/store.js";
import { DATA_NOTE_NAME, DATA_NOTE_TAGS, DEFAULT_STATE } from "../lib/constants.js";

describe("store module — Happy Path", () => {
  test("formatStateAsMarkdown generates valid json fenced in ```json", () => {
    const state = {
      version: 1,
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

  test("loadState loads and parses existing note content", async () => {
    const mockState = {
      version: 1,
      activeHabitId: "h1",
      habits: [{ id: "h1", name: "Reading", type: "complete", completions: ["2026-08-19"] }]
    };

    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      getNoteContent: jest.fn().mockResolvedValue(formatStateAsMarkdown(mockState)),
      replaceNoteContent: jest.fn()
    };

    const loaded = await loadState(app);
    expect(loaded.activeHabitId).toBe("h1");
    expect(loaded.habits.length).toBe(1);
    expect(app.getNoteContent).toHaveBeenCalledWith({ uuid: "note-uuid-1234" });
  });

  test("saveState formats and replaces note content", async () => {
    const mockState = {
      version: 1,
      activeHabitId: "h1",
      habits: []
    };

    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      replaceNoteContent: jest.fn().mockResolvedValue(true)
    };

    const result = await saveState(app, mockState);
    expect(result).toBe(true);
    expect(app.replaceNoteContent).toHaveBeenCalledWith(
      { uuid: "note-uuid-1234" },
      expect.stringContaining("```json")
    );
  });
});

describe("store module — Edge Cases & Local UUID Resolution", () => {
  test("extractJsonFromMarkdown handles arbitrary text around code blocks", () => {
    const rawNote = `
# Habit Streak Data

Here is some note text before the code block.

\`\`\`json
{
  "version": 1,
  "activeHabitId": null,
  "habits": []
}
\`\`\`

Note footer notes.
    `;

    const parsed = extractJsonFromMarkdown(rawNote);
    expect(parsed).toEqual(DEFAULT_STATE);
  });

  test("extractJsonFromMarkdown parses raw bare JSON as fallback", () => {
    const rawBare = '{"version":1,"activeHabitId":null,"habits":[]}';
    const parsed = extractJsonFromMarkdown(rawBare);
    expect(parsed).toEqual(DEFAULT_STATE);
  });

  test("getNoteUUID resolves local- UUID to synced online UUID", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "local-uuid-9999" },
      filterNotes: jest.fn().mockResolvedValue([
        { uuid: "online-uuid-5555", name: DATA_NOTE_NAME, tags: DATA_NOTE_TAGS }
      ]),
      setSetting: jest.fn().mockResolvedValue(true)
    };

    const uuid = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    expect(uuid).toBe("online-uuid-5555");
    expect(app.setSetting).toHaveBeenCalledWith(SETTING_DATA_NOTE_UUID, "online-uuid-5555");
  });

  test("getNoteUUID creates note if none found", async () => {
    const app = {
      settings: {},
      filterNotes: jest.fn().mockResolvedValue([]),
      createNote: jest.fn().mockResolvedValue("newly-created-uuid"),
      setSetting: jest.fn().mockResolvedValue(true)
    };

    const uuid = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    expect(uuid).toBe("newly-created-uuid");
    expect(app.createNote).toHaveBeenCalledWith(DATA_NOTE_NAME, DATA_NOTE_TAGS);
    expect(app.setSetting).toHaveBeenCalledWith(SETTING_DATA_NOTE_UUID, "newly-created-uuid");
  });

  test("loadState initializes default note when content is unparseable", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      getNoteContent: jest.fn().mockResolvedValue("Garbage content without code block"),
      replaceNoteContent: jest.fn().mockResolvedValue(true)
    };

    const state = await loadState(app);
    expect(state.version).toBe(1);
    expect(state.habits).toEqual([]);
    expect(app.replaceNoteContent).toHaveBeenCalled();
  });
});

describe("store module — Error Handling", () => {
  test("extractJsonFromMarkdown returns null on invalid or missing json", () => {
    expect(extractJsonFromMarkdown("")).toBeNull();
    expect(extractJsonFromMarkdown(null)).toBeNull();
    expect(extractJsonFromMarkdown(undefined)).toBeNull();
    expect(extractJsonFromMarkdown("Just random note text with no code block")).toBeNull();
    expect(extractJsonFromMarkdown("```json\n{ invalid json here \n```")).toBeNull();
  });

  test("saveState returns false and catches error if replaceNoteContent fails", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid-1234" },
      replaceNoteContent: jest.fn().mockRejectedValue(new Error("API Network error"))
    };

    const result = await saveState(app, { version: 1, habits: [] });
    expect(result).toBe(false);
  });
});
