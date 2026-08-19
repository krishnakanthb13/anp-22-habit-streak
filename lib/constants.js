export const DATA_NOTE_NAME = "habit_streak_data";
export const DATA_NOTE_TAGS = ["-reports/-habit-streak"];

export const TRACK_TYPES = {
  SKIP: "skip", // Quitly default: habit is done unless explicitly marked skipped
  COMPLETE: "complete" // Amplenote default: habit is not done unless explicitly completed
};

export const INTERVAL_PERIODS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month"
};

// Quitly-style milestone tiers (in days)
export const QUITLY_TIERS = [
  { id: "1d", label: "1 Day", days: 1, badge: "🌱", title: "First Step" },
  { id: "3d", label: "3 Days", days: 3, badge: "🌿", title: "Momentum" },
  { id: "7d", label: "1 Week", days: 7, badge: "🔥", title: "First Week" },
  { id: "14d", label: "2 Weeks", days: 14, badge: "⚡", title: "Fortnight" },
  { id: "30d", label: "1 Month", days: 30, badge: "🥉", title: "Monthly Milestone" },
  { id: "60d", label: "2 Months", days: 60, badge: "🥈", title: "Habit Formed" },
  { id: "90d", label: "3 Months", days: 90, badge: "🥇", title: "Quarter Champion" },
  { id: "180d", label: "6 Months", days: 180, badge: "💎", title: "Half Year" },
  { id: "365d", label: "1 Year", days: 365, badge: "👑", title: "Annual Mastery" },
  { id: "730d", label: "2 Years", days: 730, badge: "🏆", title: "Unstoppable" },
  { id: "1825d", label: "5 Years", days: 1825, badge: "🌟", title: "Legendary" }
];

export const DEFAULT_STATE = {
  version: 1,
  activeHabitId: null,
  habits: []
};
