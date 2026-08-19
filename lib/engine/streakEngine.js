import { QUITLY_TIERS, TRACK_TYPES } from "../constants.js";

/**
 * Formats a Date object as YYYY-MM-DD.
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD.
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
 * Determines the status of a habit for a specific date.
 * @param {object} habit - Habit object.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} [todayStr] - Today's date string (defaults to today).
 * @returns {"completed"|"skipped"|"future"|"before_start"}
 */
export function getHabitDayStatus(habit, dateStr, todayStr = getTodayString()) {
  const habitStart = habit.createdAt ? habit.createdAt.split("T")[0] : todayStr;

  if (dateStr < habitStart) {
    return "before_start";
  }

  if (dateStr > todayStr) {
    return "future";
  }

  const skips = new Set(habit.skips || []);
  const completions = new Set(habit.completions || []);

  if (habit.type === TRACK_TYPES.COMPLETE) {
    // Complete-tracked: only completed if in completions list and not in skips
    if (completions.has(dateStr) && !skips.has(dateStr)) {
      return "completed";
    }
    return "skipped";
  }

  // Skip-tracked (Quitly default): completed unless explicitly in skips
  if (skips.has(dateStr)) {
    return "skipped";
  }
  return "completed";
}

/**
 * Calculates current streak, longest streak, and stats for a habit.
 * @param {object} habit - Habit object.
 * @param {string} [todayStr] - Today's date string.
 * @returns {object} - Streak metrics.
 */
export function calculateHabitStats(habit, todayStr = getTodayString()) {
  const habitStart = habit.createdAt ? habit.createdAt.split("T")[0] : todayStr;
  const allDates = getDateRange(habitStart, todayStr);

  if (allDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalTrackedDays: 0,
      completedDays: 0,
      skippedDays: 0,
      completionRate: 0,
      streakStartDate: null,
      streakAnchorTimestamp: null
    };
  }

  const dayStatuses = allDates.map(dateStr => ({
    dateStr,
    status: getHabitDayStatus(habit, dateStr, todayStr)
  }));

  // Total and completed counts
  const totalTrackedDays = dayStatuses.length;
  let completedDays = 0;
  let skippedDays = 0;

  for (const item of dayStatuses) {
    if (item.status === "completed") {
      completedDays++;
    } else if (item.status === "skipped") {
      skippedDays++;
    }
  }

  const completionRate = totalTrackedDays > 0 
    ? Math.round((completedDays / totalTrackedDays) * 100) 
    : 0;

  // Calculate current streak by walking backward from today
  let currentStreak = 0;
  let streakStartDate = null;

  for (let i = dayStatuses.length - 1; i >= 0; i--) {
    if (dayStatuses[i].status === "completed") {
      currentStreak++;
      streakStartDate = dayStatuses[i].dateStr;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;

  for (const item of dayStatuses) {
    if (item.status === "completed") {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Calculate streak anchor timestamp for live clock (start of streakStartDate in UTC/local)
  let streakAnchorTimestamp = null;
  if (currentStreak > 0 && streakStartDate) {
    // If habit has custom streakAnchor, use it if compatible, else start of streakStartDate
    if (habit.streakAnchor && habit.streakAnchor.startsWith(streakStartDate)) {
      streakAnchorTimestamp = new Date(habit.streakAnchor).getTime();
    } else {
      streakAnchorTimestamp = new Date(`${streakStartDate}T00:00:00`).getTime();
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalTrackedDays,
    completedDays,
    skippedDays,
    completionRate,
    streakStartDate,
    streakAnchorTimestamp
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
 * Generates month calendar data for display in the interactive widget.
 * @param {object} habit - Habit object.
 * @param {number} year - Full year (e.g. 2026).
 * @param {number} month - 1-indexed month (1..12).
 * @param {string} [todayStr] - Today's date string.
 * @returns {object} - Calendar grid metadata and days.
 */
export function generateMonthCalendar(habit, year, month, todayStr = getTodayString()) {
  const monthStart = new Date(year, month - 1, 1);
  const firstDayWeekday = monthStart.getDay(); // 0 = Sun, 1 = Mon...
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  const monthName = monthStart.toLocaleString("default", { month: "long" });

  const days = [];

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const status = getHabitDayStatus(habit, dateStr, todayStr);
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
