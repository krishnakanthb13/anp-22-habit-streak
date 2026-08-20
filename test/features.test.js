import { jest } from "@jest/globals";
import { handleCreateHabit, handleCreateFromTemplate } from "../lib/features/createHabit.js";
import { handleEditHabit } from "../lib/features/editHabit.js";
import { handleDeleteHabit, handleSelectHabit } from "../lib/features/habitManagement.js";
import { handleToggleDay, handleSaveCalendarEdits } from "../lib/features/toggleDay.js";
import { handleSkipToday, handleCompleteToday, handleUndoToday, handleResetToDate } from "../lib/features/resetStreak.js";
import { launchHabitDashboard } from "../lib/features/launcher.js";
import { handleImportFromNote, cleanTaskTitle, extractTaskEmojiAndTitle } from "../lib/features/importFromNote.js";
import { formatStateAsMarkdown, SETTING_DATA_NOTE_UUID } from "../lib/data/store.js";
import { TRACK_TYPES } from "../lib/constants.js";

function createMockApp(initialState = { version: 1, activeHabitId: null, habits: [] }) {
  let savedContent = formatStateAsMarkdown(initialState);
  return {
    settings: {
      "Habit_Streak_Data_UUID [Do not Edit!]": "mock-data-uuid",
      "Last Embed View": "fullscreen"
    },
    context: {
      pluginUUID: "plugin-1234",
      renderEmbed: jest.fn()
    },
    prompt: jest.fn(),
    alert: jest.fn(),
    openEmbed: jest.fn(),
    openSidebarEmbed: jest.fn(),
    navigate: jest.fn(),
    setSetting: jest.fn(),
    findNote: jest.fn().mockResolvedValue({ uuid: "mock-data-uuid", name: "habit_streak_data" }),
    getNoteContent: jest.fn().mockImplementation(() => Promise.resolve(savedContent)),
    replaceNoteContent: jest.fn().mockImplementation((_, content) => {
      savedContent = content;
      return Promise.resolve(true);
    }),
    updateTask: jest.fn().mockResolvedValue(true),
    getNoteTasks: jest.fn().mockResolvedValue([])
  };
}

describe("features — Habit Creation & Templates", () => {
  test("handleCreateHabit adds a new habit to state", async () => {
    const app = createMockApp();
    app.prompt.mockResolvedValue(["🧘", "Meditation", "purple", TRACK_TYPES.COMPLETE, "1", "day"]);

    await handleCreateHabit(app);

    expect(app.replaceNoteContent).toHaveBeenCalled();
    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain("Meditation");
    expect(lastSavedMarkdown).toContain("purple");
    expect(app.context.renderEmbed).toHaveBeenCalled();
  });

  test("handleCreateFromTemplate adds habit from preset index", async () => {
    const app = createMockApp();

    await handleCreateFromTemplate(app, 0); // First preset (Quitly sober)

    expect(app.replaceNoteContent).toHaveBeenCalled();
    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain("I am Sober");
    expect(app.context.renderEmbed).toHaveBeenCalled();
  });
});

describe("features — Habit Editing & Management", () => {
  test("handleEditHabit updates name, icon, theme, and interval", async () => {
    const initialState = {
      version: 1,
      activeHabitId: "h1",
      habits: [{
        id: "h1",
        name: "Old Name",
        icon: "🔥",
        colorTheme: "blue",
        type: TRACK_TYPES.SKIP,
        interval: { n: 1, period: "day" }
      }]
    };
    const app = createMockApp(initialState);
    app.prompt.mockResolvedValue(["⚡", "Updated Name", "emerald", TRACK_TYPES.COMPLETE, "2", "week"]);

    await handleEditHabit(app, "h1");

    expect(app.replaceNoteContent).toHaveBeenCalled();
    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain("Updated Name");
    expect(lastSavedMarkdown).toContain("emerald");
  });

  test("handleDeleteHabit removes habit when confirmed", async () => {
    const initialState = {
      version: 1,
      activeHabitId: "h1",
      habits: [
        { id: "h1", name: "Habit 1" },
        { id: "h2", name: "Habit 2" }
      ]
    };
    const app = createMockApp(initialState);
    app.prompt.mockResolvedValue([true]);

    await handleDeleteHabit(app, "h1");

    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).not.toContain("Habit 1");
    expect(lastSavedMarkdown).toContain("Habit 2");
  });

  test("handleSelectHabit switches active habit ID", async () => {
    const initialState = {
      version: 1,
      activeHabitId: "h1",
      habits: [
        { id: "h1", name: "Habit 1" },
        { id: "h2", name: "Habit 2" }
      ]
    };
    const app = createMockApp(initialState);

    await handleSelectHabit(app, "h2");

    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain('"activeHabitId": "h2"');
  });
});

describe("features — Day Toggling & Reset Handling", () => {
  test("handleToggleDay switches completed date to skipped", async () => {
    const initialState = {
      version: 1,
      activeHabitId: "h1",
      habits: [{
        id: "h1",
        name: "Running",
        type: TRACK_TYPES.COMPLETE,
        completions: ["2026-08-19"],
        skips: []
      }]
    };
    const app = createMockApp(initialState);

    await handleToggleDay(app, "h1", "2026-08-19", "completed");

    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain('"skips": [\n        "2026-08-19"\n      ]');
  });

  test("handleSaveCalendarEdits persists modified skips and completions arrays", async () => {
    const initialState = {
      version: 1,
      activeHabitId: "h1",
      habits: [{ id: "h1", name: "Running", skips: [], completions: [] }]
    };
    const app = createMockApp(initialState);

    await handleSaveCalendarEdits(app, "h1", ["2026-08-10"], ["2026-08-11", "2026-08-12"]);

    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain("2026-08-10");
    expect(lastSavedMarkdown).toContain("2026-08-11");
    expect(lastSavedMarkdown).toContain("2026-08-12");
  });

  test("handleSkipToday records a skip and logs event", async () => {
    const initialState = {
      version: 1,
      activeHabitId: "h1",
      habits: [{
        id: "h1",
        name: "No Sugar",
        type: TRACK_TYPES.SKIP,
        createdAt: "2026-08-01",
        skips: [],
        events: []
      }]
    };
    const app = createMockApp(initialState);
    app.prompt.mockResolvedValue(["Craving cake at celebration", true]);

    await handleSkipToday(app, "h1");

    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain("Craving cake at celebration");
  });

  test("handleCompleteToday records session completion with note", async () => {
    const initialState = {
      version: 1,
      activeHabitId: "h1",
      habits: [{
        id: "h1",
        name: "Read 20 mins",
        type: TRACK_TYPES.COMPLETE,
        createdAt: "2026-08-01",
        completions: [],
        events: []
      }]
    };
    const app = createMockApp(initialState);
    app.prompt.mockResolvedValue(["Read chapters 4 and 5", true]);

    await handleCompleteToday(app, "h1");

    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain("Read chapters 4 and 5");
  });

  test("handleUndoToday clears today's status", async () => {
    const today = new Date().toISOString().split("T")[0];
    const initialState = {
      version: 1,
      activeHabitId: "h1",
      habits: [{
        id: "h1",
        name: "Read 20 mins",
        type: TRACK_TYPES.COMPLETE,
        completions: [today],
        skips: []
      }]
    };
    const app = createMockApp(initialState);

    await handleUndoToday(app, "h1");

    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain('"completions": []');
  });

  test("handleResetToDate marks date range as skipped", async () => {
    const initialState = {
      version: 1,
      activeHabitId: "h1",
      habits: [{
        id: "h1",
        name: "No Caffeine",
        type: TRACK_TYPES.SKIP,
        createdAt: "2026-08-01",
        skips: [],
        completions: []
      }]
    };
    const app = createMockApp(initialState);
    const today = new Date().toISOString().split("T")[0];
    app.prompt.mockResolvedValue([today, "Restarting with green tea", true]);

    await handleResetToDate(app, "h1");

    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain(today);
    expect(lastSavedMarkdown).toContain("Restarting with green tea");
  });
});

describe("features — Launcher & Import", () => {
  test("launchHabitDashboard opens fullscreen or sidebar according to user choice", async () => {
    const app = createMockApp();
    app.prompt.mockResolvedValue(["fullscreen"]);

    await launchHabitDashboard(app);

    expect(app.openEmbed).toHaveBeenCalled();
    expect(app.setSetting).toHaveBeenCalledWith("Last Embed View", "fullscreen");
  });

  test("launchHabitDashboard supports sidebar embed", async () => {
    const app = createMockApp();
    app.prompt.mockResolvedValue(["sidebar"]);

    await launchHabitDashboard(app);

    expect(app.openSidebarEmbed).toHaveBeenCalledWith(1);
  });

  test("cleanTaskTitle sanitizes markdown, images, tags, HTML, and multiline context", () => {
    expect(cleanTaskTitle("![preview](https://img.png) Read [Atomic Habits](https://amzn.to) **daily** #habits #reading"))
      .toBe("Read Atomic Habits daily");

    expect(cleanTaskTitle("- [ ] 🧘 Meditation (15m)\nSubtext context notes here"))
      .toBe("🧘 Meditation (15m)");

    expect(cleanTaskTitle("<span>Drink 2L Water</span> [[Health Note]] `tracking`"))
      .toBe("Drink 2L Water Health Note tracking");
  });

  test("extractTaskEmojiAndTitle extracts leading emojis properly", () => {
    expect(extractTaskEmojiAndTitle("🏃 Morning 5km Jog", "📝"))
      .toEqual({ emoji: "🏃", title: "Morning 5km Jog" });

    expect(extractTaskEmojiAndTitle("🔥 No Smoking", "📝"))
      .toEqual({ emoji: "🔥", title: "No Smoking" });

    expect(extractTaskEmojiAndTitle("Read 30 mins", "📝"))
      .toEqual({ emoji: "📝", title: "Read 30 mins" });
  });

  test("handleImportFromNote parses, cleans, and imports complex tasks from selected note", async () => {
    const app = createMockApp();
    app.prompt
      .mockResolvedValueOnce({ uuid: "source-note-uuid" }) // Note picker
      .mockResolvedValueOnce([true]) // Task check list
      .mockResolvedValueOnce(["🏃", "Morning Jog", TRACK_TYPES.COMPLETE, "emerald", "1", "day"]); // Config dialog

    app.getNoteTasks.mockResolvedValue([{ content: "🏃 [Morning Jog](https://strava.com) **daily** #fitness\nContext note" }]);

    await handleImportFromNote(app);

    expect(app.replaceNoteContent).toHaveBeenCalled();
    const lastSavedMarkdown = app.replaceNoteContent.mock.calls[0][1];
    expect(lastSavedMarkdown).toContain("Morning Jog");
    expect(app.alert).toHaveBeenCalledWith(expect.stringContaining("Successfully imported"));
  });
});

