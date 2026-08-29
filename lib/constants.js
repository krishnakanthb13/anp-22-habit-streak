export const DATA_NOTE_NAME = "habit_streak_data";
export const DATA_NOTE_TAGS = ["-reports/-habit-streak"];

export const TRACK_TYPES = {
  SKIP: "skip", // Quitting / Bad habit: habit is clean unless explicitly marked reset/slip (Abstinence)
  COMPLETE: "complete" // Building / Good habit: habit is completed when marked done (Positive Action)
};

export const INTERVAL_PERIODS = {
  DAY: "day"
};

// Quitly 12 Milestone Tiers
export const QUITLY_TIERS = [
  { id: "1d", label: "1 Day", days: 1, tierNum: 1, badge: "🌱", title: "Tier 1: First Step" },
  { id: "3d", label: "3 Days", days: 3, tierNum: 2, badge: "🌿", title: "Tier 2: Momentum" },
  { id: "7d", label: "7 Days", days: 7, tierNum: 3, badge: "🔥", title: "Tier 3: 1 Week" },
  { id: "14d", label: "14 Days", days: 14, tierNum: 4, badge: "⚡", title: "Tier 4: 2 Weeks" },
  { id: "30d", label: "30 Days", days: 30, tierNum: 5, badge: "🥉", title: "Tier 5: 1 Month" },
  { id: "60d", label: "2 Months", days: 60, tierNum: 6, badge: "🥈", title: "Tier 6: 2 Months" },
  { id: "90d", label: "3 Months", days: 90, tierNum: 7, badge: "🥇", title: "Tier 7: 3 Months" },
  { id: "180d", label: "6 Months", days: 180, tierNum: 8, badge: "💎", title: "Tier 8: 6 Months" },
  { id: "365d", label: "1 Year", days: 365, tierNum: 9, badge: "👑", title: "Tier 9: 1 Year" },
  { id: "730d", label: "2 Years", days: 730, tierNum: 10, badge: "🏆", title: "Tier 10: 2 Years" },
  { id: "1825d", label: "5 Years", days: 1825, tierNum: 11, badge: "🌟", title: "Tier 11: 5 Years" }
];

// Categorized Preset Templates
export const QUITLY_TEMPLATES = [
  { name: "I am Sober (No Alcohol)", icon: "🍷", category: "Sobriety", type: TRACK_TYPES.SKIP, colorTheme: "blue" },
  { name: "No Smoking / Nicotine", icon: "🚭", category: "Sobriety", type: TRACK_TYPES.SKIP, colorTheme: "bronze" },
  { name: "No Junk Food & Fast Food", icon: "🍔", category: "Diet & Health", type: TRACK_TYPES.SKIP, colorTheme: "amber" },
  { name: "No Refined Sugar", icon: "🧁", category: "Diet & Health", type: TRACK_TYPES.SKIP, colorTheme: "rose" },
  { name: "Without Caffeine", icon: "☕", category: "Lifestyle", type: TRACK_TYPES.SKIP, colorTheme: "teal" },
  { name: "No Social Media Doomscrolling", icon: "📱", category: "Mindfulness", type: TRACK_TYPES.SKIP, colorTheme: "purple" },
  { name: "No Impulse Online Shopping", icon: "💸", category: "Finance", type: TRACK_TYPES.SKIP, colorTheme: "amber" }
];

export const AMPLENOTE_TEMPLATES = [
  { name: "Daily Workout & Exercise", icon: "🏃", category: "Fitness", type: TRACK_TYPES.COMPLETE, colorTheme: "emerald" },
  { name: "Daily Reading (20 Mins)", icon: "📚", category: "Knowledge", type: TRACK_TYPES.COMPLETE, colorTheme: "indigo" },
  { name: "Morning Meditation", icon: "🧘", category: "Mindfulness", type: TRACK_TYPES.COMPLETE, colorTheme: "purple" },
  { name: "Drink 2L Water", icon: "💧", category: "Health", type: TRACK_TYPES.COMPLETE, colorTheme: "blue" },
  { name: "Daily Journaling & Review", icon: "✍️", category: "Mindfulness", type: TRACK_TYPES.COMPLETE, colorTheme: "teal" },
  { name: "Deep Work Session (90m)", icon: "💻", category: "Productivity", type: TRACK_TYPES.COMPLETE, colorTheme: "rose" }
];

export const PRESET_TEMPLATES = [
  ...QUITLY_TEMPLATES,
  ...AMPLENOTE_TEMPLATES
];

export const COLOR_THEMES = {
  amber: {
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    bgLight: "rgba(245, 158, 11, 0.15)",
    text: "#fbbf24"
  },
  rose: {
    gradient: "linear-gradient(135deg, #fb7185, #e11d48)",
    bgLight: "rgba(251, 113, 133, 0.15)",
    text: "#fda4af"
  },
  blue: {
    gradient: "linear-gradient(135deg, #38bdf8, #2563eb)",
    bgLight: "rgba(56, 189, 248, 0.15)",
    text: "#7dd3fc"
  },
  emerald: {
    gradient: "linear-gradient(135deg, #34d399, #059669)",
    bgLight: "rgba(52, 211, 153, 0.15)",
    text: "#6ee7b7"
  },
  purple: {
    gradient: "linear-gradient(135deg, #c084fc, #7c3aed)",
    bgLight: "rgba(192, 132, 252, 0.15)",
    text: "#d8b4fe"
  },
  bronze: {
    gradient: "linear-gradient(135deg, #d97706, #92400e)",
    bgLight: "rgba(217, 119, 6, 0.15)",
    text: "#fcd34d"
  },
  teal: {
    gradient: "linear-gradient(135deg, #2dd4bf, #0f766e)",
    bgLight: "rgba(45, 212, 191, 0.15)",
    text: "#5eead4"
  },
  indigo: {
    gradient: "linear-gradient(135deg, #818cf8, #4338ca)",
    bgLight: "rgba(129, 140, 248, 0.15)",
    text: "#a5b4fc"
  }
};

export const VALID_THEMES = ["midnight", "glass", "dark", "light", "neon"];

export const VALID_EVENT_TYPES = ["done", "skip", "slip", "reset", "calendar_edit"];

export const DEFAULT_STATE = {
  version: 2,
  revision: 0,
  theme: "midnight",
  activeHabitId: null,
  habits: []
};

let _idCounter = 0;

/**
 * Generates a collision-resistant unique ID.
 * @param {string} prefix
 * @returns {string}
 */
export function generateUniqueId(prefix = "habit") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const countPart = (++_idCounter).toString(36);
  return `${prefix}_${timestamp}_${randomPart}_${countPart}`;
}

