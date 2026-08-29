import { 
  getHabitDayStatus, 
  calculateHabitStats, 
  calculateTierProgress, 
  calculateAllHabitsSummary, 
  generateMonthCalendar, 
  getDateRange, 
  formatDate, 
  getTodayString,
  isScheduledDate
} from "../lib/engine/streakEngine.js";
import { TRACK_TYPES, QUITLY_TIERS, INTERVAL_PERIODS } from "../lib/constants.js";

describe("streakEngine — Happy Path", () => {
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

  test("formatDate formats valid date objects and ISO strings", () => {
    expect(formatDate(new Date(2026, 7, 19))).toBe("2026-08-19");
    expect(formatDate("2026-01-05T12:00:00Z")).toBe("2026-01-05");
  });

  test("getTodayString returns a valid YYYY-MM-DD string", () => {
    const today = getTodayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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
    expect(stats.currentStreak).toBe(2);
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
    expect(tier7d.progressPercent).toBe(Math.round((5 / 7) * 100));
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
    expect(cal.days[18].isToday).toBe(true);
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
    expect(summary.bestOverallStreak).toBe(5);
    expect(summary.habitCards.length).toBe(2);
    expect(summary.habitCards[0].stats.currentStreak).toBe(5);
    expect(summary.habitCards[1].stats.currentStreak).toBe(0);
  });
});

describe("streakEngine — Scheduling (isScheduledDate)", () => {
  test("daily scheduling: all active dates on or after tracking start date are scheduled", () => {
    const habit = {
      type: TRACK_TYPES.COMPLETE,
      trackingStartDate: "2026-08-01",
      interval: { n: 1, period: INTERVAL_PERIODS.DAY }
    };

    expect(isScheduledDate(habit, "2026-08-01", "2026-08-01")).toBe(true);  // day 0
    expect(isScheduledDate(habit, "2026-08-02", "2026-08-01")).toBe(true);  // day 1
    expect(isScheduledDate(habit, "2026-08-03", "2026-08-01")).toBe(true);  // day 2
    expect(isScheduledDate(habit, "2026-07-31", "2026-08-01")).toBe(false); // before start
  });

  test("daily habit streak: consecutive daily completions build streak", () => {
    const habit = {
      type: TRACK_TYPES.COMPLETE,
      trackingStartDate: "2026-08-01",
      interval: { n: 1, period: INTERVAL_PERIODS.DAY },
      completions: ["2026-08-01", "2026-08-02", "2026-08-03"],
      skips: []
    };

    const stats = calculateHabitStats(habit, "2026-08-03");
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
    expect(stats.completedDays).toBe(3);
    expect(stats.totalScheduledDays).toBe(3);
    expect(stats.completionRate).toBe(100);
  });
});

describe("streakEngine — Edge Cases & Live Anchors", () => {
  test("getDateRange returns empty array if start > end", () => {
    expect(getDateRange("2026-08-10", "2026-08-05")).toEqual([]);
  });

  test("getDateRange returns single day if start === end", () => {
    expect(getDateRange("2026-08-05", "2026-08-05")).toEqual(["2026-08-05"]);
  });

  test("calculateHabitStats handles habits with zero tracked days", () => {
    const habit = {
      type: TRACK_TYPES.SKIP,
      trackingStartDate: "2026-08-10",
      createdAt: "2026-08-10",
      skips: [],
      completions: []
    };

    const stats = calculateHabitStats(habit, "2026-08-05");
    expect(stats.currentStreak).toBe(0);
    expect(stats.totalTrackedDays).toBe(0);
    expect(stats.completionRate).toBe(0);
  });

  test("calculateHabitStats preserves exact streakStartedAt ISO timestamp", () => {
    const exactISO = "2026-08-01T14:32:10.500Z";
    const habit = {
      type: TRACK_TYPES.SKIP,
      trackingStartDate: "2026-08-01",
      createdAt: "2026-08-01",
      streakStartedAt: exactISO,
      streakAnchor: exactISO,
      skips: [],
      completions: []
    };

    const stats = calculateHabitStats(habit, "2026-08-19");
    expect(stats.currentStreak).toBe(19);
    expect(stats.streakAnchorTimestamp).toBe(new Date(exactISO).getTime());
  });

  test("calculateHabitStats with backdated completions before createdAt", () => {
    const habit = {
      type: TRACK_TYPES.COMPLETE,
      createdAt: "2026-08-05",
      trackingStartDate: "2026-08-01",
      completions: ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05"],
      skips: []
    };

    const stats = calculateHabitStats(habit, "2026-08-05");
    expect(stats.currentStreak).toBe(5);
    expect(stats.longestStreak).toBe(5);
    expect(stats.totalTrackedDays).toBe(5);
  });

  test("calculateAllHabitsSummary handles empty or null array gracefully", () => {
    expect(calculateAllHabitsSummary([])).toEqual({
      totalHabits: 0,
      bestOverallStreak: 0,
      totalCompletedDaysAll: 0,
      averageCompletionRate: 0,
      habitCards: []
    });

    expect(calculateAllHabitsSummary(null)).toEqual({
      totalHabits: 0,
      bestOverallStreak: 0,
      totalCompletedDaysAll: 0,
      averageCompletionRate: 0,
      habitCards: []
    });
  });

  test("calculateTierProgress when all tiers are unlocked", () => {
    const maxDays = QUITLY_TIERS[QUITLY_TIERS.length - 1].days + 100;
    const tiers = calculateTierProgress(maxDays);
    expect(tiers.every(t => t.isUnlocked)).toBe(true);
    expect(tiers.some(t => t.isCurrentGoal)).toBe(false);
  });
});

describe("streakEngine — Error Handling", () => {
  test("formatDate returns empty string for invalid date inputs", () => {
    expect(formatDate("invalid-date-string")).toBe("");
    expect(formatDate(NaN)).toBe("");
  });

  test("getDateRange returns empty array on invalid date strings", () => {
    expect(getDateRange("invalid", "2026-08-05")).toEqual([]);
    expect(getDateRange("2026-08-01", "invalid")).toEqual([]);
  });

  test("getHabitDayStatus handles null habit safely", () => {
    expect(getHabitDayStatus(null, "2026-08-01", "2026-08-05")).toBe("before_start");
    expect(getHabitDayStatus(null, "2026-08-05", "2026-08-05")).toBe("completed");
  });

  test("calculateHabitStats handles null or undefined habit safely without throwing", () => {
    expect(calculateHabitStats(null)).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalTrackedDays: 0,
      totalScheduledDays: 0,
      completedDays: 0,
      skippedDays: 0,
      completionRate: 0,
      streakStartDate: null,
      streakAnchorTimestamp: null,
      statusToday: "skipped"
    });
    expect(calculateHabitStats(undefined)).toBeDefined();
  });

  test("generateMonthCalendar handles null habit and out-of-range dates safely", () => {
    const calNull = generateMonthCalendar(null, 2026, 8);
    expect(calNull.year).toBe(2026);
    expect(calNull.month).toBe(8);
    expect(calNull.days).toEqual([]);

    const calInvalid = generateMonthCalendar(null, 99999, 99);
    expect(calInvalid.year).toBe(new Date().getFullYear());
    expect(calInvalid.month).toBe(new Date().getMonth() + 1);
  });

  test("isScheduledDate and getDateRange correctly handle DST transitions with UTC accuracy", () => {
    // US Spring forward (March 8, 2026) and Fall back (November 1, 2026)
    const springRange = getDateRange("2026-03-07", "2026-03-10");
    expect(springRange).toEqual(["2026-03-07", "2026-03-08", "2026-03-09", "2026-03-10"]);

    const habitDaily = {
      trackingStartDate: "2026-03-07",
      interval: { n: 1, period: "day" }
    };
    expect(isScheduledDate(habitDaily, "2026-03-07")).toBe(true);
    expect(isScheduledDate(habitDaily, "2026-03-08")).toBe(true);
    expect(isScheduledDate(habitDaily, "2026-03-09")).toBe(true);
    expect(isScheduledDate(habitDaily, "2026-03-10")).toBe(true);

    const fallRange = getDateRange("2026-10-31", "2026-11-03");
    expect(fallRange).toEqual(["2026-10-31", "2026-11-01", "2026-11-02", "2026-11-03"]);
  });
});
