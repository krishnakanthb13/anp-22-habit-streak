import { jest } from "@jest/globals";
import plugin from "../habit-streak.js";
import { formatStateAsMarkdown } from "../lib/data/store.js";
import { TRACK_TYPES } from "../lib/constants.js";

function createMockApp(initialState = { version: 1, activeHabitId: "h1", habits: [{ id: "h1", name: "Meditation", type: TRACK_TYPES.COMPLETE, completions: ["2026-08-19"] }] }) {
  let savedContent = formatStateAsMarkdown(initialState);
  return {
    settings: {
      "Habit_Streak_Data_UUID [Do not Edit!]": "mock-data-uuid",
      "Last Embed View": "fullscreen"
    },
    context: {
      pluginUUID: "plugin-uuid-test",
      renderEmbed: jest.fn()
    },
    prompt: jest.fn(),
    alert: jest.fn(),
    openEmbed: jest.fn(),
    openSidebarEmbed: jest.fn(),
    navigate: jest.fn(),
    setSetting: jest.fn(),
    insertNoteContent: jest.fn(),
    getNoteContent: jest.fn().mockImplementation(() => Promise.resolve(savedContent)),
    replaceNoteContent: jest.fn().mockImplementation((_, content) => {
      savedContent = content;
      return Promise.resolve(true);
    })
  };
}

describe("habit-streak plugin entry point", () => {
  test("exposes appOption with Habit Streaks Dashboard", async () => {
    expect(plugin.appOption).toBeDefined();
    expect(typeof plugin.appOption["Habit Streaks Dashboard"]).toBe("function");

    const app = createMockApp();
    app.prompt.mockResolvedValue(["fullscreen"]);
    await plugin.appOption["Habit Streaks Dashboard"](app);
    expect(app.openEmbed).toHaveBeenCalled();
  });

  test("exposes noteOption with Dashboard launcher and Widget embedder", async () => {
    expect(plugin.noteOption).toBeDefined();
    expect(typeof plugin.noteOption["Habit Streaks Dashboard"]).toBe("function");
    expect(typeof plugin.noteOption["Insert Habit Streaks Widget"]).toBe("function");

    const app = createMockApp();
    await plugin.noteOption["Insert Habit Streaks Widget"](app, "note-uuid-999");
    expect(app.insertNoteContent).toHaveBeenCalledWith(
      { uuid: "note-uuid-999" },
      expect.stringContaining('<object data="plugin://plugin-uuid-test"')
    );
  });

  test("onEmbedCall dispatches setTheme action", async () => {
    const app = createMockApp();
    await plugin.onEmbedCall(app, "setTheme", "glass");

    expect(app.replaceNoteContent).toHaveBeenCalled();
    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain('"theme": "glass"');
  });

  test("onEmbedCall dispatches refreshData action", async () => {
    const app = createMockApp();
    await plugin.onEmbedCall(app, "refreshData");
    expect(app.context.renderEmbed).toHaveBeenCalled();
  });

  test("renderEmbed returns valid HTML document", async () => {
    const app = createMockApp();
    const html = await plugin.renderEmbed(app);

    expect(typeof html).toBe("string");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<title>Habit Streaks</title>");
    expect(html).toContain("Habit Streaks");
  });
});
