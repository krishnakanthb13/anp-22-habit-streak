import { 
  getHabitDayStatus, 
  calculateHabitStats, 
  calculateTierProgress, 
  calculateAllHabitsSummary,
  generateMonthCalendar, 
  getDateRange,
  formatDate 
} from "../lib/engine/streakEngine.js";
import { TRACK_TYPES } from "../lib/constants.js";

describe("streakEngine", () => {
  test("getDateRange returns contiguous date strings", () => {
    const range = getDateRange("2026-08-01", "2026-08-05");
    expect(range).toEqual([
      "2026-08-01",
      "2026-08-02",
      "2026-08-03",
      "2026-08-04",
      "2026-08-05"
    ]);
  });

  test("getHabitDayStatus correctly handles skip-tracked habits", () => {
    const habit = {
      type: TRACK_TYPES.SKIP,
      createdAt: "2026-08-01",
      skips: ["2026-08-03"],
      completions: []
    };

    expect(getHabitDayStatus(habit, "2026-07-31", "2026-08-05")).toBe("before_start");
    expect(getHabitDayStatus(habit, "2026-08-01", "2026-08-05")).toBe("completed");
    expect(getHabitDayStatus(habit, "2026-08-02", "2026-08-05")).toBe("completed");
    expect(getHabitDayStatus(habit, "2026-08-03", "2026-08-05")).toBe("skipped");
    expect(getHabitDayStatus(habit, "2026-08-04", "2026-08-05")).toBe("completed");
    expect(getHabitDayStatus(habit, "2026-08-06", "2026-08-05")).toBe("future");
  });

  test("getHabitDayStatus correctly handles complete-tracked habits", () => {
    const habit = {
      type: TRACK_TYPES.COMPLETE,
      createdAt: "2026-08-01",
      skips: [],
      completions: ["2026-08-01", "2026-08-02"]
    };

    expect(getHabitDayStatus(habit, "2026-08-01", "2026-08-05")).toBe("completed");
    expect(getHabitDayStatus(habit, "2026-08-02", "2026-08-05")).toBe("completed");
    expect(getHabitDayStatus(habit, "2026-08-03", "2026-08-05")).toBe("skipped");
  });

  test("calculateHabitStats calculates continuous current streak and longest streak", () => {
    const habit = {
      type: TRACK_TYPES.SKIP,
      createdAt: "2026-08-01",
      skips: ["2026-08-03"],
      completions: []
    };

    const stats = calculateHabitStats(habit, "2026-08-05");
    // Aug 1 (done), Aug 2 (done), Aug 3 (skipped), Aug 4 (done), Aug 5 (done)
    expect(stats.currentStreak).toBe(2); // Aug 4 and Aug 5
    expect(stats.longestStreak).toBe(2);
    expect(stats.totalTrackedDays).toBe(5);
    expect(stats.completedDays).toBe(4);
    expect(stats.skippedDays).toBe(1);
    expect(stats.completionRate).toBe(80);
    expect(stats.streakStartDate).toBe("2026-08-04");
  });

  test("calculateTierProgress calculates unlocked tiers and current next goal", () => {
    const tiers = calculateTierProgress(5); // 5 days streak
    
    // 1d (1) and 3d (3) should be unlocked
    expect(tiers.find(t => t.id === "1d").isUnlocked).toBe(true);
    expect(tiers.find(t => t.id === "3d").isUnlocked).toBe(true);

    // 7d (7) should be the current goal with 2 days remaining
    const tier7d = tiers.find(t => t.id === "7d");
    expect(tier7d.isUnlocked).toBe(false);
    expect(tier7d.isCurrentGoal).toBe(true);
    expect(tier7d.daysRemaining).toBe(2);
  });

  test("generateMonthCalendar produces correct grid days", () => {
    const habit = {
      type: TRACK_TYPES.SKIP,
      createdAt: "2026-08-01",
      skips: [],
      completions: []
    };

    const cal = generateMonthCalendar(habit, 2026, 8, "2026-08-19");
    expect(cal.year).toBe(2026);
    expect(cal.month).toBe(8);
    expect(cal.totalDaysInMonth).toBe(31);
    expect(cal.days.length).toBe(31);
    expect(cal.days[18].isToday).toBe(true); // 19th
  });

  test("calculateAllHabitsSummary aggregates metrics across multiple habits", () => {
    const habits = [
      {
        id: "h1",
        name: "Morning Meditation",
        type: TRACK_TYPES.SKIP,
        createdAt: "2026-08-01",
        skips: [],
        completions: []
      },
      {
        id: "h2",
        name: "Evening Reading",
        type: TRACK_TYPES.COMPLETE,
        createdAt: "2026-08-01",
        skips: [],
        completions: ["2026-08-01", "2026-08-02"]
      }
    ];

    const summary = calculateAllHabitsSummary(habits, "2026-08-05");
    expect(summary.totalHabits).toBe(2);
    expect(summary.bestOverallStreak).toBe(5); // h1 has 5 days streak
    expect(summary.habitCards.length).toBe(2);
    expect(summary.habitCards[0].stats.currentStreak).toBe(5);
    expect(summary.habitCards[1].stats.currentStreak).toBe(0);
  });
});
