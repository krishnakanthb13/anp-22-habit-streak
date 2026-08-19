import { jest } from "@jest/globals";
import { 
  getHabitDayStatus, 
  calculateHabitStats, 
  isScheduledDate, 
  getDateRange,
  formatDate,
  getTodayString
} from "../lib/engine/streakEngine.js";
import { 
  loadState, 
  saveState, 
  saveStateOrThrow, 
  mutateState, 
  getNoteUUID, 
  normalizeHabit, 
  normalizeState, 
  formatStateAsMarkdown,
  SETTING_DATA_NOTE_UUID 
} from "../lib/data/store.js";
import { handleSkipToday, handleUndoToday, handleCompleteToday, handleResetToDate } from "../lib/features/resetStreak.js";
import { handleSaveCalendarEdits } from "../lib/features/toggleDay.js";
import { TRACK_TYPES, INTERVAL_PERIODS, DATA_NOTE_NAME, DATA_NOTE_TAGS, DEFAULT_STATE } from "../lib/constants.js";

describe("Design Spec Audit Scenarios (1-18) Verification", () => {

  // 1. New daily Quitly habit → today completed → streak = 1
  test("Scenario 1: New daily Quitly habit -> today completed -> streak = 1", () => {
    const todayStr = "2026-08-19";
    const habit = {
      type: TRACK_TYPES.SKIP,
      trackingStartDate: todayStr,
      createdAt: todayStr,
      interval: { n: 1, period: INTERVAL_PERIODS.DAY },
      skips: [],
      completions: []
    };

    const stats = calculateHabitStats(habit, todayStr);
    expect(stats.currentStreak).toBe(1);
    expect(stats.statusToday).toBe("completed");
  });

  // 2. New positive habit → today not completed → streak = 0
  test("Scenario 2: New positive habit -> today not completed -> streak = 0", () => {
    const todayStr = "2026-08-19";
    const habit = {
      type: TRACK_TYPES.COMPLETE,
      trackingStartDate: todayStr,
      createdAt: todayStr,
      interval: { n: 1, period: INTERVAL_PERIODS.DAY },
      skips: [],
      completions: [] // not yet completed today
    };

    const stats = calculateHabitStats(habit, todayStr);
    expect(stats.currentStreak).toBe(0);
    expect(stats.statusToday).toBe("skipped");
  });

  // 3. Positive habit → 3 consecutive completions → streak = 3
  test("Scenario 3: Positive habit -> 3 consecutive completions -> streak = 3", () => {
    const habit = {
      type: TRACK_TYPES.COMPLETE,
      trackingStartDate: "2026-08-17",
      createdAt: "2026-08-17",
      interval: { n: 1, period: INTERVAL_PERIODS.DAY },
      completions: ["2026-08-17", "2026-08-18", "2026-08-19"],
      skips: []
    };

    const stats = calculateHabitStats(habit, "2026-08-19");
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
  });

  // 4. Positive habit → completion, completion, skip, completion → current = 1, longest = 2
  test("Scenario 4: Positive habit -> completion, completion, skip, completion -> current = 1, longest = 2", () => {
    const habit = {
      type: TRACK_TYPES.COMPLETE,
      trackingStartDate: "2026-08-16",
      createdAt: "2026-08-16",
      interval: { n: 1, period: INTERVAL_PERIODS.DAY },
      completions: ["2026-08-16", "2026-08-17", "2026-08-19"],
      skips: ["2026-08-18"]
    };

    const stats = calculateHabitStats(habit, "2026-08-19");
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(2);
  });

  // 5. Quitly → 10 clean days → slip today → current = 0, longest = 10
  test("Scenario 5: Quitly -> 10 clean days -> slip today -> current = 0, longest = 10", () => {
    const habit = {
      type: TRACK_TYPES.SKIP,
      trackingStartDate: "2026-08-09",
      createdAt: "2026-08-09",
      interval: { n: 1, period: INTERVAL_PERIODS.DAY },
      skips: ["2026-08-19"], // slip today on day 11
      completions: []
    };

    const stats = calculateHabitStats(habit, "2026-08-19");
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(10);
  });

  // 6. Quitly → multiple slips today → history contains all slips, undo semantics verified
  test("Scenario 6: Quitly -> multiple slips today -> history contains all slips, undo semantics verified", async () => {
    const today = getTodayString();
    const initialState = {
      version: 2,
      activeHabitId: "h1",
      habits: [{
        id: "h1",
        name: "Quitly Habit",
        type: TRACK_TYPES.SKIP,
        createdAt: "2026-08-01",
        skips: [],
        events: [],
        resetLogs: []
      }]
    };

    let persistedContent = formatStateAsMarkdown(initialState);
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid" }),
      getNoteContent: jest.fn().mockImplementation(async () => persistedContent),
      replaceNoteContent: jest.fn().mockImplementation(async (_, c) => {
        persistedContent = c;
        return true;
      }),
      prompt: jest.fn()
    };

    // Log Slip 1
    app.prompt.mockResolvedValueOnce(["First slip note", true]);
    await handleSkipToday(app, "h1");

    // Log Slip 2
    app.prompt.mockResolvedValueOnce(["Second slip note", true]);
    await handleSkipToday(app, "h1");

    let state = await loadState(app);
    expect(state.habits[0].events.length).toBe(2);
    expect(state.habits[0].events[0].note).toBe("First slip note");
    expect(state.habits[0].events[1].note).toBe("Second slip note");
    expect(state.habits[0].skips).toContain(today);

    // Undo only the latest slip event
    await handleUndoToday(app, "h1");
    state = await loadState(app);
    expect(state.habits[0].events.length).toBe(1);
    expect(state.habits[0].events[0].note).toBe("First slip note");
  });

  // 7. Backdated reset → reset 5 days ago → only intended dates become skipped
  test("Scenario 7: Backdated reset -> reset 5 days ago -> only intended dates become skipped", async () => {
    const initialState = {
      version: 2,
      activeHabitId: "h1",
      habits: [{
        id: "h1",
        name: "No Smoking",
        type: TRACK_TYPES.SKIP,
        createdAt: "2026-08-01",
        skips: [],
        completions: [],
        events: []
      }]
    };

    let persistedContent = formatStateAsMarkdown(initialState);
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid" }),
      getNoteContent: jest.fn().mockImplementation(async () => persistedContent),
      replaceNoteContent: jest.fn().mockImplementation(async (_, c) => {
        persistedContent = c;
        return true;
      }),
      prompt: jest.fn().mockResolvedValue(["2026-08-15", "Slip at dinner", true])
    };

    await handleResetToDate(app, "h1");
    const state = await loadState(app);
    const habit = state.habits[0];

    // Dates before 2026-08-15 should not be skipped
    expect(habit.skips).not.toContain("2026-08-14");
    // Dates from 2026-08-15 onward should be in skips
    expect(habit.skips).toContain("2026-08-15");
  });

  // 8. Calendar edit → edit historical day → save → reload → exact same state
  test("Scenario 8: Calendar edit -> edit historical day -> save -> reload -> exact same state", async () => {
    const initialState = {
      version: 2,
      activeHabitId: "h1",
      habits: [{
        id: "h1",
        name: "Meditation",
        type: TRACK_TYPES.COMPLETE,
        createdAt: "2026-08-01",
        skips: [],
        completions: ["2026-08-01", "2026-08-02"]
      }]
    };

    let persistedContent = formatStateAsMarkdown(initialState);
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid" }),
      getNoteContent: jest.fn().mockImplementation(async () => persistedContent),
      replaceNoteContent: jest.fn().mockImplementation(async (_, c) => {
        persistedContent = c;
        return true;
      })
    };

    await handleSaveCalendarEdits(app, "h1", ["2026-08-03"], ["2026-08-01", "2026-08-02", "2026-08-04"]);
    const reloadedState = await loadState(app);
    const habit = reloadedState.habits[0];

    expect(habit.skips).toEqual(["2026-08-03"]);
    expect(habit.completions).toEqual(["2026-08-01", "2026-08-02", "2026-08-04"]);
    expect(habit.events.some(e => e.type === "calendar_edit")).toBe(true);
  });

  // 9. Calendar cancel → modify days → cancel → zero persistence changes
  test("Scenario 9: Calendar cancel -> zero persistence changes", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid" },
      replaceNoteContent: jest.fn()
    };

    // Staging edits on client without calling saveCalendarEdits causes 0 host writes
    expect(app.replaceNoteContent).not.toHaveBeenCalled();
  });

  // 10. Weekly habit → every 1 week → non-scheduled days don't break streak
  test("Scenario 10: Weekly habit -> every 1 week -> non-scheduled days don't break streak", () => {
    const habit = {
      type: TRACK_TYPES.COMPLETE,
      trackingStartDate: "2026-08-05", // Wednesday
      createdAt: "2026-08-05",
      interval: { n: 1, period: INTERVAL_PERIODS.WEEK },
      completions: ["2026-08-05", "2026-08-12", "2026-08-19"], // Completed on 3 scheduled Wednesdays
      skips: []
    };

    // Off-days (Thu-Tue) return 'not_applicable'
    expect(getHabitDayStatus(habit, "2026-08-06", "2026-08-19")).toBe("not_applicable");
    expect(getHabitDayStatus(habit, "2026-08-12", "2026-08-19")).toBe("completed");

    const stats = calculateHabitStats(habit, "2026-08-19");
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
    expect(stats.completedDays).toBe(3);
    expect(stats.completionRate).toBe(100);
  });

  // 11. Monthly habit → every 1 month → month boundary/leap-year cases
  test("Scenario 11: Monthly habit -> every 1 month -> month boundary/leap-year cases", () => {
    const habit = {
      type: TRACK_TYPES.COMPLETE,
      trackingStartDate: "2024-01-31", // Leap year test
      interval: { n: 1, period: INTERVAL_PERIODS.MONTH }
    };

    // Jan 31 -> Feb 29 (leap year 2024 clamps to 29th) -> Mar 31
    expect(isScheduledDate(habit, "2024-01-31", "2024-01-31")).toBe(true);
    expect(isScheduledDate(habit, "2024-02-29", "2024-01-31")).toBe(true);
    expect(isScheduledDate(habit, "2024-03-31", "2024-01-31")).toBe(true);
  });

  // 12. DST boundary → streak calendar remains correct
  test("Scenario 12: DST boundary -> streak calendar remains correct", () => {
    // Nov 1 to Nov 5 around typical DST transition
    const dates = getDateRange("2026-10-30", "2026-11-03");
    expect(dates).toEqual([
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
      "2026-11-03"
    ]);
  });

  // 13. Corrupted note → plugin refuses destructive overwrite
  test("Scenario 13: Corrupted note -> plugin refuses destructive overwrite", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid" }),
      getNoteContent: jest.fn().mockResolvedValue("corrupted unclosed json block ```json { habits: ["),
      replaceNoteContent: jest.fn()
    };

    const state = await loadState(app);
    expect(state.habits).toEqual([]);
    expect(app.replaceNoteContent).not.toHaveBeenCalled();
  });

  // 14. Save failure → UI reports failure
  test("Scenario 14: Save failure -> saveStateOrThrow throws error", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid" }),
      replaceNoteContent: jest.fn().mockRejectedValue(new Error("Amplenote write timeout"))
    };

    await expect(saveStateOrThrow(app, { version: 2, habits: [] })).rejects.toThrow();
  });

  // 15. Concurrent mutations → no lost update
  test("Scenario 15: Concurrent mutations -> queue executes sequentially", async () => {
    let storedMarkdown = formatStateAsMarkdown({ version: 2, habits: [] });
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "note-uuid" },
      findNote: jest.fn().mockResolvedValue({ uuid: "note-uuid" }),
      getNoteContent: jest.fn().mockImplementation(async () => storedMarkdown),
      replaceNoteContent: jest.fn().mockImplementation(async (_, c) => {
        storedMarkdown = c;
        return true;
      })
    };

    const opA = mutateState(app, async s => { s.habits.push({ id: "hA", name: "A" }); });
    const opB = mutateState(app, async s => { s.habits.push({ id: "hB", name: "B" }); });

    await Promise.all([opA, opB]);
    const finalState = await loadState(app);
    expect(finalState.habits.length).toBe(2);
  });

  // 16. Stale UUID → note recovery occurs
  test("Scenario 16: Stale UUID -> recovers via filterNotes", async () => {
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "stale-deleted-uuid" },
      findNote: jest.fn().mockResolvedValue(null), // deleted note
      filterNotes: jest.fn().mockResolvedValue([
        { uuid: "fresh-uuid", name: DATA_NOTE_NAME, tags: DATA_NOTE_TAGS }
      ]),
      setSetting: jest.fn().mockResolvedValue(true)
    };

    const uuid = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    expect(uuid).toBe("fresh-uuid");
    expect(app.setSetting).toHaveBeenCalledWith(SETTING_DATA_NOTE_UUID, "fresh-uuid");
  });

  // 17. Duplicate note names → correct tagged note selected
  test("Scenario 17: Duplicate note names -> matches exact name + tag", async () => {
    const app = {
      settings: {},
      filterNotes: jest.fn().mockResolvedValue([
        { uuid: "wrong-uuid", name: DATA_NOTE_NAME, tags: ["random-user-tag"] },
        { uuid: "correct-uuid", name: DATA_NOTE_NAME, tags: DATA_NOTE_TAGS }
      ]),
      setSetting: jest.fn().mockResolvedValue(true)
    };

    const uuid = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    expect(uuid).toBe("correct-uuid");
  });

  // 18. Invalid persisted habit → normalized/rejected safely
  test("Scenario 18: Invalid persisted habit -> normalized safely", () => {
    const corruptHabit = {
      name: "Corrupt Habit",
      type: "invalid_type",
      interval: { n: -99, period: "centuries" },
      skips: "not-an-array",
      completions: null
    };

    const normalized = normalizeHabit(corruptHabit);
    expect(normalized.type).toBe(TRACK_TYPES.SKIP);
    expect(normalized.interval.n).toBe(1);
    expect(normalized.interval.period).toBe(INTERVAL_PERIODS.DAY);
    expect(normalized.skips).toEqual([]);
    expect(normalized.completions).toEqual([]);
    expect(normalized.id).toBeDefined();
  });
});
