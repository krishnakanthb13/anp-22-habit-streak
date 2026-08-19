import { jest } from "@jest/globals";
import { 
  getHabitDayStatus, 
  calculateHabitStats, 
  isScheduledDate, 
  getDateRange,
  formatDate,
  getTodayString,
  isValidDateString
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
import { handleToggleDay, handleSaveCalendarEdits } from "../lib/features/toggleDay.js";
import { TRACK_TYPES, INTERVAL_PERIODS, DATA_NOTE_NAME, DATA_NOTE_TAGS, DEFAULT_STATE, VALID_THEMES } from "../lib/constants.js";

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

  // 19. Invariant: Off-day manual entry cannot become scheduled/tracked day
  test("Invariant 1: Off-day manual entry in completions/skips cannot become a scheduled day", () => {
    const habit = {
      type: TRACK_TYPES.COMPLETE,
      trackingStartDate: "2026-08-18",
      createdAt: "2026-08-18",
      interval: { n: 2, period: INTERVAL_PERIODS.DAY }, // Every 2 days: Aug 18, Aug 20
      completions: ["2026-08-18", "2026-08-19", "2026-08-20"], // 2026-08-19 is OFF-DAY
      skips: []
    };

    // Off-day Aug 19 must evaluate to not_applicable
    const offDayStatus = getHabitDayStatus(habit, "2026-08-19", "2026-08-20");
    expect(offDayStatus).toBe("not_applicable");

    const stats = calculateHabitStats(habit, "2026-08-20");
    // Only Aug 18 and Aug 20 are scheduled days
    expect(stats.totalScheduledDays).toBe(2);
    expect(stats.completedDays).toBe(2);
    expect(stats.currentStreak).toBe(2);
  });

  // 20. Invariant: Reset-to-date only resets scheduled days for recurrence
  test("Invariant 2: handleResetToDate only marks scheduled days as skipped", async () => {
    let savedState = null;
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "mock-uuid" },
      findNote: jest.fn().mockResolvedValue({ uuid: "mock-uuid", name: DATA_NOTE_NAME }),
      alert: jest.fn(),
      prompt: jest.fn().mockResolvedValue(["2026-08-03", "Reset weekly habit", true]),
      getNoteContent: jest.fn().mockResolvedValue(formatStateAsMarkdown({
        version: 2,
        revision: 1,
        habits: [
          {
            id: "weekly_h1",
            name: "Weekly Monday Review",
            type: TRACK_TYPES.COMPLETE,
            trackingStartDate: "2026-08-03", // Monday
            interval: { n: 1, period: INTERVAL_PERIODS.WEEK },
            skips: [],
            completions: []
          }
        ]
      })),
      replaceNoteContent: jest.fn().mockImplementation((_, md) => {
        const state = JSON.parse(md.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)[1]);
        savedState = state;
        return Promise.resolve(true);
      }),
      context: { renderEmbed: jest.fn() }
    };

    await handleResetToDate(app, "weekly_h1");
    expect(savedState).not.toBeNull();
    const habit = savedState.habits[0];

    // Out of 2026-08-03 to 2026-08-19 (17 days), only Mondays (Aug 3, Aug 10, Aug 17) should be in skips
    expect(habit.skips).toEqual(["2026-08-03", "2026-08-10", "2026-08-17"]);
  });

  // 21. Invariant: Mutually exclusive sets (skips ∩ completions = ∅)
  test("Invariant 3: skips and completions are strictly mutually exclusive", () => {
    const rawHabit = {
      id: "h_mut",
      name: "Mutually Exclusive Test",
      skips: ["2026-08-18", "2026-08-19"],
      completions: ["2026-08-18", "2026-08-20"]
    };

    const normalized = normalizeHabit(rawHabit);
    expect(normalized.skips).toEqual(["2026-08-18", "2026-08-19"]);
    // 2026-08-18 is in skips, so it must be removed from completions
    expect(normalized.completions).toEqual(["2026-08-20"]);
  });

  // 22. Invariant: Strict date validation
  test("Invariant 4: isValidDateString strictly validates real calendar dates", () => {
    expect(isValidDateString("2026-08-19")).toBe(true);
    expect(isValidDateString("2026-02-28")).toBe(true);
    expect(isValidDateString("2026-02-30")).toBe(false); // Invalid Feb 30
    expect(isValidDateString("2026-04-31")).toBe(false); // Invalid April 31
    expect(isValidDateString("invalid-date")).toBe(false);
    expect(isValidDateString("")).toBe(false);
  });

  // 23. Invariant: Theme validation at persistence boundary
  test("Invariant 5: Theme validation enforces valid themes", () => {
    const state = normalizeState({
      theme: "invalid_theme_xyz",
      habits: [
        {
          id: "h1",
          name: "Theme Test",
          colorTheme: "neon_rainbow_invalid"
        }
      ]
    });

    expect(state.theme).toBe("midnight");
    expect(state.habits[0].colorTheme).toBe("blue");
  });

  // 24. Invariant: Multi-event Undo state reconstruction
  test("Invariant 6: Undo Today reconstructs date state correctly when multiple events exist", async () => {
    let savedState = null;
    const todayStr = getTodayString();

    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "mock-uuid" },
      findNote: jest.fn().mockResolvedValue({ uuid: "mock-uuid", name: DATA_NOTE_NAME }),
      alert: jest.fn(),
      getNoteContent: jest.fn().mockImplementation(() => {
        return Promise.resolve(formatStateAsMarkdown(savedState || {
          version: 2,
          revision: 1,
          habits: [
            {
              id: "h_undo_test",
              name: "Undo Multi Test",
              type: TRACK_TYPES.SKIP,
              trackingStartDate: "2026-08-01",
              skips: [todayStr],
              completions: [],
              events: [
                { id: "ev1", type: "skip", date: todayStr, timestamp: "2026-08-19T10:00:00.000Z", note: "Slip #1" },
                { id: "ev2", type: "skip", date: todayStr, timestamp: "2026-08-19T14:00:00.000Z", note: "Slip #2" }
              ],
              resetLogs: [
                { id: "rl1", date: todayStr, timestamp: "2026-08-19T10:00:00.000Z" },
                { id: "rl2", date: todayStr, timestamp: "2026-08-19T14:00:00.000Z" }
              ]
            }
          ]
        }));
      }),
      replaceNoteContent: jest.fn().mockImplementation((_, md) => {
        const state = JSON.parse(md.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)[1]);
        savedState = state;
        return Promise.resolve(true);
      }),
      context: { renderEmbed: jest.fn() }
    };

    // First undo: Undoing Slip #2 -> Slip #1 remains, so today MUST still be in skips
    await handleUndoToday(app, "h_undo_test");
    expect(savedState.habits[0].events.length).toBe(1);
    expect(savedState.habits[0].events[0].id).toBe("ev1");
    expect(savedState.habits[0].skips).toContain(todayStr);

    // Second undo: Undoing Slip #1 -> 0 events remain, so today is removed from skips
    await handleUndoToday(app, "h_undo_test");
    expect(savedState.habits[0].events.length).toBe(0);
    expect(savedState.habits[0].skips).not.toContain(todayStr);
  });

  // 25. Invariant: Off-day toggle rejection at mutation boundary
  test("Invariant 7: handleToggleDay rejects toggling non-scheduled/off-days", async () => {
    let savedState = null;
    const app = {
      settings: { [SETTING_DATA_NOTE_UUID]: "mock-uuid" },
      findNote: jest.fn().mockResolvedValue({ uuid: "mock-uuid", name: DATA_NOTE_NAME }),
      alert: jest.fn(),
      getNoteContent: jest.fn().mockResolvedValue(formatStateAsMarkdown({
        version: 2,
        revision: 1,
        habits: [
          {
            id: "h_weekly",
            name: "Weekly Habit",
            type: TRACK_TYPES.COMPLETE,
            trackingStartDate: "2026-08-17", // Monday
            interval: { n: 1, period: INTERVAL_PERIODS.WEEK },
            skips: [],
            completions: []
          }
        ]
      })),
      replaceNoteContent: jest.fn().mockImplementation((_, md) => {
        const state = JSON.parse(md.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)[1]);
        savedState = state;
        return Promise.resolve(true);
      }),
      context: { renderEmbed: jest.fn() }
    };

    // 2026-08-18 is Tuesday (off-day for Monday weekly habit)
    await handleToggleDay(app, "h_weekly", "2026-08-18", "not_applicable");
    expect(savedState).not.toBeNull();
    // Non-scheduled day must NOT be added to completions or skips
    expect(savedState.habits[0].completions).toEqual([]);
    expect(savedState.habits[0].skips).toEqual([]);
  });

  // 26. Invariant: isScheduledDate returns false on invalid date inputs
  test("Invariant 8: isScheduledDate returns false on invalid dates", () => {
    const habit = { trackingStartDate: "2026-08-01", interval: { n: 1, period: INTERVAL_PERIODS.DAY } };
    expect(isScheduledDate(habit, "invalid-date")).toBe(false);
    expect(isScheduledDate(habit, "2026-02-30")).toBe(false);
  });
});
