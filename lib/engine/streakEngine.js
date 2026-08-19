import { QUITLY_TIERS, TRACK_TYPES, INTERVAL_PERIODS } from "../constants.js";

/**
 * Formats a Date object or date-like string as YYYY-MM-DD.
 * @param {Date|string|number} date
 * @returns {string} - YYYY-MM-DD or empty string if invalid.
 */
export function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "";
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 * @returns {string}
 */
export function getTodayString() {
  return formatDate(new Date());
}

/**
 * Generates an array of date strings (YYYY-MM-DD) between start and end (inclusive).
 * @param {string} startStr - YYYY-MM-DD
 * @param {string} endStr - YYYY-MM-DD
 * @returns {string[]}
 */
export function getDateRange(startStr, endStr) {
  const dates = [];
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return dates;
  }

  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Determines whether a specific date is a scheduled tracking day for the habit based on its interval.
 * @param {object} habit - Habit object.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} [refStartStr] - Reference tracking start date (YYYY-MM-DD).
 * @returns {boolean}
 */
export function isScheduledDate(habit, dateStr, refStartStr) {
  const habitStart = refStartStr || habit?.trackingStartDate || (habit?.createdAt ? habit.createdAt.split("T")[0] : getTodayString());

  if (dateStr < habitStart) {
    return false;
  }

  const interval = habit?.interval || { n: 1, period: INTERVAL_PERIODS.DAY };
  const n = (interval.n && Number.isInteger(interval.n) && interval.n >= 1) ? interval.n : 1;
  const period = interval.period || INTERVAL_PERIODS.DAY;

  // Standard daily: every calendar day
  if (period === INTERVAL_PERIODS.DAY && n === 1) {
    return true;
  }

  const startDate = new Date(habitStart + "T00:00:00");
  const targetDate = new Date(dateStr + "T00:00:00");

  if (isNaN(startDate.getTime()) || isNaN(targetDate.getTime())) {
    return true;
  }

  const diffInDays = Math.round((targetDate - startDate) / (1000 * 60 * 60 * 24));
  if (diffInDays < 0) {
    return false;
  }

  if (period === INTERVAL_PERIODS.DAY) {
    return diffInDays % n === 0;
  }

  if (period === INTERVAL_PERIODS.WEEK) {
    const isSameWeekday = targetDate.getDay() === startDate.getDay();
    const diffInWeeks = Math.floor(diffInDays / 7);
    return isSameWeekday && (diffInWeeks % n === 0);
  }

  if (period === INTERVAL_PERIODS.MONTH) {
    const sYear = startDate.getFullYear();
    const sMonth = startDate.getMonth();
    const sDay = startDate.getDate();

    const tYear = targetDate.getFullYear();
    const tMonth = targetDate.getMonth();
    const tDay = targetDate.getDate();

    const monthDiff = (tYear - sYear) * 12 + (tMonth - sMonth);
    if (monthDiff < 0 || monthDiff % n !== 0) {
      return false;
    }

    const lastDayInTargetMonth = new Date(tYear, tMonth + 1, 0).getDate();
    const expectedDay = Math.min(sDay, lastDayInTargetMonth);
    return tDay === expectedDay;
  }

  return true;
}

/**
 * Determines the status of a habit for a specific date.
 * @param {object} habit - Habit object.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} [todayStr] - Today's date string (defaults to today).
 * @param {object} [cachedSets] - Optional pre-computed { skips: Set, completions: Set } for high-performance loops.
 * @returns {"completed"|"skipped"|"not_applicable"|"future"|"before_start"}
 */
export function getHabitDayStatus(habit, dateStr, todayStr = getTodayString(), cachedSets = null) {
  if (dateStr > todayStr) {
    return "future";
  }

  const skips = cachedSets?.skips ?? new Set(habit?.skips || []);
  const completions = cachedSets?.completions ?? new Set(habit?.completions || []);

  if (skips.has(dateStr)) {
    return "skipped";
  }

  if (completions.has(dateStr)) {
    return "completed";
  }

  const habitStart = habit?.trackingStartDate || (habit?.createdAt ? habit.createdAt.split("T")[0] : todayStr);
  if (dateStr < habitStart) {
    return "before_start";
  }

  // Evaluate if date was scheduled according to habit interval
  const scheduled = isScheduledDate(habit, dateStr, habitStart);
  if (!scheduled) {
    return "not_applicable";
  }

  if (habit?.type === TRACK_TYPES.COMPLETE) {
    return "skipped";
  }

  // Skip-tracked (Quitly default): completed unless explicitly in skips
  return "completed";
}

/**
 * Calculates current streak, longest streak, and stats for a habit.
 * Supports recurrence intervals (non-scheduled days act as bridges).
 * @param {object} habit - Habit object.
 * @param {string} [todayStr] - Today's date string.
 * @returns {object} - Streak metrics.
 */
export function calculateHabitStats(habit, todayStr = getTodayString()) {
  let habitStart = habit.trackingStartDate || (habit.createdAt ? habit.createdAt.split("T")[0] : todayStr);

  // Extend habitStart if there are earlier completed or skipped dates
  const allRecordedDates = [...(habit.completions || []), ...(habit.skips || [])].filter(Boolean).sort();
  if (allRecordedDates.length > 0 && allRecordedDates[0] < habitStart) {
    habitStart = allRecordedDates[0];
  }

  const allDates = getDateRange(habitStart, todayStr);

  if (allDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalTrackedDays: 0,
      totalScheduledDays: 0,
      completedDays: 0,
      skippedDays: 0,
      completionRate: 0,
      streakStartDate: null,
      streakAnchorTimestamp: null,
      statusToday: "completed"
    };
  }

  const cachedSets = {
    skips: new Set(habit.skips || []),
    completions: new Set(habit.completions || [])
  };

  const dayStatuses = allDates.map(dateStr => ({
    dateStr,
    status: getHabitDayStatus(habit, dateStr, todayStr, cachedSets)
  }));

  const totalTrackedDays = dayStatuses.length;
  let completedDays = 0;
  let skippedDays = 0;
  let scheduledDays = 0;

  for (const item of dayStatuses) {
    if (item.status === "completed") {
      completedDays++;
      scheduledDays++;
    } else if (item.status === "skipped") {
      skippedDays++;
      scheduledDays++;
    }
  }

  const totalRelevantDays = (scheduledDays > 0) ? scheduledDays : totalTrackedDays;
  const completionRate = totalRelevantDays > 0
    ? Math.round((completedDays / totalRelevantDays) * 100)
    : 0;

  // Streak Calculation: Backwards from today
  let currentStreak = 0;
  let streakStartDate = null;

  for (let i = dayStatuses.length - 1; i >= 0; i--) {
    const { dateStr, status } = dayStatuses[i];
    if (status === "completed") {
      currentStreak++;
      streakStartDate = dateStr;
    } else if (status === "not_applicable") {
      // Off-days/non-scheduled days do not break streak
      continue;
    } else {
      // Skipped breaks streak
      break;
    }
  }

  // Longest Streak Calculation
  let longestStreak = 0;
  let tempStreak = 0;

  for (const item of dayStatuses) {
    if (item.status === "completed") {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else if (item.status === "not_applicable") {
      // Off-day bridge: keep tempStreak unbroken
      continue;
    } else {
      tempStreak = 0;
    }
  }

  // Live Timer Anchor Timestamp
  let streakAnchorTimestamp = null;
  if (currentStreak > 0 && streakStartDate) {
    if (habit.streakStartedAt && typeof habit.streakStartedAt === "string") {
      const parsed = new Date(habit.streakStartedAt).getTime();
      if (!isNaN(parsed)) {
        streakAnchorTimestamp = parsed;
      }
    } else if (habit.streakAnchor && typeof habit.streakAnchor === "string") {
      const parsed = new Date(habit.streakAnchor).getTime();
      if (!isNaN(parsed)) {
        streakAnchorTimestamp = parsed;
      }
    }

    if (!streakAnchorTimestamp) {
      streakAnchorTimestamp = new Date(`${streakStartDate}T00:00:00`).getTime();
    }
  }

  const statusToday = getHabitDayStatus(habit, todayStr, todayStr, cachedSets);

  return {
    currentStreak,
    longestStreak,
    totalTrackedDays,
    totalScheduledDays: scheduledDays,
    completedDays,
    skippedDays,
    completionRate,
    streakStartDate,
    streakAnchorTimestamp,
    statusToday
  };
}

/**
 * Calculates Quitly-style tiered milestones and progress.
 * @param {number} currentStreak - Current consecutive completed days.
 * @returns {object[]} - Tier progress items.
 */
export function calculateTierProgress(currentStreak) {
  let nextGoalIdentified = false;

  return QUITLY_TIERS.map(tier => {
    const isUnlocked = currentStreak >= tier.days;
    let isCurrentGoal = false;

    if (!isUnlocked && !nextGoalIdentified) {
      isCurrentGoal = true;
      nextGoalIdentified = true;
    }

    const progressPercent = isUnlocked
      ? 100
      : Math.min(99, Math.round((currentStreak / tier.days) * 100));

    const daysRemaining = Math.max(0, tier.days - currentStreak);

    return {
      ...tier,
      isUnlocked,
      isCurrentGoal,
      progressPercent,
      daysRemaining
    };
  });
}

/**
 * Calculates consolidated overview metrics across all habits for the Main Page.
 * @param {object[]} habits - Array of habit objects.
 * @param {string} [todayStr] - Today's date string.
 * @returns {object} - Consolidated summary metrics and habit card previews.
 */
export function calculateAllHabitsSummary(habits = [], todayStr = getTodayString()) {
  if (!habits || habits.length === 0) {
    return {
      totalHabits: 0,
      bestOverallStreak: 0,
      totalCompletedDaysAll: 0,
      averageCompletionRate: 0,
      habitCards: []
    };
  }

  let bestOverallStreak = 0;
  let totalCompletedDaysAll = 0;
  let sumCompletionRate = 0;

  const habitCards = habits.map(habit => {
    const stats = calculateHabitStats(habit, todayStr);
    const tiers = calculateTierProgress(stats.currentStreak);
    const currentGoal = tiers.find(t => t.isCurrentGoal) || tiers[tiers.length - 1];

    if (stats.longestStreak > bestOverallStreak) {
      bestOverallStreak = stats.longestStreak;
    }
    totalCompletedDaysAll += stats.completedDays;
    sumCompletionRate += stats.completionRate;

    return {
      ...habit,
      stats,
      currentGoal
    };
  });

  const averageCompletionRate = habits.length > 0
    ? Math.round(sumCompletionRate / habits.length)
    : 0;

  return {
    totalHabits: habits.length,
    bestOverallStreak,
    totalCompletedDaysAll,
    averageCompletionRate,
    habitCards
  };
}

/**
 * Calculates weekly activity frequency of logged events for the 7-day bar chart.
 * Distinguishes total logged sessions/events from completed habit days.
 * @param {object} habit
 * @param {string} [todayStr]
 * @returns {object}
 */
export function calculateWeeklyFrequency(habit, todayStr = getTodayString()) {
  const events = habit.events || [];
  const daysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date(todayStr + "T00:00:00");

  const weekCounts = [];
  let totalWeekLogs = 0;
  let completedDaysInWeek = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const dayName = daysNames[d.getDay()];

    let count = 0;
    for (const ev of events) {
      if (ev.date === dateStr) {
        count++;
      }
    }

    const dayStatus = getHabitDayStatus(habit, dateStr, todayStr);
    if (dayStatus === "completed") {
      completedDaysInWeek++;
    }

    // If no multi-events logged yet, fallback to status count for display
    if (count === 0) {
      if (habit.type === TRACK_TYPES.COMPLETE && (habit.completions || []).includes(dateStr)) {
        count = 1;
      } else if (habit.type === TRACK_TYPES.SKIP && (habit.skips || []).includes(dateStr)) {
        count = 1;
      }
    }

    totalWeekLogs += count;
    weekCounts.push({
      dateStr,
      dayName,
      count,
      status: dayStatus,
      isToday: i === 0
    });
  }

  const maxCount = Math.max(...weekCounts.map(w => w.count), 1);

  return {
    weekCounts,
    maxCount,
    totalWeekLogs,
    completedDaysInWeek
  };
}

/**
 * Generates month calendar data for display in the interactive widget.
 * @param {object} habit - Habit object.
 * @param {number} year - Full year (e.g. 2026).
 * @param {number} month - 1-indexed month (1..12).
 * @param {string} [todayStr] - Today's date string.
 * @returns {object} - Calendar grid metadata and days.
 */
export function generateMonthCalendar(habit, year, month, todayStr = getTodayString()) {
  const monthStart = new Date(year, month - 1, 1);
  const firstDayWeekday = monthStart.getDay();
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const monthName = monthStart.toLocaleString("default", { month: "long" });

  const days = [];
  const cachedSets = {
    skips: new Set(habit?.skips || []),
    completions: new Set(habit?.completions || [])
  };

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const status = getHabitDayStatus(habit, dateStr, todayStr, cachedSets);
    const isToday = dateStr === todayStr;

    days.push({
      dayNumber: d,
      dateStr,
      status,
      isToday,
      weekday: (firstDayWeekday + d - 1) % 7
    });
  }

  return {
    year,
    month,
    monthName,
    firstDayWeekday,
    totalDaysInMonth,
    days
  };
}
