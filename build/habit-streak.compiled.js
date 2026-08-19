(() => {
// anp-22-habit-streak/lib/constants.js
var DATA_NOTE_NAME = "habit_streak_data";
var DATA_NOTE_TAGS = ["-reports/-habit-streak"];
var TRACK_TYPES = {
  SKIP: "skip",
  // Quitly default: habit is done unless explicitly marked skipped (Abstinence)
  COMPLETE: "complete"
  // Amplenote default: habit is not done unless explicitly completed (Positive Action)
};
var INTERVAL_PERIODS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month"
};
var QUITLY_TIERS = [
  { id: "1d", label: "1 Day", days: 1, tierNum: 1, badge: "\u{1F331}", title: "Tier 1: First Step" },
  { id: "3d", label: "3 Days", days: 3, tierNum: 2, badge: "\u{1F33F}", title: "Tier 2: Momentum" },
  { id: "7d", label: "7 Days", days: 7, tierNum: 3, badge: "\u{1F525}", title: "Tier 3: 1 Week" },
  { id: "14d", label: "14 Days", days: 14, tierNum: 4, badge: "\u26A1", title: "Tier 4: 2 Weeks" },
  { id: "30d", label: "30 Days", days: 30, tierNum: 5, badge: "\u{1F949}", title: "Tier 5: 1 Month" },
  { id: "60d", label: "2 Months", days: 60, tierNum: 6, badge: "\u{1F948}", title: "Tier 6: 2 Months" },
  { id: "90d", label: "3 Months", days: 90, tierNum: 7, badge: "\u{1F947}", title: "Tier 7: 3 Months" },
  { id: "180d", label: "6 Months", days: 180, tierNum: 8, badge: "\u{1F48E}", title: "Tier 8: 6 Months" },
  { id: "365d", label: "1 Year", days: 365, tierNum: 9, badge: "\u{1F451}", title: "Tier 9: 1 Year" },
  { id: "730d", label: "2 Years", days: 730, tierNum: 10, badge: "\u{1F3C6}", title: "Tier 10: 2 Years" },
  { id: "1825d", label: "5 Years", days: 1825, tierNum: 11, badge: "\u{1F31F}", title: "Tier 11: 5 Years" }
];
var QUITLY_TEMPLATES = [
  { name: "I am Sober (No Alcohol)", icon: "\u{1F377}", category: "Sobriety", type: TRACK_TYPES.SKIP, colorTheme: "blue" },
  { name: "No Smoking / Nicotine", icon: "\u{1F6AD}", category: "Sobriety", type: TRACK_TYPES.SKIP, colorTheme: "bronze" },
  { name: "No Junk Food & Fast Food", icon: "\u{1F354}", category: "Diet & Health", type: TRACK_TYPES.SKIP, colorTheme: "amber" },
  { name: "No Refined Sugar", icon: "\u{1F9C1}", category: "Diet & Health", type: TRACK_TYPES.SKIP, colorTheme: "rose" },
  { name: "Without Caffeine", icon: "\u2615", category: "Lifestyle", type: TRACK_TYPES.SKIP, colorTheme: "teal" },
  { name: "No Social Media Doomscrolling", icon: "\u{1F4F1}", category: "Mindfulness", type: TRACK_TYPES.SKIP, colorTheme: "purple" },
  { name: "No Impulse Online Shopping", icon: "\u{1F4B8}", category: "Finance", type: TRACK_TYPES.SKIP, colorTheme: "amber" }
];
var AMPLENOTE_TEMPLATES = [
  { name: "Daily Workout & Exercise", icon: "\u{1F3C3}", category: "Fitness", type: TRACK_TYPES.COMPLETE, colorTheme: "emerald" },
  { name: "Daily Reading (20 Mins)", icon: "\u{1F4DA}", category: "Knowledge", type: TRACK_TYPES.COMPLETE, colorTheme: "indigo" },
  { name: "Morning Meditation", icon: "\u{1F9D8}", category: "Mindfulness", type: TRACK_TYPES.COMPLETE, colorTheme: "purple" },
  { name: "Drink 2L Water", icon: "\u{1F4A7}", category: "Health", type: TRACK_TYPES.COMPLETE, colorTheme: "blue" },
  { name: "Daily Journaling & Review", icon: "\u270D\uFE0F", category: "Mindfulness", type: TRACK_TYPES.COMPLETE, colorTheme: "teal" },
  { name: "Deep Work Session (90m)", icon: "\u{1F4BB}", category: "Productivity", type: TRACK_TYPES.COMPLETE, colorTheme: "rose" }
];
var PRESET_TEMPLATES = [
  ...QUITLY_TEMPLATES,
  ...AMPLENOTE_TEMPLATES
];
var COLOR_THEMES = {
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
var DEFAULT_STATE = {
  version: 2,
  revision: 0,
  activeHabitId: null,
  habits: []
};
function generateUniqueId(prefix = "habit") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${randomPart}`;
}

// anp-22-habit-streak/lib/data/store.js
var SETTING_DATA_NOTE_UUID = "Habit_Streak_Data_UUID [Do not Edit!]";
var mutationQueue = Promise.resolve();
function normalizeHabit(habit) {
  if (!habit || typeof habit !== "object") {
    return null;
  }
  const id = habit.id && typeof habit.id === "string" ? habit.id : generateUniqueId("habit");
  const name = habit.name && typeof habit.name === "string" ? habit.name.trim() : "Untitled Habit";
  const icon = habit.icon && typeof habit.icon === "string" ? habit.icon.trim() : "\u{1F525}";
  const colorTheme = habit.colorTheme && typeof habit.colorTheme === "string" ? habit.colorTheme : "blue";
  const type = habit.type === TRACK_TYPES.COMPLETE || habit.type === TRACK_TYPES.SKIP ? habit.type : TRACK_TYPES.SKIP;
  let intervalN = 1;
  let intervalPeriod = INTERVAL_PERIODS.DAY;
  if (habit.interval && typeof habit.interval === "object") {
    const rawN = parseInt(habit.interval.n, 10);
    if (!isNaN(rawN) && rawN >= 1 && rawN <= 365) {
      intervalN = rawN;
    }
    if ([INTERVAL_PERIODS.DAY, INTERVAL_PERIODS.WEEK, INTERVAL_PERIODS.MONTH].includes(habit.interval.period)) {
      intervalPeriod = habit.interval.period;
    }
  }
  const nowISO = (/* @__PURE__ */ new Date()).toISOString();
  const createdAt = habit.createdAt && typeof habit.createdAt === "string" ? habit.createdAt : nowISO;
  const createdDateStr = createdAt.split("T")[0];
  const trackingStartDate = habit.trackingStartDate && typeof habit.trackingStartDate === "string" ? habit.trackingStartDate : createdDateStr || nowISO.split("T")[0];
  const streakAnchor = habit.streakAnchor && typeof habit.streakAnchor === "string" ? habit.streakAnchor : nowISO;
  const streakStartedAt = habit.streakStartedAt && typeof habit.streakStartedAt === "string" ? habit.streakStartedAt : streakAnchor;
  const skips = Array.isArray(habit.skips) ? Array.from(new Set(habit.skips.filter((d) => typeof d === "string" && d.length === 10))).sort() : [];
  const completions = Array.isArray(habit.completions) ? Array.from(new Set(habit.completions.filter((d) => typeof d === "string" && d.length === 10))).sort() : [];
  const events = Array.isArray(habit.events) ? habit.events.filter((e) => e && typeof e === "object") : [];
  const resetLogs = Array.isArray(habit.resetLogs) ? habit.resetLogs.filter((r) => r && typeof r === "object") : [];
  return {
    id,
    name,
    icon,
    colorTheme,
    type,
    interval: {
      n: intervalN,
      period: intervalPeriod
    },
    createdAt,
    trackingStartDate,
    streakAnchor,
    streakStartedAt,
    skips,
    completions,
    events,
    resetLogs,
    ...habit.taskUUID ? { taskUUID: habit.taskUUID } : {}
  };
}
function normalizeState(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return { ...DEFAULT_STATE };
  }
  const rawHabits = Array.isArray(parsed.habits) ? parsed.habits : [];
  const habits = rawHabits.map(normalizeHabit).filter(Boolean);
  let activeHabitId = parsed.activeHabitId && typeof parsed.activeHabitId === "string" ? parsed.activeHabitId : null;
  if (activeHabitId && !habits.some((h) => h.id === activeHabitId)) {
    activeHabitId = habits.length > 0 ? habits[0].id : null;
  } else if (!activeHabitId && habits.length > 0) {
    activeHabitId = habits[0].id;
  }
  const revision = Number.isInteger(parsed.revision) ? parsed.revision : 0;
  const version = Number.isInteger(parsed.version) ? parsed.version : 2;
  const theme = parsed.theme && typeof parsed.theme === "string" ? parsed.theme : "midnight";
  return {
    version,
    revision,
    theme,
    activeHabitId,
    habits
  };
}
async function getNoteUUID(app, noteName, tagNames, settingKey) {
  const existingUUID = app.settings ? await app.settings[settingKey] : null;
  if (existingUUID) {
    if (existingUUID.startsWith("local-")) {
      try {
        const allNotes = await app.filterNotes({});
        if (allNotes && Array.isArray(allNotes)) {
          const matchingNotes = allNotes.filter((note) => {
            const nameMatches = note.name === noteName;
            const tagMatches = note.tags && tagNames.every((tag) => note.tags.includes(tag));
            return nameMatches && tagMatches;
          });
          const onlineNote = matchingNotes.find((note) => note.uuid && !note.uuid.startsWith("local-"));
          if (onlineNote && onlineNote.uuid) {
            if (typeof app.setSetting === "function") {
              await app.setSetting(settingKey, onlineNote.uuid);
            }
            return onlineNote.uuid;
          }
          if (matchingNotes.length > 0 && matchingNotes[0].uuid) {
            return matchingNotes[0].uuid;
          }
        }
        try {
          const localNote = await app.findNote({ uuid: existingUUID });
          if (localNote) return existingUUID;
        } catch (findErr) {
          console.warn("[HabitStreak] Verification of local UUID note failed:", findErr);
        }
      } catch (error) {
        console.error("[HabitStreak] Error resolving note UUID:", error);
      }
    } else {
      try {
        const note = await app.findNote({ uuid: existingUUID });
        if (note) {
          return existingUUID;
        }
      } catch {
        console.warn("[HabitStreak] Stored UUID could not be verified, rediscovering note.");
      }
    }
  }
  try {
    const allNotes = await app.filterNotes({});
    if (allNotes && Array.isArray(allNotes)) {
      const match = allNotes.find((n) => {
        const nameMatches = n.name === noteName;
        const tagMatches = n.tags && tagNames.every((t) => n.tags.includes(t));
        return nameMatches && tagMatches;
      });
      if (match && match.uuid) {
        if (typeof app.setSetting === "function") {
          await app.setSetting(settingKey, match.uuid);
        }
        return match.uuid;
      }
    }
  } catch (err) {
    console.warn("[HabitStreak] filterNotes search error:", err);
  }
  try {
    const newUUID = await app.createNote(noteName, tagNames);
    if (typeof app.setSetting === "function") {
      await app.setSetting(settingKey, newUUID);
    }
    return newUUID;
  } catch (error) {
    console.error("[HabitStreak] Error creating note:", error);
    throw error;
  }
}
function extractJsonFromMarkdown(content) {
  if (!content || typeof content !== "string") {
    return null;
  }
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = content.match(codeBlockRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (err) {
      console.error("[HabitStreak] Error parsing JSON from code block:", err);
      return null;
    }
  }
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return JSON.parse(trimmed);
    }
  } catch {
    return null;
  }
  return null;
}
function formatStateAsMarkdown(state) {
  const jsonStr = JSON.stringify(state, null, 2);
  return `# Habit Streak Data

> This note is automatically managed by the Habit Streak plugin. Do not modify the JSON code block manually unless you know what you are doing.

\`\`\`json
${jsonStr}
\`\`\`
`;
}
async function loadState(app) {
  try {
    const dataNoteUUID = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    const content = await app.getNoteContent({ uuid: dataNoteUUID });
    if (content && typeof content === "string" && content.trim().length > 0) {
      const parsed = extractJsonFromMarkdown(content);
      if (parsed && typeof parsed === "object") {
        return normalizeState(parsed);
      }
      console.error("[HabitStreak] Refusing to overwrite malformed persisted note content with empty default state.");
      return normalizeState({ ...DEFAULT_STATE });
    }
    const fallbackState = normalizeState({ ...DEFAULT_STATE });
    const markdown = formatStateAsMarkdown(fallbackState);
    await app.replaceNoteContent({ uuid: dataNoteUUID }, markdown);
    return fallbackState;
  } catch (err) {
    console.error("[HabitStreak] Failed to load state:", err);
    return normalizeState({ ...DEFAULT_STATE });
  }
}
async function saveState(app, state) {
  try {
    const normalized = normalizeState(state);
    normalized.revision = (Number.isInteger(normalized.revision) ? normalized.revision : 0) + 1;
    const dataNoteUUID = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    const markdown = formatStateAsMarkdown(normalized);
    await app.replaceNoteContent({ uuid: dataNoteUUID }, markdown);
    if (state && typeof state === "object") {
      state.revision = normalized.revision;
    }
    return true;
  } catch (err) {
    console.error("[HabitStreak] Failed to save state:", err);
    return false;
  }
}
async function saveStateOrThrow(app, state) {
  const success = await saveState(app, state);
  if (!success) {
    throw new Error("Failed to persist Habit Streak state to note.");
  }
}
function mutateState(app, mutator) {
  mutationQueue = mutationQueue.catch(() => {
  }).then(async () => {
    const state = await loadState(app);
    const result = await mutator(state);
    await saveStateOrThrow(app, state);
    return result !== void 0 ? result : state;
  });
  return mutationQueue;
}

// anp-22-habit-streak/lib/engine/streakEngine.js
function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "";
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getTodayString() {
  return formatDate(/* @__PURE__ */ new Date());
}
function getDateRange(startStr, endStr) {
  const dates = [];
  const start = /* @__PURE__ */ new Date(startStr + "T00:00:00");
  const end = /* @__PURE__ */ new Date(endStr + "T00:00:00");
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
function isScheduledDate(habit, dateStr, refStartStr) {
  const habitStart = refStartStr || habit?.trackingStartDate || (habit?.createdAt ? habit.createdAt.split("T")[0] : getTodayString());
  if (dateStr < habitStart) {
    return false;
  }
  const interval = habit?.interval || { n: 1, period: INTERVAL_PERIODS.DAY };
  const n = interval.n && Number.isInteger(interval.n) && interval.n >= 1 ? interval.n : 1;
  const period = interval.period || INTERVAL_PERIODS.DAY;
  if (period === INTERVAL_PERIODS.DAY && n === 1) {
    return true;
  }
  const startDate = /* @__PURE__ */ new Date(habitStart + "T00:00:00");
  const targetDate = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
  if (isNaN(startDate.getTime()) || isNaN(targetDate.getTime())) {
    return true;
  }
  const diffInDays = Math.round((targetDate - startDate) / (1e3 * 60 * 60 * 24));
  if (diffInDays < 0) {
    return false;
  }
  if (period === INTERVAL_PERIODS.DAY) {
    return diffInDays % n === 0;
  }
  if (period === INTERVAL_PERIODS.WEEK) {
    const isSameWeekday = targetDate.getDay() === startDate.getDay();
    const diffInWeeks = Math.floor(diffInDays / 7);
    return isSameWeekday && diffInWeeks % n === 0;
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
function getHabitDayStatus(habit, dateStr, todayStr = getTodayString(), cachedSets = null) {
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
  const scheduled = isScheduledDate(habit, dateStr, habitStart);
  if (!scheduled) {
    return "not_applicable";
  }
  if (habit?.type === TRACK_TYPES.COMPLETE) {
    return "skipped";
  }
  return "completed";
}
function calculateHabitStats(habit, todayStr = getTodayString()) {
  let habitStart = habit.trackingStartDate || (habit.createdAt ? habit.createdAt.split("T")[0] : todayStr);
  const allRecordedDates = [...habit.completions || [], ...habit.skips || []].filter(Boolean).sort();
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
  const dayStatuses = allDates.map((dateStr) => ({
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
  const totalRelevantDays = scheduledDays > 0 ? scheduledDays : totalTrackedDays;
  const completionRate = totalRelevantDays > 0 ? Math.round(completedDays / totalRelevantDays * 100) : 0;
  let currentStreak = 0;
  let streakStartDate = null;
  for (let i = dayStatuses.length - 1; i >= 0; i--) {
    const { dateStr, status } = dayStatuses[i];
    if (status === "completed") {
      currentStreak++;
      streakStartDate = dateStr;
    } else if (status === "not_applicable") {
      continue;
    } else {
      break;
    }
  }
  let longestStreak = 0;
  let tempStreak = 0;
  for (const item of dayStatuses) {
    if (item.status === "completed") {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else if (item.status === "not_applicable") {
      continue;
    } else {
      tempStreak = 0;
    }
  }
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
      streakAnchorTimestamp = (/* @__PURE__ */ new Date(`${streakStartDate}T00:00:00`)).getTime();
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
function calculateTierProgress(currentStreak) {
  let nextGoalIdentified = false;
  return QUITLY_TIERS.map((tier) => {
    const isUnlocked = currentStreak >= tier.days;
    let isCurrentGoal = false;
    if (!isUnlocked && !nextGoalIdentified) {
      isCurrentGoal = true;
      nextGoalIdentified = true;
    }
    const progressPercent = isUnlocked ? 100 : Math.min(99, Math.round(currentStreak / tier.days * 100));
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
function calculateAllHabitsSummary(habits = [], todayStr = getTodayString()) {
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
  const habitCards = habits.map((habit) => {
    const stats = calculateHabitStats(habit, todayStr);
    const tiers = calculateTierProgress(stats.currentStreak);
    const currentGoal = tiers.find((t) => t.isCurrentGoal) || tiers[tiers.length - 1];
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
  const averageCompletionRate = habits.length > 0 ? Math.round(sumCompletionRate / habits.length) : 0;
  return {
    totalHabits: habits.length,
    bestOverallStreak,
    totalCompletedDaysAll,
    averageCompletionRate,
    habitCards
  };
}
function generateMonthCalendar(habit, year, month, todayStr = getTodayString()) {
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

// anp-22-habit-streak/lib/ui/dashboardTemplate.js
function buildDashboardTemplate(dashboardData) {
  const safeDataJson = JSON.stringify(dashboardData).replace(/</g, "\\u003c");
  const presetsJson = JSON.stringify(PRESET_TEMPLATES).replace(/</g, "\\u003c");
  const quitlyPresetsJson = JSON.stringify(QUITLY_TEMPLATES).replace(/</g, "\\u003c");
  const amplenotePresetsJson = JSON.stringify(AMPLENOTE_TEMPLATES).replace(/</g, "\\u003c");
  const themesJson = JSON.stringify(COLOR_THEMES).replace(/</g, "\\u003c");
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Habit Streaks</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --shell-bg: #0b0f19;
      --card-container-bg: #ffffff;
      --card-subtle-bg: #f8fafc;
      --text-main: #0f172a;
      --text-sub: #64748b;
      --border-color: #e2e8f0;
      --header-title-color: #ffffff;
      --blue-accent: #2563eb;
      --blue-light: #dbeafe;
      --emerald-accent: #10b981;
      --rose-accent: #f43f5e;
      --indigo-accent: #6366f1;
      --radius-sm: 10px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --radius-xl: 32px;
      --shadow-subtle: 0 4px 20px rgba(0, 0, 0, 0.08);
      --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    /* 1. Midnight Theme (Default) */
    html.theme-midnight, body.theme-midnight {
      --shell-bg: #0b0f19;
      --card-container-bg: #ffffff;
      --card-subtle-bg: #f8fafc;
      --text-main: #0f172a;
      --text-sub: #64748b;
      --border-color: #e2e8f0;
      --header-title-color: #ffffff;
    }

    /* 2. Glassmorphism Frosted Theme */
    html.theme-glass, body.theme-glass {
      --shell-bg: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0b1329 100%);
      --card-container-bg: rgba(255, 255, 255, 0.08);
      --card-subtle-bg: rgba(255, 255, 255, 0.05);
      --text-main: #ffffff;
      --text-sub: #cbd5e1;
      --border-color: rgba(255, 255, 255, 0.16);
      --header-title-color: #ffffff;
      color: #ffffff;
    }
    html.theme-glass .quitly-white-sheet,
    html.theme-glass .templates-shelf-card,
    body.theme-glass .quitly-white-sheet,
    body.theme-glass .templates-shelf-card {
      background: rgba(255, 255, 255, 0.08) !important;
      backdrop-filter: blur(24px) !important;
      -webkit-backdrop-filter: blur(24px) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      color: #ffffff !important;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5) !important;
    }
    html.theme-glass .activity-section-card,
    html.theme-glass .goal-check-box,
    body.theme-glass .activity-section-card,
    body.theme-glass .goal-check-box {
      background: rgba(255, 255, 255, 0.06) !important;
      border-color: rgba(255, 255, 255, 0.14) !important;
      color: #f8fafc !important;
    }
    html.theme-glass .tier-laurel-card .laurel-title,
    body.theme-glass .tier-laurel-card .laurel-title {
      color: #93c5fd !important;
    }

    /* 3. Pure Dark Mode */
    html.theme-dark, body.theme-dark {
      --shell-bg: #07090e;
      --card-container-bg: #111827;
      --card-subtle-bg: #1f2937;
      --text-main: #f9fafb;
      --text-sub: #9ca3af;
      --border-color: #374151;
      --header-title-color: #f9fafb;
      color: #f9fafb;
    }
    html.theme-dark .quitly-white-sheet,
    html.theme-dark .templates-shelf-card,
    body.theme-dark .quitly-white-sheet,
    body.theme-dark .templates-shelf-card {
      background: #111827 !important;
      color: #f9fafb !important;
      border: 1px solid #374151 !important;
    }
    html.theme-dark .activity-section-card,
    html.theme-dark .goal-check-box,
    body.theme-dark .activity-section-card,
    body.theme-dark .goal-check-box {
      background: #1f2937 !important;
      border-color: #374151 !important;
      color: #f9fafb !important;
    }
    html.theme-dark .tier-laurel-card .laurel-title,
    body.theme-dark .tier-laurel-card .laurel-title {
      color: #60a5fa !important;
    }

    /* 4. Light Minimalist Theme */
    html.theme-light, body.theme-light {
      --shell-bg: #f1f5f9;
      --card-container-bg: #ffffff;
      --card-subtle-bg: #f8fafc;
      --text-main: #0f172a;
      --text-sub: #64748b;
      --border-color: #e2e8f0;
      --header-title-color: #0f172a;
      color: #0f172a;
    }
    html.theme-light .btn-header-round,
    body.theme-light .btn-header-round {
      background: rgba(0, 0, 0, 0.06) !important;
      color: #0f172a !important;
    }
    html.theme-light .btn-header-round:hover,
    body.theme-light .btn-header-round:hover {
      background: rgba(0, 0, 0, 0.12) !important;
    }
    html.theme-light .filter-segment-bar,
    body.theme-light .filter-segment-bar {
      background: rgba(0, 0, 0, 0.06) !important;
    }
    html.theme-light .filter-tab-btn,
    body.theme-light .filter-tab-btn {
      color: #64748b !important;
    }
    html.theme-light .filter-tab-btn.active,
    body.theme-light .filter-tab-btn.active {
      background: #ffffff !important;
      color: #0f172a !important;
    }

    /* 5. Cyber Neon Theme */
    html.theme-neon, body.theme-neon {
      --shell-bg: #030712;
      --card-container-bg: #0b0f19;
      --card-subtle-bg: #111827;
      --text-main: #38bdf8;
      --text-sub: #94a3b8;
      --border-color: rgba(56, 189, 248, 0.35);
      --header-title-color: #38bdf8;
      color: #f8fafc;
    }
    html.theme-neon .quitly-white-sheet,
    html.theme-neon .templates-shelf-card,
    body.theme-neon .quitly-white-sheet,
    body.theme-neon .templates-shelf-card {
      background: #0b0f19 !important;
      border: 1px solid rgba(56, 189, 248, 0.4) !important;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.25) !important;
      color: #f8fafc !important;
    }
    html.theme-neon .activity-section-card,
    html.theme-neon .goal-check-box,
    body.theme-neon .activity-section-card,
    body.theme-neon .goal-check-box {
      background: #111827 !important;
      border-color: rgba(56, 189, 248, 0.25) !important;
      color: #f8fafc !important;
    }
    html.theme-neon .tier-laurel-card .laurel-title,
    body.theme-neon .tier-laurel-card .laurel-title {
      color: #38bdf8 !important;
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
    }

    /* Guide Collapsible Accordion */
    .guide-accordion {
      background: rgba(37, 99, 235, 0.06);
      border: 1px solid rgba(37, 99, 235, 0.2);
      border-radius: var(--radius-md);
      margin-top: 8px;
      margin-bottom: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
      text-align: left;
    }
    .guide-accordion summary {
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 700;
      color: #2563eb;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      user-select: none;
      list-style: none;
    }
    .guide-accordion summary::-webkit-details-marker {
      display: none;
    }
    .guide-accordion[open] summary {
      border-bottom: 1px solid rgba(37, 99, 235, 0.15);
      background: rgba(37, 99, 235, 0.08);
    }
    .guide-accordion-body {
      padding: 12px 14px;
      font-size: 11.5px;
      line-height: 1.55;
      color: var(--text-sub);
    }

    html.theme-glass .guide-accordion,
    body.theme-glass .guide-accordion {
      background: rgba(255, 255, 255, 0.05) !important;
      border-color: rgba(255, 255, 255, 0.14) !important;
    }
    html.theme-glass .guide-accordion summary,
    body.theme-glass .guide-accordion summary {
      color: #93c5fd !important;
    }
    html.theme-dark .guide-accordion,
    body.theme-dark .guide-accordion {
      background: #1f2937 !important;
      border-color: #374151 !important;
    }
    html.theme-dark .guide-accordion summary,
    body.theme-dark .guide-accordion summary {
      color: #60a5fa !important;
    }
    html.theme-neon .guide-accordion,
    body.theme-neon .guide-accordion {
      background: #111827 !important;
      border-color: rgba(56, 189, 248, 0.3) !important;
    }
    html.theme-neon .guide-accordion summary,
    body.theme-neon .guide-accordion summary {
      color: #38bdf8 !important;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    html, body {
      width: 100%;
      min-height: 100%;
      height: auto !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      background: var(--shell-bg);
      transition: background 0.2s ease, color 0.2s ease;
    }

    body {
      padding: 20px 12px 80px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Fast custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }

    .quitly-app-frame {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* App Shell Header */
    .app-top-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 4px;
    }

    .header-title-text {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--header-title-color);
      transition: color 0.2s ease;
    }

    .btn-header-round {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: var(--header-title-color);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.1s ease;
    }
    .btn-header-round:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }

    /* Segment Filter Bar */
    .filter-segment-bar {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 4px;
      gap: 4px;
    }

    .filter-tab-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
      white-space: nowrap;
    }
    .filter-tab-btn:hover {
      color: #ffffff;
    }
    .filter-tab-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    /* Main Container (Rounded Sheet) */
    .quitly-white-sheet {
      background: var(--card-container-bg);
      color: var(--text-main);
      border-radius: var(--radius-xl);
      padding: 20px 16px;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: background 0.2s ease, color 0.2s ease;
    }

    /* Section Category Headings */
    .section-category-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 800;
      color: var(--text-sub);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 4px 0;
    }

    /* Colorful Counter Pill Cards */
    .counter-pill-card {
      border-radius: var(--radius-lg);
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #ffffff;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      position: relative;
      overflow: hidden;
    }

    .counter-pill-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    .counter-card-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .counter-card-emoji-box {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      backdrop-filter: blur(8px);
    }

    .counter-card-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .counter-card-time {
      font-size: 17px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }

    .counter-card-name {
      font-size: 13px;
      font-weight: 600;
      opacity: 0.9;
    }

    .counter-card-arrow {
      font-size: 20px;
      font-weight: 700;
      opacity: 0.75;
    }

    /* Gradient Palettes */
    .grad-amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .grad-rose { background: linear-gradient(135deg, #fb7185, #e11d48); }
    .grad-blue { background: linear-gradient(135deg, #38bdf8, #2563eb); }
    .grad-emerald { background: linear-gradient(135deg, #34d399, #059669); }
    .grad-purple { background: linear-gradient(135deg, #c084fc, #7c3aed); }
    .grad-bronze { background: linear-gradient(135deg, #d97706, #92400e); }
    .grad-teal { background: linear-gradient(135deg, #2dd4bf, #0f766e); }
    .grad-indigo { background: linear-gradient(135deg, #818cf8, #4338ca); }

    /* Single Counter Hero View */
    .single-counter-hero {
      border-radius: var(--radius-xl);
      padding: 24px 18px 30px 18px;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      box-shadow: var(--shadow-card);
    }

    .single-hero-nav {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }

    .hero-habit-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 30px;
      padding: 8px 18px;
      margin-bottom: 12px;
    }

    .hero-habit-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.4px;
    }

    .hero-its-been {
      font-size: 13px;
      font-weight: 600;
      opacity: 0.85;
      margin-bottom: 16px;
    }

    /* 4-Column Digital Ticker */
    .digital-ticker-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 20px;
      width: 100%;
    }

    .ticker-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .ticker-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 34px;
      font-weight: 800;
      line-height: 1;
    }

    .ticker-lbl {
      font-size: 12px;
      font-weight: 600;
      opacity: 0.85;
      margin-top: 4px;
    }

    /* Unit toggle pills */
    .unit-pills-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .unit-pill {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #ffffff;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
    }
    .unit-pill.active {
      background: #ffffff;
      color: #1e40af;
    }

    /* Laurel Tier Card */
    .tier-laurel-card {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 4px;
    }

    .laurel-title {
      font-size: 18px;
      font-weight: 800;
      color: #1e3a8a;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .laurel-subtitle {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-sub);
      margin-top: 2px;
      margin-bottom: 14px;
    }

    .progress-header-line {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .progress-bar-track {
      width: 100%;
      height: 10px;
      background: rgba(0,0,0,0.06);
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-bar-fill-blue {
      height: 100%;
      background: #3b82f6;
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .progress-time-left {
      width: 100%;
      text-align: right;
      font-size: 12px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 18px;
    }

    /* 3-Column Goals Checklist Grid */
    .goals-section-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-sub);
      text-align: center;
      margin-bottom: 12px;
    }

    .goals-3col-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 18px;
    }

    .goal-check-box {
      border-radius: 12px;
      padding: 10px 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid var(--border-color);
      background: var(--card-subtle-bg);
      color: var(--text-main);
    }

    .goal-check-box.unlocked {
      background: rgba(59, 130, 246, 0.15) !important;
      border-color: #3b82f6 !important;
      color: #3b82f6 !important;
    }

    .goal-check-icon {
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .goal-label-wrap {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .goal-days-text {
      font-weight: 800;
      font-size: 12px;
    }

    .goal-tier-text {
      font-size: 10px;
      font-weight: 600;
      opacity: 0.75;
    }

    /* Actions Cluster */
    .action-pills-cluster {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
      margin: 10px 0 16px 0;
    }

    .btn-quitly-action {
      background: var(--card-subtle-bg);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn-quitly-action:hover {
      opacity: 0.85;
    }

    .btn-quitly-action.btn-skip-danger {
      background: #ffe4e6;
      border-color: #fecdd3;
      color: #be123c;
    }
    .btn-quitly-action.btn-skip-danger:hover {
      background: #f43f5e;
      color: #ffffff;
    }

    .btn-quitly-action.btn-done-success {
      background: #dcfce7;
      border-color: #bbf7d0;
      color: #15803d;
    }
    .btn-quitly-action.btn-done-success:hover {
      background: #10b981;
      color: #ffffff;
    }

    /* Yearly / Monthly Activity Grid */
    .activity-section-card {
      background: var(--card-subtle-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px;
      color: var(--text-main);
    }

    .activity-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .btn-cal-action {
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 700;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s ease;
      background: var(--card-container-bg);
      color: var(--text-main);
    }
    .btn-cal-action:hover {
      opacity: 0.85;
    }
    .btn-cal-action.btn-cal-save {
      background: #22c55e !important;
      border-color: #16a34a !important;
      color: #ffffff !important;
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.35);
    }
    .btn-cal-action.btn-cal-save:hover {
      background: #16a34a !important;
    }
    .btn-cal-action.btn-cal-cancel {
      background: #f43f5e !important;
      border-color: #e11d48 !important;
      color: #ffffff !important;
    }

    .cal-edit-active-banner {
      background: rgba(37, 99, 235, 0.1);
      border: 1px dashed #3b82f6;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 11.5px;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cal-quick-actions-row {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .btn-cal-quick {
      background: var(--card-container-bg);
      border: 1px solid var(--border-color);
      color: var(--text-sub);
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.1s ease;
    }
    .btn-cal-quick:hover {
      color: var(--text-main);
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.08);
    }

    .cal-weekdays-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
      margin-bottom: 6px;
      text-align: center;
      font-size: 11px;
      font-weight: 800;
      color: var(--text-sub);
      text-transform: uppercase;
      opacity: 0.8;
    }

    .cal-grid-mini {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
      margin-bottom: 12px;
    }

    .day-mini-dot {
      aspect-ratio: 1;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      background: rgba(0,0,0,0.06);
      color: var(--text-sub);
      transition: transform 0.1s ease, outline 0.1s ease, background 0.15s ease;
      position: relative;
    }

    .day-mini-dot:hover:not(.future):not(.empty) {
      transform: scale(1.1);
      z-index: 2;
    }

    .day-mini-dot.done {
      background: #22c55e !important;
      color: #ffffff !important;
    }

    .day-mini-dot.skip {
      background: #f43f5e !important;
      color: #ffffff !important;
    }

    .day-mini-dot.before-start {
      background: rgba(0,0,0,0.03);
      color: var(--text-sub);
      opacity: 0.55;
    }

    .day-mini-dot.off-day {
      background: rgba(148, 163, 184, 0.15);
      color: var(--text-sub);
      border: 1px dashed var(--border-color);
      opacity: 0.65;
    }

    .day-mini-dot.future {
      background: transparent;
      opacity: 0.25;
      cursor: not-allowed;
    }

    .day-mini-dot.is-today {
      box-shadow: 0 0 0 2px #3b82f6 !important;
      font-weight: 900;
    }

    .day-mini-dot.editing {
      outline: 2px dashed #3b82f6;
      outline-offset: 1px;
      cursor: pointer;
    }

    .day-mini-dot.empty {
      background: transparent !important;
      cursor: default !important;
      outline: none !important;
      box-shadow: none !important;
    }

    .resets-counter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      padding-top: 10px;
      border-top: 1px solid var(--border-color);
    }

    /* Weekly Frequency Chart */
    .weekly-bars-container {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 8px;
      height: 90px;
      padding: 10px 4px 0 4px;
      margin-bottom: 8px;
    }

    .weekly-bar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      justify-content: flex-end;
      gap: 4px;
    }

    .weekly-bar-fill {
      width: 100%;
      max-width: 28px;
      background: #3b82f6;
      border-radius: 6px 6px 2px 2px;
      min-height: 6px;
      transition: height 0.3s ease;
    }
    .weekly-bar-col.today .weekly-bar-fill {
      background: #10b981;
    }

    .weekly-day-lbl {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-sub);
    }

    .weekly-count-lbl {
      font-size: 10px;
      font-weight: 800;
      color: var(--text-main);
    }

    /* Templates Modal / Section */
    .templates-shelf-card {
      background: var(--card-container-bg);
      border-radius: var(--radius-xl);
      padding: 20px 16px;
      color: var(--text-main);
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .templates-category-title {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-sub);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .template-item-row {
      border-radius: var(--radius-lg);
      padding: 12px 16px;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      transition: transform 0.15s ease;
    }
    .template-item-row:hover {
      transform: translateY(-2px);
    }

    .template-btn-add {
      background: rgba(255, 255, 255, 0.3);
      border: none;
      color: #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .btn-create-custom {
      background: #1e293b;
      color: #ffffff;
      border: none;
      padding: 14px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .btn-create-custom:hover {
      background: #334155;
    }

    /* Theme Picker Buttons */
    .theme-picker-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 8px;
    }

    .theme-option-btn {
      padding: 10px 12px;
      border-radius: 12px;
      border: 2px solid var(--border-color);
      background: var(--card-subtle-bg);
      color: var(--text-main);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }
    
    .support-dev-card {
      background: linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(225, 29, 72, 0.04));
      border: 1px solid rgba(244, 63, 94, 0.25) !important;
    }

    .btn-support-dev {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      color: #ffffff !important;
      text-decoration: none !important;
      padding: 11px 16px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 3px 12px rgba(225, 29, 72, 0.25);
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
      width: 100%;
      box-sizing: border-box;
      cursor: pointer;
    }

    .btn-support-dev:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(225, 29, 72, 0.35);
      opacity: 0.95;
    }

    .goal-check-box.unlocked .goal-check-icon {
      color: #2563eb;
    }

    .goal-check-box:not(.unlocked) .goal-check-icon {
      opacity: 0.45;
      color: var(--text-sub);
    }

    .theme-option-btn.active {
      border-color: #3b82f6 !important;
      background: rgba(59, 130, 246, 0.15) !important;
      color: #3b82f6 !important;
    }
  </style>
</head>
<body class="theme-midnight" id="appBody">
  <div class="quitly-app-frame" id="appRoot">
    <!-- Rendered dynamically -->
  </div>

  <script>
    const INITIAL_DATA = ${safeDataJson};
    const PRESETS = ${presetsJson};
    const QUITLY_PRESETS = ${quitlyPresetsJson};
    const AMPLENOTE_PRESETS = ${amplenotePresetsJson};
    const THEMES = ${themesJson};

    const ICONS = {
      chevronLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="15 18 9 12 15 6"></polyline></svg>',
      chevronRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="9 18 15 12 9 6"></polyline></svg>',
      chevronDown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="6 9 12 15 18 9"></polyline></svg>',
      arrowLeft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
      close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
      checkCircle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.15"></circle><polyline points="16 9 10.5 15 8 12.5"></polyline></svg>',
      lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
      plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
      externalLink: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>'
    };

    let currentData = INITIAL_DATA;
    let currentView = "main"; // "main" | "detail" | "templates" | "settings"
    let selectedHabitId = null;
    let mainFilter = "all"; // "all" | "quit" | "positive"
    let templateFilter = "all"; // "all" | "quit" | "positive"
    let viewingYear = new Date().getFullYear();
    let viewingMonth = new Date().getMonth() + 1;

    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const savedView = window.sessionStorage.getItem("anp_hs_view");
        const savedHabitId = window.sessionStorage.getItem("anp_hs_habit_id");
        if (savedView) currentView = savedView;
        if (savedHabitId) selectedHabitId = savedHabitId;
      }
    } catch (e) {}

    // Verify selectedHabitId still exists if restoring view; otherwise return to main homescreen
    if (selectedHabitId && currentData && currentData.habits) {
      const exists = currentData.habits.some(h => h.id === selectedHabitId);
      if (!exists) {
        selectedHabitId = null;
        currentView = "main";
        try {
          if (typeof window !== "undefined" && window.sessionStorage) {
            window.sessionStorage.setItem("anp_hs_view", "main");
            window.sessionStorage.removeItem("anp_hs_habit_id");
          }
        } catch (e) {}
      }
    }

    let isCalendarEditMode = false;
    let editSkips = null;
    let editCompletions = null;
    let editModifiedCount = 0;
    let tickerUnit = "D"; // "D" | "M" | "Y"

    let activeTheme = (INITIAL_DATA && INITIAL_DATA.theme) ? INITIAL_DATA.theme : "midnight";
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = window.localStorage.getItem("habit_streak_theme");
        if (saved) activeTheme = saved;
      }
    } catch (e) {
      console.warn("[HabitStreak] Storage unavailable:", e);
    }

    document.documentElement.className = "theme-" + activeTheme;
    document.body.className = "theme-" + activeTheme;

    function applyTheme(themeName) {
      activeTheme = themeName;
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("habit_streak_theme", themeName);
        }
      } catch (e) {
        console.warn("[HabitStreak] Error saving theme:", e);
      }
      
      document.documentElement.className = "theme-" + themeName;
      document.body.className = "theme-" + themeName;
      callHost("setTheme", themeName);
      render();
    }

    function callHost(action, ...args) {
      if (window.callAmplenotePlugin) {
        window.callAmplenotePlugin(action, ...args);
      } else {
        console.log("[HabitStreak Host Call]", action, args);
      }
    }

    function deleteHabitFromDetail(habitId) {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem("anp_hs_view", "main");
          window.sessionStorage.removeItem("anp_hs_habit_id");
        }
      } catch (e) {}
      currentView = "main";
      selectedHabitId = null;
      callHost("deleteHabit", habitId);
    }

    function createHabitFromTemplate(templateIndex) {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem("anp_hs_view", "main");
          window.sessionStorage.removeItem("anp_hs_habit_id");
          window.sessionStorage.setItem("anp_hs_scroll", "0");
        }
      } catch (e) {}
      currentView = "main";
      selectedHabitId = null;
      callHost("createFromTemplate", templateIndex);
    }

    function createCustomHabit() {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem("anp_hs_view", "main");
          window.sessionStorage.removeItem("anp_hs_habit_id");
          window.sessionStorage.setItem("anp_hs_scroll", "0");
        }
      } catch (e) {}
      currentView = "main";
      selectedHabitId = null;
      callHost("createHabit");
    }

    function importTasksFromNote() {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem("anp_hs_view", "main");
          window.sessionStorage.removeItem("anp_hs_habit_id");
          window.sessionStorage.setItem("anp_hs_scroll", "0");
        }
      } catch (e) {}
      currentView = "main";
      selectedHabitId = null;
      callHost("importFromNote");
    }

    function switchView(view, habitId = null) {
      currentView = view;
      selectedHabitId = habitId;
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem("anp_hs_view", view);
          window.sessionStorage.setItem("anp_hs_habit_id", habitId || "");
          window.sessionStorage.setItem("anp_hs_scroll", "0");
        }
      } catch (e) {}
      isCalendarEditMode = false;
      editSkips = null;
      editCompletions = null;
      editModifiedCount = 0;
      viewingYear = new Date().getFullYear();
      viewingMonth = new Date().getMonth() + 1;
      try {
        window.scrollTo({ top: 0, behavior: "instant" });
      } catch (e) {}
      render();
    }

    function startCalendarEditMode() {
      const habits = currentData.habits || [];
      const activeHabit = habits.find(h => h.id === selectedHabitId) || habits[0] || null;
      if (!activeHabit) return;
      isCalendarEditMode = true;
      editSkips = [...(activeHabit.skips || [])];
      editCompletions = [...(activeHabit.completions || [])];
      editModifiedCount = 0;
      render();
    }

    function cancelCalendarEditMode() {
      isCalendarEditMode = false;
      editSkips = null;
      editCompletions = null;
      editModifiedCount = 0;
      render();
    }

    function saveCalendarEdits() {
      const habits = currentData.habits || [];
      const activeHabit = habits.find(h => h.id === selectedHabitId) || habits[0] || null;
      if (!activeHabit) return;

      // Preserve exact scroll position in storage before triggering host save
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem("anp_hs_scroll", String(window.scrollY || document.documentElement.scrollTop || 0));
        }
      } catch (e) {}

      if (editSkips && editCompletions) {
        activeHabit.skips = [...editSkips];
        activeHabit.completions = [...editCompletions];

        // Optimistically update habitStart if earlier dates were recorded
        const allRecorded = [...editCompletions, ...editSkips].filter(Boolean).sort();
        if (allRecorded.length > 0) {
          const earliest = allRecorded[0];
          const currentStart = activeHabit.createdAt ? activeHabit.createdAt.split("T")[0] : earliest;
          if (earliest < currentStart) {
            activeHabit.createdAt = earliest + "T00:00:00Z";
            activeHabit.streakAnchor = earliest + "T00:00:00Z";
          }
        }

        callHost("saveCalendarEdits", activeHabit.id, editSkips, editCompletions);
      }
      isCalendarEditMode = false;
      editSkips = null;
      editCompletions = null;
      editModifiedCount = 0;
      render();
    }

    function onDayDotClick(dateStr, currentStatus) {
      const habits = currentData.habits || [];
      const activeHabit = habits.find(h => h.id === selectedHabitId) || habits[0] || null;
      if (!activeHabit) return;

      const today = new Date();
      const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
      if (dateStr > todayStr) return; // Future days cannot be marked

      if (isCalendarEditMode) {
        if (!editSkips) editSkips = [...(activeHabit.skips || [])];
        if (!editCompletions) editCompletions = [...(activeHabit.completions || [])];

        if (currentStatus === "completed") {
          // Toggle to skipped
          editCompletions = editCompletions.filter(d => d !== dateStr);
          if (!editSkips.includes(dateStr)) editSkips.push(dateStr);
        } else {
          // Toggle to completed
          editSkips = editSkips.filter(d => d !== dateStr);
          if (!editCompletions.includes(dateStr)) editCompletions.push(dateStr);
        }
        editModifiedCount++;
        render();
      } else {
        const toggleTarget = (currentStatus === "completed") ? "completed" : "skipped";
        callHost('toggleDay', activeHabit.id, dateStr, toggleTarget);
      }
    }

    function markMonthAllDone() {
      const habits = currentData.habits || [];
      const activeHabit = habits.find(h => h.id === selectedHabitId) || habits[0] || null;
      if (!activeHabit || !isCalendarEditMode) return;
      if (!editSkips) editSkips = [...(activeHabit.skips || [])];
      if (!editCompletions) editCompletions = [...(activeHabit.completions || [])];

      const today = new Date();
      const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
      const totalDaysInMonth = new Date(viewingYear, viewingMonth, 0).getDate();

      for (let d = 1; d <= totalDaysInMonth; d++) {
        const dateStr = viewingYear + "-" + String(viewingMonth).padStart(2, "0") + "-" + String(d).padStart(2, "0");
        if (dateStr <= todayStr) {
          editSkips = editSkips.filter(x => x !== dateStr);
          if (!editCompletions.includes(dateStr)) editCompletions.push(dateStr);
        }
      }
      editModifiedCount++;
      render();
    }

    function markMonthAllSkipped() {
      const habits = currentData.habits || [];
      const activeHabit = habits.find(h => h.id === selectedHabitId) || habits[0] || null;
      if (!activeHabit || !isCalendarEditMode) return;
      if (!editSkips) editSkips = [...(activeHabit.skips || [])];
      if (!editCompletions) editCompletions = [...(activeHabit.completions || [])];

      const today = new Date();
      const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
      const totalDaysInMonth = new Date(viewingYear, viewingMonth, 0).getDate();

      for (let d = 1; d <= totalDaysInMonth; d++) {
        const dateStr = viewingYear + "-" + String(viewingMonth).padStart(2, "0") + "-" + String(d).padStart(2, "0");
        if (dateStr <= todayStr) {
          editCompletions = editCompletions.filter(x => x !== dateStr);
          if (!editSkips.includes(dateStr)) editSkips.push(dateStr);
        }
      }
      editModifiedCount++;
      render();
    }

    function formatTimeOnly(timestampStr) {
      if (!timestampStr) return "";
      try {
        const d = new Date(timestampStr);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      } catch (e) {
        return "";
      }
    }

    function formatDateOnly(dateOrTimestampStr) {
      if (!dateOrTimestampStr) return "";
      try {
        const d = new Date(dateOrTimestampStr);
        if (isNaN(d.getTime())) return dateOrTimestampStr;
        return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (e) {
        return dateOrTimestampStr;
      }
    }

    function setMainFilter(filter) {
      mainFilter = filter;
      render();
    }

    function setTemplateFilter(filter) {
      templateFilter = filter;
      render();
    }

    function setTickerUnit(unit) {
      tickerUnit = unit;
      render();
    }

    function getHabitGradientClass(habit, index) {
      if (habit && habit.colorTheme) {
        return "grad-" + habit.colorTheme;
      }
      const classes = ["grad-amber", "grad-rose", "grad-blue", "grad-emerald", "grad-purple", "grad-bronze", "grad-teal", "grad-indigo"];
      return classes[index % classes.length];
    }

    function getHabitEmoji(habit) {
      if (habit && habit.icon) return habit.icon;
      const emojiMatch = habit && habit.name ? habit.name.match(/^[\\p{Emoji}\\u200d]+/u) : null;
      if (emojiMatch) return emojiMatch[0];
      return (habit && habit.type === 'skip' ? '\u26A1' : '\u{1F4DD}');
    }

    function getHabitCleanName(habit) {
      if (!habit || !habit.name) return "";
      if (habit.icon) return habit.name;
      const emojiMatch = habit.name.match(/^[\\p{Emoji}\\u200d]+/u);
      return emojiMatch ? habit.name.replace(emojiMatch[0], '').trim() : habit.name;
    }

    function formatDurationQuitly(daysCount) {
      if (daysCount >= 365) {
        const yrs = Math.floor(daysCount / 365);
        const mths = Math.floor((daysCount % 365) / 30);
        return yrs + " yr" + (yrs > 1 ? "s" : "") + (mths > 0 ? ", " + mths + " mth" + (mths > 1 ? "s" : "") : "");
      }
      if (daysCount >= 30) {
        const mths = Math.floor(daysCount / 30);
        const remDays = daysCount % 30;
        return mths + " mth" + (mths > 1 ? "s" : "") + (remDays > 0 ? ", " + remDays + " day" + (remDays > 1 ? "s" : "") : "");
      }
      return daysCount + " day" + (daysCount !== 1 ? "s" : "") + ", 0 hrs";
    }

    function getClientIsScheduledDate(habit, dateStr, habitStart) {
      if (dateStr < habitStart) return false;
      const interval = (habit && habit.interval) ? habit.interval : { n: 1, period: "day" };
      const n = (interval.n && Number.isInteger(interval.n) && interval.n >= 1) ? interval.n : 1;
      const period = interval.period || "day";
      if (period === "day" && n === 1) return true;

      const startDate = new Date(habitStart + "T00:00:00");
      const targetDate = new Date(dateStr + "T00:00:00");
      if (isNaN(startDate.getTime()) || isNaN(targetDate.getTime())) return true;
      const diffInDays = Math.round((targetDate - startDate) / (1000 * 60 * 60 * 24));
      if (diffInDays < 0) return false;

      if (period === "day") {
        return diffInDays % n === 0;
      }
      if (period === "week") {
        const isSameWeekday = targetDate.getDay() === startDate.getDay();
        const diffInWeeks = Math.floor(diffInDays / 7);
        return isSameWeekday && (diffInWeeks % n === 0);
      }
      if (period === "month") {
        const sYear = startDate.getFullYear();
        const sMonth = startDate.getMonth();
        const sDay = startDate.getDate();
        const tYear = targetDate.getFullYear();
        const tMonth = targetDate.getMonth();
        const tDay = targetDate.getDate();
        const monthDiff = (tYear - sYear) * 12 + (tMonth - sMonth);
        if (monthDiff < 0 || monthDiff % n !== 0) return false;
        const lastDayInTargetMonth = new Date(tYear, tMonth + 1, 0).getDate();
        const expectedDay = Math.min(sDay, lastDayInTargetMonth);
        return tDay === expectedDay;
      }
      return true;
    }

    function getClientDayStatus(habit, dateStr, todayStr) {
      if (dateStr > todayStr) return "future";
      const skipsList = (isCalendarEditMode && editSkips) ? editSkips : (habit.skips || []);
      const completionsList = (isCalendarEditMode && editCompletions) ? editCompletions : (habit.completions || []);
      const skips = new Set(skipsList);
      const completions = new Set(completionsList);

      if (skips.has(dateStr)) return "skipped";
      if (completions.has(dateStr)) return "completed";

      const habitStart = habit.trackingStartDate || (habit.createdAt ? habit.createdAt.split("T")[0] : todayStr);
      if (dateStr < habitStart) return "before_start";

      const isScheduled = getClientIsScheduledDate(habit, dateStr, habitStart);
      if (!isScheduled) return "not_applicable";

      if (habit.type === 'complete') return "skipped";
      return "completed";
    }

    function getClientMonthCalendar(habit, year, month) {
      const today = new Date();
      const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
      const monthStart = new Date(year, month - 1, 1);
      const firstDayWeekday = monthStart.getDay();
      const totalDaysInMonth = new Date(year, month, 0).getDate();
      const monthName = monthStart.toLocaleString("default", { month: "long" });
      const days = [];

      for (let d = 1; d <= totalDaysInMonth; d++) {
        const dateStr = year + "-" + String(month).padStart(2, "0") + "-" + String(d).padStart(2, "0");
        const status = getClientDayStatus(habit, dateStr, todayStr);
        const isToday = dateStr === todayStr;
        days.push({ dayNumber: d, dateStr, status, isToday, weekday: (firstDayWeekday + d - 1) % 7 });
      }

      return { year, month, monthName, firstDayWeekday, totalDaysInMonth, days };
    }

    function getClientWeeklyFrequency(habit) {
      const events = habit.events || [];
      const daysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const weekCounts = [];
      let totalWeekLogs = 0;

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        const dayName = daysNames[d.getDay()];

        let count = 0;
        for (const ev of events) {
          if (ev.date === dateStr) count++;
        }

        if (count === 0) {
          if (habit.type === 'complete' && (habit.completions || []).includes(dateStr)) count = 1;
          else if (habit.type === 'skip' && (habit.skips || []).includes(dateStr)) count = 1;
        }

        totalWeekLogs += count;
        weekCounts.push({ dateStr, dayName, count, isToday: i === 0 });
      }

      const maxCount = Math.max(...weekCounts.map(w => w.count), 1);
      return { weekCounts, maxCount, totalWeekLogs };
    }

    function render() {
      let prevScroll = 0;
      try {
        prevScroll = window.scrollY || document.documentElement.scrollTop || 0;
      } catch (e) {}

      document.documentElement.className = "theme-" + activeTheme;
      document.body.className = "theme-" + activeTheme;

      const root = document.getElementById("appRoot");
      const habits = currentData.habits || [];
      const summary = currentData.summary || {};
      const activeHabit = habits.find(h => h.id === selectedHabitId) || habits[0] || null;

      // 1. SETTINGS VIEW
      if (currentView === "settings") {
        root.innerHTML = \`
          <div class="app-top-header">
            <button class="btn-header-round" title="Close Settings (Esc)" onclick="switchView('main')">\${ICONS.close}</button>
            <span class="header-title-text">Settings & Theming</span>
            <div style="width: 40px;"></div>
          </div>

          <div class="quitly-white-sheet">
            <div style="font-size: 16px; font-weight: 800; margin-bottom: 2px;">
              \u{1F3A8} Appearance & Themes
            </div>
            <p style="font-size: 12px; color: var(--text-sub); margin-bottom: 10px;">
              Choose your visual theme. Changes update in real-time.
            </p>

            <div class="theme-picker-grid">
              <button class="theme-option-btn \${activeTheme === 'midnight' ? 'active' : ''}" onclick="applyTheme('midnight')">
                \u{1F30C} Midnight (Default)
              </button>
              <button class="theme-option-btn \${activeTheme === 'glass' ? 'active' : ''}" onclick="applyTheme('glass')">
                \u{1F52E} Frosted Glass
              </button>
              <button class="theme-option-btn \${activeTheme === 'dark' ? 'active' : ''}" onclick="applyTheme('dark')">
                \u{1F319} Pure Dark
              </button>
              <button class="theme-option-btn \${activeTheme === 'light' ? 'active' : ''}" onclick="applyTheme('light')">
                \u2600\uFE0F Light Clean
              </button>
              <button class="theme-option-btn \${activeTheme === 'neon' ? 'active' : ''}" onclick="applyTheme('neon')" style="grid-column: span 2;">
                \u26A1 Cyberpunk Neon
              </button>
            </div>
            
            <div class="activity-section-card" style="margin-top: 12px;">
              <div style="font-weight: 800; font-size: 14px; margin-bottom: 6px;">\u{1F504} Sync Status</div>
              <p style="font-size: 12px; color: var(--text-sub); line-height: 1.4; margin-bottom: 12px;">
                Your streak logs are stored in the data note with tag <code>-reports/-habit-streak</code>.
              </p>
              <button class="btn-create-custom" style="padding: 10px; font-size: 13px;" onclick="callHost('refreshData')">
                \u{1F504} Force Refresh from Note
              </button>
            </div>

            <div class="activity-section-card">
              <div style="font-weight: 800; font-size: 14px; margin-bottom: 6px;">\u{1F4CA} Total Overview</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                <div style="background: var(--card-container-bg); padding: 8px; border-radius: 8px; border: 1px solid var(--border-color);">
                  <div style="font-size: 18px; font-weight: 800; color: #2563eb;">\${habits.length}</div>
                  <div style="color: var(--text-sub);">Total Counters</div>
                </div>
                <div style="background: var(--card-container-bg); padding: 8px; border-radius: 8px; border: 1px solid var(--border-color);">
                  <div style="font-size: 18px; font-weight: 800; color: #10b981;">\${summary.bestOverallStreak || 0}d</div>
                  <div style="color: var(--text-sub);">Best Record</div>
                </div>
              </div>
            </div>

            <!-- Support Developer Section -->
            <div class="activity-section-card support-dev-card" style="margin-top: 12px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 14px; color: #e11d48; margin-bottom: 6px;">
                <span style="font-size: 16px;">\u{1F496}</span>
                <span>Support the Developer</span>
              </div>
              <p style="font-size: 12px; color: var(--text-sub); line-height: 1.45; margin-bottom: 12px;">
                If Habit Streak helps you stay focused, maintain your streaks, and build positive daily momentum, consider supporting future development and new features!
              </p>
              <a href="https://krishnakanthb13.github.io/S/" target="_blank" rel="noopener noreferrer" class="btn-support-dev">
                <span>\u2615 Support Development</span>
                \${ICONS.externalLink}
              </a>
            </div>

            <button class="btn-quitly-action" style="width: 100%; justify-content: center; margin-top: 4px;" onclick="switchView('templates')">
              + Add from Templates Catalog
            </button>
          </div>
        \`;
        return;
      }

      // 2. TEMPLATES VIEW (Image 3) - Categorized into Quitly (Negative) and Amplenote (Positive)
      if (currentView === "templates") {
        const renderTemplateRows = (list) => list.map(p => {
          const globalIdx = PRESETS.findIndex(item => item.name === p.name);
          const grad = "grad-" + (p.colorTheme || "blue");
          return \`
            <div class="template-item-row \${grad}" onclick="createHabitFromTemplate(\${globalIdx >= 0 ? globalIdx : 0})">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">\${escapeHtml(p.icon)}</span>
                <div>
                  <div style="font-weight: 700; font-size: 14px;">\${escapeHtml(p.name)}</div>
                  <div style="font-size: 11px; opacity: 0.85;">\${escapeHtml(p.category)}</div>
                </div>
              </div>
              <button class="template-btn-add" title="Add Counter">\${ICONS.plus}</button>
            </div>
          \`;
        }).join("");

        let quitlyListHtml = renderTemplateRows(QUITLY_PRESETS);
        let amplenoteListHtml = renderTemplateRows(AMPLENOTE_PRESETS);

        root.innerHTML = \`
          <div class="app-top-header">
            <button class="btn-header-round" title="Back to Habits (Esc)" onclick="switchView('main')">\${ICONS.close}</button>
            <span class="header-title-text">New Counter</span>
            <div style="width: 40px;"></div>
          </div>

          <div class="filter-segment-bar">
            <button class="filter-tab-btn \${templateFilter === 'all' ? 'active' : ''}" onclick="setTemplateFilter('all')">All</button>
            <button class="filter-tab-btn \${templateFilter === 'quit' ? 'active' : ''}" onclick="setTemplateFilter('quit')">\u{1F6E1}\uFE0F Quitting</button>
            <button class="filter-tab-btn \${templateFilter === 'positive' ? 'active' : ''}" onclick="setTemplateFilter('positive')">\u{1F3AF} Positive Habits</button>
          </div>

          <div class="templates-shelf-card">
            <button class="btn-create-custom" onclick="createCustomHabit()">+ Create a Custom Counter</button>
            <button class="btn-quitly-action" style="width: 100%; justify-content: center; margin-top: 6px; margin-bottom: 4px;" onclick="importTasksFromNote()">
              \u{1F4E5} Import Tasks from Note
            </button>

            <details class="guide-accordion">
              <summary>
                <span style="display: flex; align-items: center; gap: 6px;">
                  <span>\u{1F4A1}</span> <span>How to Add & Track Habits</span>
                </span>
                <span style="display: flex; align-items: center; opacity: 0.75;">\${ICONS.chevronDown}</span>
              </summary>
              <div class="guide-accordion-body">
                <strong>1. Choose Source:</strong> Pick a preset template below, create a custom counter, or import tasks from any note.<br>
                <strong>2. Dual Tracking Philosophy:</strong><br>
                &nbsp;&nbsp;\u2022 <strong>\u{1F6E1}\uFE0F Quitting / Abstinence:</strong> Auto-tracked! Days count up continuously unless you log a slip.<br>
                &nbsp;&nbsp;\u2022 <strong>\u2728 Positive Practice:</strong> Requires daily intentional check-in to build your streak.<br>
                <strong>3. Interactive Tracking:</strong> Tap any calendar day to toggle status or log reflections on resets.
              </div>
            </details>

            \${(templateFilter === 'all' || templateFilter === 'quit') ? \`
              <div class="templates-category-title">
                <span>\u{1F6E1}\uFE0F Break Bad Habits & Sobriety (Quitly Style)</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${quitlyListHtml}
              </div>
            \` : ''}

            \${(templateFilter === 'all' || templateFilter === 'positive') ? \`
              <div class="templates-category-title" style="margin-top: 14px;">
                <span>\u{1F3AF} Build Positive Daily Habits (Amplenote Style)</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${amplenoteListHtml}
              </div>
            \` : ''}
          </div>
        \`;
        return;
      }

      // 3. MAIN COUNTERS LIST VIEW - Segmented into Quitting vs Positive
      if (currentView === "main" || !activeHabit) {
        const renderHabitCard = (h, idx) => {
          const grad = getHabitGradientClass(h, idx);
          const hcObj = summary.habitCards ? summary.habitCards.find(c => c.id === h.id) : null;
          const streak = hcObj ? hcObj.stats.currentStreak : 0;
          const durationStr = formatDurationQuitly(streak);
          const icon = getHabitEmoji(h);
          const cleanName = getHabitCleanName(h);
          const isQuit = h.type === 'skip';

          return \`
            <div class="counter-pill-card \${grad}" onclick="switchView('detail', '\${h.id}')">
              <div class="counter-card-left">
                <div class="counter-card-emoji-box">\${escapeHtml(icon)}</div>
                <div class="counter-card-info">
                  <div class="counter-card-time">\${durationStr}</div>
                  <div class="counter-card-name">\${escapeHtml(cleanName)}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 11px; background: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 12px; font-weight: 700;">
                  \${isQuit ? '\u{1F6E1}\uFE0F Auto-Done' : '\u{1F3AF} Check-In'}
                </span>
                <span class="counter-card-arrow">\${ICONS.chevronRight}</span>
              </div>
            </div>
          \`;
        };

        const quittingHabits = habits.filter(h => h.type === 'skip');
        const positiveHabits = habits.filter(h => h.type === 'complete');

        let displayCardsHtml = "";

        if (mainFilter === "quit") {
          displayCardsHtml = quittingHabits.map((h, i) => renderHabitCard(h, i)).join("");
        } else if (mainFilter === "positive") {
          displayCardsHtml = positiveHabits.map((h, i) => renderHabitCard(h, i)).join("");
        } else {
          // Grouped Sections for All
          if (quittingHabits.length > 0) {
            displayCardsHtml += \`
              <div class="section-category-header">
                <span>\u{1F6E1}\uFE0F Bad Habits to Break (Abstinence)</span>
                <span style="font-size: 11px; color: var(--text-sub);">\${quittingHabits.length}</span>
              </div>
              \${quittingHabits.map((h, i) => renderHabitCard(h, i)).join("")}
            \`;
          }

          if (positiveHabits.length > 0) {
            displayCardsHtml += \`
              <div class="section-category-header" style="margin-top: 10px;">
                <span>\u{1F3AF} Positive Habits to Build (Daily Practice)</span>
                <span style="font-size: 11px; color: var(--text-sub);">\${positiveHabits.length}</span>
              </div>
              \${positiveHabits.map((h, i) => renderHabitCard(h, i + quittingHabits.length)).join("")}
            \`;
          }
        }

        root.innerHTML = \`
          <div class="app-top-header">
            <button class="btn-header-round" title="Settings & Themes" onclick="switchView('settings')">\u2699\uFE0F</button>
            <span class="header-title-text">Habit Streaks</span>
            <button class="btn-header-round" title="Add Counter" onclick="switchView('templates')">\${ICONS.plus}</button>
          </div>

          <div class="filter-segment-bar">
            <button class="filter-tab-btn \${mainFilter === 'all' ? 'active' : ''}" onclick="setMainFilter('all')">
              All (\${habits.length})
            </button>
            <button class="filter-tab-btn \${mainFilter === 'quit' ? 'active' : ''}" onclick="setMainFilter('quit')">
              \u{1F6E1}\uFE0F Quitting (\${quittingHabits.length})
            </button>
            <button class="filter-tab-btn \${mainFilter === 'positive' ? 'active' : ''}" onclick="setMainFilter('positive')">
              \u{1F3AF} Positive (\${positiveHabits.length})
            </button>
          </div>

          <div class="quitly-white-sheet">
            \${habits.length > 0 ? displayCardsHtml : \`
              <div style="text-align: center; padding: 36px 18px;">
                <div style="font-size: 44px; margin-bottom: 12px;">\u{1F331}</div>
                <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 6px;">No counters yet</h3>
                <p style="font-size: 13px; color: var(--text-sub); margin-bottom: 20px; line-height: 1.45; max-width: 320px; margin-left: auto; margin-right: auto;">
                  Track sobriety/quitting goals automatically or build daily positive practices with real-time sub-second tickers & interactive calendars.
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px; max-width: 280px; margin: 0 auto;">
                  <button class="btn-create-custom" onclick="switchView('templates')">+ Choose a Template</button>
                  <button class="btn-quitly-action" style="justify-content: center;" onclick="callHost('importFromNote')">\u{1F4E5} Import Tasks from Note</button>
                </div>
              </div>
            \`}
          </div>
        \`;
        return;
      }

      // 4. SINGLE COUNTER DETAILED VIEW
      const hcObj = summary.habitCards ? summary.habitCards.find(c => c.id === activeHabit.id) : null;
      const stats = hcObj ? hcObj.stats : (currentData.stats || {});
      const tiers = currentData.tiers || [];
      const calendar = getClientMonthCalendar(activeHabit, viewingYear, viewingMonth);
      const weeklyFreq = getClientWeeklyFrequency(activeHabit);
      const activeTier = tiers.find(t => t.isCurrentGoal) || tiers[0];
      const habitIdx = habits.findIndex(h => h.id === activeHabit.id);
      const grad = getHabitGradientClass(activeHabit, habitIdx >= 0 ? habitIdx : 0);
      const icon = getHabitEmoji(activeHabit);
      const cleanName = getHabitCleanName(activeHabit);

      const today = new Date();
      const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
      const isQuitly = activeHabit.type === 'skip';
      const isCompletedToday = stats.statusToday === "completed";
      const isSlipToday = (activeHabit.skips || []).includes(todayStr);

      const todaySlipsCount = (activeHabit.events || []).filter(e => e.type === 'skip' && (e.date === todayStr || (e.timestamp && e.timestamp.split('T')[0] === todayStr))).length;
      const todayDoneCount = (activeHabit.events || []).filter(e => e.type === 'done' && (e.date === todayStr || (e.timestamp && e.timestamp.split('T')[0] === todayStr))).length;

      // Contextual Action Buttons & Phrasing
      let actionsClusterHtml = "";
      let statusBadgeHtml = "";
      let philosophyFooterHtml = "";

      if (isQuitly) {
        // Quitly / Bad Habit / Abstinence
        if (isSlipToday) {
          statusBadgeHtml = \`
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
              \u{1F6A8} \${todaySlipsCount > 1 ? todaySlipsCount + ' Slips Logged Today' : 'Slip / Reset Logged Today'}
            </div>
          \`;

          actionsClusterHtml = \`
            <div class="action-pills-cluster">
              <button class="btn-quitly-action btn-skip-danger" onclick="callHost('skipToday', '\${activeHabit.id}')" title="Log additional slip for today">
                \u{1F6A8} Log Additional Slip (+1)
              </button>
              <button class="btn-quitly-action btn-done-success" onclick="callHost('undoToday', '\${activeHabit.id}')">
                \u21A9\uFE0F Undo Slip / Mark Clean Today
              </button>
              <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
                \u{1F504} Backdate Relapse Date with Note
              </button>
            </div>
          \`;
        } else {
          statusBadgeHtml = \`
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
              \u{1F6E1}\uFE0F Clean Today (Auto-Tracked)
            </div>
          \`;

          actionsClusterHtml = \`
            <div class="action-pills-cluster">
              <button class="btn-quitly-action btn-skip-danger" onclick="callHost('skipToday', '\${activeHabit.id}')">
                \u{1F6A8} Log Slip / Reset Today
              </button>
              <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
                \u{1F504} Backdate Relapse Date with Note
              </button>
            </div>
          \`;
        }

        philosophyFooterHtml = \`
          <div class="activity-section-card" style="margin-top: 12px; background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.25);">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px; color: #10b981; margin-bottom: 4px;">
              <span>\u{1F6E1}\uFE0F Quitly Abstinence Philosophy (Quitting a Bad Habit)</span>
            </div>
            <p style="font-size: 12px; color: var(--text-sub); line-height: 1.4;">
              This is a quitting counter. Days count up automatically as long as you stay clean. You can log single or multiple slips with reflection notes, backdate past relapses, or undo accidental slips.
            </p>
          </div>
        \`;
      } else {
        // Amplenote / Positive Action Habit
        statusBadgeHtml = isCompletedToday ? \`
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
            \u2705 \${todayDoneCount > 1 ? todayDoneCount + ' Sessions Completed Today!' : 'Completed for Today!'}
          </div>
        \` : \`
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); color: #6366f1; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
            \u23F3 Today Pending Check-In
          </div>
        \`;

        actionsClusterHtml = isCompletedToday ? \`
          <div class="action-pills-cluster">
            <button class="btn-quitly-action btn-done-success" onclick="callHost('completeToday', '\${activeHabit.id}')" title="Log additional session with note">
              + Log Additional Done (+1)
            </button>
            <button class="btn-quitly-action" onclick="callHost('undoToday', '\${activeHabit.id}')">
              \u21A9\uFE0F Undo / Mark Not Done
            </button>
            <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
              \u{1F504} Backfill Dates with Note
            </button>
          </div>
        \` : \`
          <div class="action-pills-cluster">
            <button class="btn-quitly-action btn-done-success" onclick="callHost('completeToday', '\${activeHabit.id}')">
              \u2705 Mark Done Today
            </button>
            <button class="btn-quitly-action btn-skip-danger" onclick="callHost('skipToday', '\${activeHabit.id}')">
              \u{1F6AB} Log Missed / Skip Today
            </button>
            <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
              \u{1F504} Backfill Dates with Note
            </button>
          </div>
        \`;

        philosophyFooterHtml = \`
          <div class="activity-section-card" style="margin-top: 12px; background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.25);">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px; color: #6366f1; margin-bottom: 4px;">
              <span>\u{1F3AF} Amplenote Intentional Action Philosophy (Positive Habit)</span>
            </div>
            <p style="font-size: 12px; color: var(--text-sub); line-height: 1.4;">
              This is a positive action habit. Your streak grows by intentionally completing and checking in each day. Tap <strong>"Mark Done Today"</strong> or <strong>"+ Log Additional Done (+1)"</strong> to log sessions with reflection notes.
            </p>
          </div>
        \`;
      }

      // 3-Column Goals Checklist Grid
      let goalsHtml = tiers.map(t => {
        const isUnlocked = t.isUnlocked;
        return \`
          <div class="goal-check-box \${isUnlocked ? 'unlocked' : ''}">
            <span class="goal-check-icon">\${isUnlocked ? '\u2611' : '\u{1F512}'}</span>
            <div class="goal-label-wrap">
              <span class="goal-days-text">\${t.label}</span>
              <span class="goal-tier-text">Tier \${t.tierNum || t.days}</span>
            </div>
          </div>
        \`;
      }).join("");

      // Calendar mini-dots
      let emptyDots = Array(calendar.firstDayWeekday).fill('<div class="day-mini-dot empty"></div>').join("");
      let monthDoneCount = 0;
      let monthSkipCount = 0;

      let dayDots = calendar.days.map(d => {
        let cls = (d.status === 'completed') ? 'done' : ((d.status === 'skipped') ? 'skip' : (d.status === 'before_start' ? 'before-start' : (d.status === 'not_applicable' ? 'off-day' : (d.status === 'future' ? 'future' : ''))));
        if (d.status === 'completed') monthDoneCount++;
        if (d.status === 'skipped') monthSkipCount++;
        if (d.isToday) cls += ' is-today';
        if (isCalendarEditMode && d.status !== 'future') cls += ' editing';

        let isClickable = (d.status !== 'future');
        let clickAttr = isClickable 
          ? \`onclick="onDayDotClick('\${d.dateStr}', '\${d.status}')"\` 
          : "";
        let titleTip = \`\${d.dateStr}: \${d.status === 'completed' ? 'Done / Clean' : (d.status === 'skipped' ? 'Missed / Reset' : (d.status === 'not_applicable' ? 'Off-Day (Not Scheduled)' : (d.status === 'before_start' ? 'Before Start' : 'Future')))}\`;
        return \`<div class="day-mini-dot \${cls}" \${clickAttr} title="\${titleTip}">\${d.dayNumber}</div>\`;
      }).join("");

      // Build unified timeline of events and reset logs
      const timelineEntries = [];
      (activeHabit.events || []).forEach(ev => {
        timelineEntries.push({
          type: ev.type === "done" ? "done" : "slip",
          date: ev.date || (ev.timestamp ? ev.timestamp.split("T")[0] : ""),
          timestamp: ev.timestamp || null,
          note: ev.note || (ev.type === "done" ? "Daily check-in completed" : "Slip logged"),
          streakLength: ev.streakLength
        });
      });
      (activeHabit.resetLogs || []).forEach(rl => {
        if (!timelineEntries.some(item => item.timestamp && item.timestamp === rl.timestamp)) {
          timelineEntries.push({
            type: "reset",
            date: rl.date || (rl.timestamp ? rl.timestamp.split("T")[0] : ""),
            timestamp: rl.timestamp || null,
            note: rl.note || "Reset logged",
            streakLength: rl.streakLength
          });
        }
      });
      timelineEntries.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.date).getTime();
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(b.date).getTime();
        return timeB - timeA;
      });

      // Weekly frequency bars
      let weeklyBarsHtml = weeklyFreq.weekCounts.map(w => {
        const heightPct = Math.max(10, Math.round((w.count / weeklyFreq.maxCount) * 100));
        return \`
          <div class="weekly-bar-col \${w.isToday ? 'today' : ''}">
            <span class="weekly-count-lbl">\${w.count > 0 ? w.count : ''}</span>
            <div class="weekly-bar-fill" style="height: \${w.count > 0 ? heightPct + '%' : '6px'}; opacity: \${w.count > 0 ? 1 : 0.25};"></div>
            <span class="weekly-day-lbl">\${w.dayName}</span>
          </div>
        \`;
      }).join("");

      root.innerHTML = \`
        <!-- Hero Header -->
        <div class="single-counter-hero \${grad}">
          <div class="single-hero-nav">
            <button class="btn-header-round" title="Back to Habits (Esc / Backspace)" onclick="switchView('main')">\${ICONS.arrowLeft}</button>
            <div style="display: flex; gap: 8px;">
              <button class="btn-header-round" title="Edit Settings" onclick="callHost('editHabit', '\${activeHabit.id}')">\u270F\uFE0F</button>
              <button class="btn-header-round" title="Delete Counter" onclick="deleteHabitFromDetail('\${activeHabit.id}')">\u{1F5D1}\uFE0F</button>
            </div>
          </div>

          <div class="hero-habit-badge">
            <span style="font-size: 22px;">\${escapeHtml(icon)}</span>
            <span class="hero-habit-title">\${escapeHtml(cleanName)}</span>
          </div>

          <div style="font-size: 11px; opacity: 0.9; margin-top: 2px; margin-bottom: 6px; background: rgba(255,255,255,0.18); display: inline-block; padding: 2px 10px; border-radius: 12px; font-weight: 700; letter-spacing: 0.2px;">
            \u{1F4C5} Every \${activeHabit.interval?.n || 1} \${activeHabit.interval?.period || 'day'}\${(activeHabit.interval?.n || 1) > 1 ? 's' : ''}
          </div>

          <div class="hero-its-been">\${isQuitly ? "Clean & sober for" : "Continuous unbroken streak"}</div>

          <!-- 4-Column Digital Ticker -->
          <div class="digital-ticker-row">
            <div class="ticker-col">
              <div class="ticker-num">\${
                tickerUnit === "Y" 
                  ? (stats.currentStreak ? (stats.currentStreak / 365.25).toFixed(2) : "0.00") 
                  : (tickerUnit === "M" 
                      ? (stats.currentStreak ? (stats.currentStreak / 30.4375).toFixed(1) : "0.0") 
                      : (stats.currentStreak || 0))
              }</div>
              <div class="ticker-lbl">\${tickerUnit === "Y" ? "years" : (tickerUnit === "M" ? "months" : "days")}</div>
            </div>
            <div class="ticker-col">
              <div class="ticker-num" id="tickHours">00</div>
              <div class="ticker-lbl">hours</div>
            </div>
            <div class="ticker-col">
              <div class="ticker-num" id="tickMins">00</div>
              <div class="ticker-lbl">minutes</div>
            </div>
            <div class="ticker-col">
              <div class="ticker-num" id="tickSecs">00</div>
              <div class="ticker-lbl">seconds</div>
            </div>
          </div>

          <!-- Unit Toggles -->
          <div class="unit-pills-row">
            <button class="unit-pill \${tickerUnit === 'Y' ? 'active' : ''}" onclick="setTickerUnit('Y')">Y</button>
            <button class="unit-pill \${tickerUnit === 'M' ? 'active' : ''}" onclick="setTickerUnit('M')">M</button>
            <button class="unit-pill \${tickerUnit === 'D' ? 'active' : ''}" onclick="setTickerUnit('D')">D</button>
          </div>
        </div>

        <!-- Sheet Below with Tier Laurel, Goals Grid, Actions, Calendar -->
        <div class="quitly-white-sheet">
          <div style="text-align: center;">
            \${statusBadgeHtml}
          </div>

          <!-- Tier Laurel Header -->
          <div class="tier-laurel-card">
            <div class="laurel-title">
              <span>\u{1F33F}</span>
              <span>Tier \${activeTier ? activeTier.tierNum : 1}</span>
              <span>\u{1F33F}</span>
            </div>
            <div class="laurel-subtitle">\${activeTier ? activeTier.days : 1} days</div>

            <div class="progress-header-line">
              <span>\${activeTier ? activeTier.progressPercent : 0}% completed</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill-blue" style="width: \${activeTier ? activeTier.progressPercent : 0}%;"></div>
            </div>
            <div class="progress-time-left">
              \${activeTier ? activeTier.daysRemaining : 0} days left
            </div>
          </div>

          <!-- Action Buttons (Context-Aware) -->
          \${actionsClusterHtml}

          <!-- 3-Column Goals Checklist Grid -->
          <div>
            <div class="goals-section-title">All Goals</div>
            <div class="goals-3col-grid">
              \${goalsHtml}
            </div>
          </div>

          <!-- Weekly Repeatingness Frequency Bar Chart -->
          <div class="activity-section-card">
            <div class="activity-header">
              <span style="font-size: 14px; font-weight: 800;">\u{1F4CA} 7-Day Activity & Logs</span>
              <span style="font-size: 12px; font-weight: 700; color: #2563eb;">\${weeklyFreq.totalWeekLogs} logs \xB7 \${weeklyFreq.completedDaysInWeek || 0} active days</span>
            </div>
            <div class="weekly-bars-container">
              \${weeklyBarsHtml}
            </div>
          </div>

          <!-- Yearly / Monthly Activity Log -->
          <div class="activity-section-card">
            <div class="activity-header">
              <span style="font-size: 14px; font-weight: 800;">\u{1F4C5} \${calendar.monthName} \${calendar.year}</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                \${!isCalendarEditMode ? \`
                  <button class="btn-cal-action" onclick="startCalendarEditMode()">\u270F\uFE0F Edit Calendar</button>
                \` : \`
                  <button class="btn-cal-action btn-cal-save" onclick="saveCalendarEdits()">\u{1F4BE} Save (\${editModifiedCount})</button>
                  <button class="btn-cal-action btn-cal-cancel" onclick="cancelCalendarEditMode()">\${ICONS.close} Cancel</button>
                \`}
                <div style="display: flex; gap: 2px; margin-left: 2px;">
                  <button class="btn-header-round btn-month-nav" title="Previous Month (\u2190 / <)" style="width: 28px; height: 28px; background: rgba(0,0,0,0.08); color: var(--text-main);" onclick="changeMonth(-1)">\${ICONS.chevronLeft}</button>
                  <button class="btn-header-round btn-month-nav" title="Next Month (\u2192 / >)" style="width: 28px; height: 28px; background: rgba(0,0,0,0.08); color: var(--text-main);" onclick="changeMonth(1)">\${ICONS.chevronRight}</button>
                </div>
              </div>
            </div>

            \${isCalendarEditMode ? \`
              <div class="cal-edit-active-banner">
                <span>\u270F\uFE0F <strong>Edit Mode:</strong> Tap any day to toggle (Green \u2194 Red)</span>
                <span style="background: rgba(37,99,235,0.15); padding: 2px 8px; border-radius: 12px; font-weight: 800;">\${editModifiedCount} change(s) staged</span>
              </div>
              <div class="cal-quick-actions-row">
                <button class="btn-cal-quick" onclick="markMonthAllDone()">\u2705 Mark Month Clean</button>
                <button class="btn-cal-quick" onclick="markMonthAllSkipped()">\u{1F6AB} Mark Month Missed</button>
                <button class="btn-cal-quick" onclick="cancelCalendarEditMode()">\${ICONS.close} Discard</button>
              </div>
            \` : ''}

            <!-- Weekday Column Headers -->
            <div class="cal-weekdays-row">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            <div class="cal-grid-mini">
              \${emptyDots}
              \${dayDots}
            </div>

            <div class="resets-counter-bar">
              <div style="display: flex; gap: 12px; align-items: center;">
                <span>\u{1F7E2} <strong>\${monthDoneCount}</strong> Done</span>
                <span>\u{1F534} <strong>\${monthSkipCount}</strong> Missed</span>
              </div>
              <div style="font-size: 11.5px; color: var(--text-sub);">
                \${stats.skippedDays || 0} total resets
              </div>
            </div>
          </div>

          <!-- Reset & Activity History Log with Timestamps -->
          <div class="activity-section-card" style="margin-top: 12px;">
            <div class="activity-header">
              <span style="font-size: 14px; font-weight: 800;">\u{1F4DD} Activity & Timestamped History</span>
              <span style="font-size: 12px; font-weight: 700; color: var(--text-sub);">\${timelineEntries.length} entries</span>
            </div>
            \${(timelineEntries && timelineEntries.length > 0) ? \`
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${timelineEntries.map((log, idx) => {
                  const isDone = log.type === 'done';
                  const timeLabel = formatTimeOnly(log.timestamp);
                  const dateLabel = formatDateOnly(log.date || log.timestamp);
                  const badgeIcon = isDone ? '\u2705' : '\u{1F6A8}';
                  const badgeColor = isDone ? '#15803d' : '#be123c';
                  const badgeBg = isDone ? '#dcfce7' : '#ffe4e6';
                  const headline = isDone 
                    ? \`Check-in #\${timelineEntries.length - idx}\` 
                    : (log.streakLength ? \`\${log.streakLength} days streak before reset\` : 'Slip / Reset');
                  return \`
                    <div style="background: var(--card-container-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 12px; font-size: 12px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: var(--text-main); margin-bottom: 3px;">
                        <span style="display: flex; align-items: center; gap: 6px;">
                          <span style="background: \${badgeBg}; color: \${badgeColor}; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
                            \${badgeIcon} \${headline}
                          </span>
                        </span>
                        <div style="font-size: 11px; color: var(--text-sub); display: flex; align-items: center; gap: 4px;">
                          <span>\${dateLabel}</span>
                          \${timeLabel ? \`<span style="font-weight: 800; color: #2563eb;">\u2022 \${timeLabel}</span>\` : ''}
                        </div>
                      </div>
                      <div style="color: var(--text-sub); font-style: italic; margin-top: 2px;">"\${escapeHtml(log.note)}"</div>
                    </div>
                  \`;
                }).join("")}
              </div>
            \` : \`
              <div style="font-size: 12px; color: var(--text-sub); text-align: center; padding: 8px 0;">
                No check-in or reset logs recorded yet. Tap check-in or log your first entry!
              </div>
            \`}
          </div>

          <!-- Philosophy Explainer Footer -->
          \${philosophyFooterHtml}
        </div>
      \`;

      startLiveTicker();

      // Restore scroll position smoothly after DOM update
      try {
        const savedScroll = (typeof window !== "undefined" && window.sessionStorage) ? window.sessionStorage.getItem("anp_hs_scroll") : null;
        const targetScroll = prevScroll || (savedScroll ? parseInt(savedScroll, 10) : 0);
        if (targetScroll > 0) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: targetScroll, behavior: "instant" });
          });
        }
      } catch (e) {}
    }

    window.addEventListener("scroll", () => {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem("anp_hs_scroll", String(window.scrollY || document.documentElement.scrollTop || 0));
        }
      } catch (e) {}
    }, { passive: true });

    
    // Global keyboard navigation listener
    window.addEventListener("keydown", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable)) return;

      if (e.key === "Escape") {
        if (isCalendarEditMode) {
          cancelCalendarEditMode();
        } else if (currentView !== "main") {
          switchView("main");
        }
      } else if (currentView === "templates" || currentView === "settings") {
        if (e.key === "Backspace") {
          switchView("main");
        }
      } else if (currentView === "detail") {
        if (e.key === "ArrowLeft" || e.key === "<" || e.key === ",") {
          changeMonth(-1);
        } else if (e.key === "ArrowRight" || e.key === ">" || e.key === ".") {
          changeMonth(1);
        } else if (e.key === "Backspace" && !isCalendarEditMode) {
          switchView("main");
        }
      }
    });

    function escapeHtml(str) {
      if (!str) return "";
      return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag]));
    }

    function changeMonth(delta) {
      viewingMonth += delta;
      if (viewingMonth > 12) {
        viewingMonth = 1;
        viewingYear++;
      } else if (viewingMonth < 1) {
        viewingMonth = 12;
        viewingYear--;
      }
      render();
    }

    let tickerInterval = null;

    function startLiveTicker() {
      if (tickerInterval) clearInterval(tickerInterval);

      const stats = currentData.stats || {};
      const anchor = stats.streakAnchorTimestamp;

      function update() {
        const hoursEl = document.getElementById("tickHours");
        const minsEl = document.getElementById("tickMins");
        const secsEl = document.getElementById("tickSecs");

        if (!hoursEl || !minsEl || !secsEl) return;

        if (!anchor || stats.currentStreak <= 0) {
          hoursEl.textContent = "00";
          minsEl.textContent = "00";
          secsEl.textContent = "00";
          return;
        }

        const now = Date.now();
        const diffSeconds = Math.max(0, Math.floor((now - anchor) / 1000));

        const hours = Math.floor((diffSeconds % 86400) / 3600);
        const mins = Math.floor((diffSeconds % 3600) / 60);
        const secs = diffSeconds % 60;

        hoursEl.textContent = String(hours).padStart(2, "0");
        minsEl.textContent = String(mins).padStart(2, "0");
        secsEl.textContent = String(secs).padStart(2, "0");
      }

      update();
      tickerInterval = setInterval(update, 1000);
    }

    // Initial Render
    render();
  </script>
</body>
</html>
  `.trim();
}

// anp-22-habit-streak/lib/features/launcher.js
async function launchHabitDashboard(app) {
  try {
    const lastChoice = app.settings?.["Last Embed View"] ?? "fullscreen";
    const choiceResult = await app.prompt("Choose Habit Streaks Launch Target:", {
      inputs: [
        {
          label: "Launch Target",
          type: "select",
          options: [
            { label: "Fullscreen Tab (Dedicated Workspace)", value: "fullscreen" },
            { label: "Peek Viewer (Sidebar)", value: "sidebar" }
          ],
          value: lastChoice
        }
      ]
    });
    if (!choiceResult) return;
    const target = Array.isArray(choiceResult) ? choiceResult[0] : choiceResult;
    if (typeof app.setSetting === "function") {
      await app.setSetting("Last Embed View", target);
    }
    if (target === "fullscreen") {
      await app.openEmbed();
      if (app.context?.pluginUUID) {
        try {
          await app.navigate("https://www.amplenote.com/notes/plugins/" + app.context.pluginUUID);
        } catch (navErr) {
          console.warn("[HabitStreak] Navigation:", navErr);
        }
      }
    } else {
      await app.openSidebarEmbed(1);
    }
  } catch (error) {
    console.error("[HabitStreak] Error in launchHabitDashboard:", error);
    await app.alert(`An error occurred while opening dashboard: ${error.message}`);
  }
}

// anp-22-habit-streak/lib/features/createHabit.js
async function handleCreateHabit(app) {
  try {
    const result = await app.prompt("Create New Counter", {
      inputs: [
        {
          type: "string",
          label: "Emoji Icon (Paste or type any emoji: \u{1F525}, \u{1F3C3}, \u{1F377}, \u{1F4DA}...)",
          placeholder: "\u{1F525}",
          value: "\u{1F525}"
        },
        {
          type: "string",
          label: "Habit / Counter Name",
          placeholder: "e.g., Daily Meditation, No Sugar..."
        },
        {
          type: "select",
          label: "Color Theme",
          options: [
            { label: "Amber (Orange/Gold)", value: "amber" },
            { label: "Rose (Pink/Red)", value: "rose" },
            { label: "Sky Blue", value: "blue" },
            { label: "Emerald (Green)", value: "emerald" },
            { label: "Purple (Violet)", value: "purple" },
            { label: "Bronze (Warm Brown)", value: "bronze" },
            { label: "Teal (Cyan)", value: "teal" },
            { label: "Indigo", value: "indigo" }
          ],
          value: "blue"
        },
        {
          type: "select",
          label: "Tracking Philosophy",
          options: [
            { label: "\u26A1 Quitly Style: Auto-Done (Considered done unless skipped)", value: TRACK_TYPES.SKIP },
            { label: "\u{1F4DD} Amplenote Style: Manual Log (Considered done only when marked)", value: TRACK_TYPES.COMPLETE }
          ],
          value: TRACK_TYPES.SKIP
        },
        {
          type: "string",
          label: "Every (Number)",
          placeholder: "1",
          value: "1"
        },
        {
          type: "select",
          label: "Period",
          options: [
            { label: "Day(s)", value: INTERVAL_PERIODS.DAY },
            { label: "Week(s)", value: INTERVAL_PERIODS.WEEK },
            { label: "Month(s)", value: INTERVAL_PERIODS.MONTH }
          ],
          value: INTERVAL_PERIODS.DAY
        }
      ]
    });
    if (!result || !Array.isArray(result)) {
      return;
    }
    const [iconVal, nameVal, themeVal, typeVal, periodNVal, periodUnitVal] = result;
    if (!nameVal || !String(nameVal).trim()) {
      await app.alert("Habit name cannot be empty.");
      return;
    }
    const habitName = String(nameVal).trim();
    const habitIcon = iconVal && String(iconVal).trim() ? String(iconVal).trim() : "\u{1F525}";
    const colorTheme = themeVal && COLOR_THEMES[themeVal] ? themeVal : "blue";
    const habitType = typeVal === TRACK_TYPES.COMPLETE || typeVal === TRACK_TYPES.SKIP ? typeVal : TRACK_TYPES.SKIP;
    const parsedN = parseInt(periodNVal, 10);
    const periodN = !isNaN(parsedN) && parsedN >= 1 && parsedN <= 365 ? parsedN : 1;
    const periodUnit = [INTERVAL_PERIODS.DAY, INTERVAL_PERIODS.WEEK, INTERVAL_PERIODS.MONTH].includes(periodUnitVal) ? periodUnitVal : INTERVAL_PERIODS.DAY;
    const nowISO = (/* @__PURE__ */ new Date()).toISOString();
    const todayStr = getTodayString();
    const newHabit = {
      id: generateUniqueId("habit"),
      name: habitName,
      icon: habitIcon,
      colorTheme,
      type: habitType,
      interval: {
        n: periodN,
        period: periodUnit
      },
      createdAt: nowISO,
      trackingStartDate: todayStr,
      streakAnchor: nowISO,
      streakStartedAt: nowISO,
      skips: [],
      completions: habitType === TRACK_TYPES.COMPLETE ? [todayStr] : [],
      events: [],
      resetLogs: []
    };
    await mutateState(app, async (state) => {
      state.habits = state.habits || [];
      state.habits.push(newHabit);
      state.activeHabitId = newHabit.id;
    });
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleCreateHabit:", err);
    await app.alert(`Failed to create habit: ${err.message || err}`);
  }
}
async function handleCreateFromTemplate(app, templateIndex) {
  try {
    const template = PRESET_TEMPLATES[templateIndex];
    if (!template) return;
    const nowISO = (/* @__PURE__ */ new Date()).toISOString();
    const todayStr = getTodayString();
    const newHabit = {
      id: generateUniqueId("habit"),
      name: template.name,
      icon: template.icon || "\u{1F525}",
      type: template.type || TRACK_TYPES.SKIP,
      colorTheme: template.colorTheme || "blue",
      interval: {
        n: 1,
        period: INTERVAL_PERIODS.DAY
      },
      createdAt: nowISO,
      trackingStartDate: todayStr,
      streakAnchor: nowISO,
      streakStartedAt: nowISO,
      skips: [],
      completions: template.type === TRACK_TYPES.COMPLETE ? [todayStr] : [],
      events: [],
      resetLogs: []
    };
    await mutateState(app, async (state) => {
      state.habits = state.habits || [];
      state.habits.push(newHabit);
      state.activeHabitId = newHabit.id;
    });
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleCreateFromTemplate:", err);
    await app.alert(`Failed to create habit from template: ${err.message || err}`);
  }
}

// anp-22-habit-streak/lib/features/editHabit.js
async function handleEditHabit(app, habitId) {
  if (!habitId) return;
  try {
    const state = await loadState(app);
    const habitToEdit = (state.habits || []).find((h) => h.id === habitId);
    if (!habitToEdit) {
      await app.alert("Habit not found.");
      return;
    }
    const currentIcon = habitToEdit.icon || "\u{1F525}";
    const currentTheme = habitToEdit.colorTheme || "blue";
    const currentIntervalN = habitToEdit.interval && habitToEdit.interval.n ? String(habitToEdit.interval.n) : "1";
    const currentIntervalPeriod = habitToEdit.interval && habitToEdit.interval.period ? habitToEdit.interval.period : INTERVAL_PERIODS.DAY;
    const currentType = habitToEdit.type || TRACK_TYPES.SKIP;
    const result = await app.prompt(`Edit Counter: ${habitToEdit.name}`, {
      inputs: [
        {
          type: "string",
          label: "Emoji Icon (Paste or type any emoji: \u{1F525}, \u{1F3C3}, \u{1F377}, \u{1F4DA}...)",
          value: currentIcon
        },
        {
          type: "string",
          label: "Habit / Counter Name",
          value: habitToEdit.name
        },
        {
          type: "select",
          label: "Color Theme",
          options: [
            { label: "Amber (Orange/Gold)", value: "amber" },
            { label: "Rose (Pink/Red)", value: "rose" },
            { label: "Sky Blue", value: "blue" },
            { label: "Emerald (Green)", value: "emerald" },
            { label: "Purple (Violet)", value: "purple" },
            { label: "Bronze (Warm Brown)", value: "bronze" },
            { label: "Teal (Cyan)", value: "teal" },
            { label: "Indigo", value: "indigo" }
          ],
          value: currentTheme
        },
        {
          type: "select",
          label: "Tracking Philosophy",
          options: [
            { label: "\u26A1 Quitly Style: Auto-Done (Considered done unless skipped)", value: TRACK_TYPES.SKIP },
            { label: "\u{1F4DD} Amplenote Style: Manual Log (Considered done only when marked)", value: TRACK_TYPES.COMPLETE }
          ],
          value: currentType
        },
        {
          type: "string",
          label: "Every (Number)",
          value: currentIntervalN
        },
        {
          type: "select",
          label: "Period",
          options: [
            { label: "Day(s)", value: INTERVAL_PERIODS.DAY },
            { label: "Week(s)", value: INTERVAL_PERIODS.WEEK },
            { label: "Month(s)", value: INTERVAL_PERIODS.MONTH }
          ],
          value: currentIntervalPeriod
        }
      ]
    });
    if (!result || !Array.isArray(result)) {
      return;
    }
    const [iconVal, nameVal, themeVal, typeVal, periodNVal, periodUnitVal] = result;
    if (!nameVal || !String(nameVal).trim()) {
      await app.alert("Habit name cannot be empty.");
      return;
    }
    const parsedN = parseInt(periodNVal, 10);
    const periodN = !isNaN(parsedN) && parsedN >= 1 && parsedN <= 365 ? parsedN : 1;
    const periodUnit = [INTERVAL_PERIODS.DAY, INTERVAL_PERIODS.WEEK, INTERVAL_PERIODS.MONTH].includes(periodUnitVal) ? periodUnitVal : INTERVAL_PERIODS.DAY;
    const colorTheme = themeVal && COLOR_THEMES[themeVal] ? themeVal : "blue";
    const habitType = typeVal === TRACK_TYPES.COMPLETE || typeVal === TRACK_TYPES.SKIP ? typeVal : TRACK_TYPES.SKIP;
    await mutateState(app, async (state2) => {
      const habit = state2.habits.find((h) => h.id === habitId);
      if (!habit) return;
      habit.icon = iconVal && String(iconVal).trim() ? String(iconVal).trim() : "\u{1F525}";
      habit.name = String(nameVal).trim();
      habit.colorTheme = colorTheme;
      habit.type = habitType;
      habit.interval = {
        n: periodN,
        period: periodUnit
      };
    });
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleEditHabit:", err);
    await app.alert(`Failed to edit habit: ${err.message || err}`);
  }
}

// anp-22-habit-streak/lib/features/toggleDay.js
async function handleToggleDay(app, habitId, dateStr, currentStatus) {
  if (!habitId || !dateStr) return;
  try {
    let linkedTaskUUID = null;
    let toggledToDone = false;
    await mutateState(app, async (state) => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) return;
      habit.skips = habit.skips || [];
      habit.completions = habit.completions || [];
      habit.events = habit.events || [];
      if (currentStatus === "completed") {
        habit.completions = habit.completions.filter((d) => d !== dateStr);
        if (!habit.skips.includes(dateStr)) {
          habit.skips.push(dateStr);
        }
        toggledToDone = false;
      } else {
        habit.skips = habit.skips.filter((d) => d !== dateStr);
        if (!habit.completions.includes(dateStr)) {
          habit.completions.push(dateStr);
        }
        toggledToDone = true;
      }
      if (habit.taskUUID) {
        linkedTaskUUID = habit.taskUUID;
      }
    });
    const todayStr = getTodayString();
    if (dateStr === todayStr && linkedTaskUUID) {
      try {
        if (toggledToDone) {
          await app.updateTask(linkedTaskUUID, { completedAt: Math.floor(Date.now() / 1e3) });
        } else {
          await app.updateTask(linkedTaskUUID, { completedAt: null });
        }
      } catch (err) {
        console.warn("[HabitStreak] Task update sync:", err);
      }
    }
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleToggleDay:", err);
    await app.alert(`Failed to toggle day: ${err.message || err}`);
  }
}
async function handleSaveCalendarEdits(app, habitId, skips, completions) {
  if (!habitId) return;
  try {
    await mutateState(app, async (state) => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) return;
      if (Array.isArray(skips)) habit.skips = Array.from(new Set(skips)).sort();
      if (Array.isArray(completions)) habit.completions = Array.from(new Set(completions)).sort();
      habit.events = habit.events || [];
      const allRecordedDates = [...habit.completions || [], ...habit.skips || []].filter(Boolean).sort();
      if (allRecordedDates.length > 0) {
        const earliest = allRecordedDates[0];
        const currentTrackingStart = habit.trackingStartDate || (habit.createdAt ? habit.createdAt.split("T")[0] : earliest);
        if (earliest < currentTrackingStart) {
          habit.trackingStartDate = earliest;
        }
      }
      habit.events.push({
        id: generateUniqueId("event"),
        type: "calendar_edit",
        date: getTodayString(),
        note: `Calendar history edited (${habit.completions.length} done, ${habit.skips.length} skips)`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleSaveCalendarEdits:", err);
    await app.alert(`Failed to save calendar edits: ${err.message || err}`);
  }
}

// anp-22-habit-streak/lib/features/resetStreak.js
async function handleSkipToday(app, habitId) {
  if (!habitId) return;
  try {
    const todayStr = getTodayString();
    const state = await loadState(app);
    const habit = (state.habits || []).find((h) => h.id === habitId);
    if (!habit) return;
    const habitName = habit.name;
    const isQuitly = habit.type === TRACK_TYPES.SKIP;
    const alreadySkippedToday = (habit.skips || []).includes(todayStr);
    const stats = calculateHabitStats(habit, todayStr);
    const currentStreak = stats.currentStreak;
    const promptTitle = isQuitly ? alreadySkippedToday ? "Log Additional Slip (+1)" : "Log Slip / Reset Today" : "Mark Missed / Skip Today";
    const result = await app.prompt(promptTitle, {
      inputs: [
        {
          type: "string",
          label: "Reflection / Reason Note (Optional)",
          placeholder: "e.g., Felt tempted or overwhelmed, resetting with renewed focus"
        },
        {
          type: "checkbox",
          label: `Confirm logging a ${isQuitly ? "slip/reset" : "missed day"} for ${habitName}? (Current streak: ${currentStreak} days)`,
          value: true
        }
      ]
    });
    if (!result) return;
    const noteVal = Array.isArray(result) ? result[0] : typeof result === "object" ? result.note : "";
    const confirmVal = Array.isArray(result) ? result[1] : typeof result === "object" ? result.confirm : true;
    if (confirmVal === false) return;
    const noteText = noteVal && String(noteVal).trim() ? String(noteVal).trim() : isQuitly ? "Daily slip logged" : "Marked missed today";
    const nowISO = (/* @__PURE__ */ new Date()).toISOString();
    await mutateState(app, async (state2) => {
      const habit2 = state2.habits.find((h) => h.id === habitId);
      if (!habit2) return;
      const stats2 = calculateHabitStats(habit2, todayStr);
      habit2.skips = habit2.skips || [];
      habit2.completions = habit2.completions || [];
      habit2.resetLogs = habit2.resetLogs || [];
      habit2.events = habit2.events || [];
      habit2.events.push({
        id: generateUniqueId("event"),
        type: "skip",
        date: todayStr,
        note: noteText,
        streakLength: stats2.currentStreak,
        timestamp: nowISO
      });
      if (!habit2.skips.includes(todayStr)) {
        habit2.skips.push(todayStr);
      }
      habit2.resetLogs.push({
        id: generateUniqueId("reset"),
        date: todayStr,
        streakLength: stats2.currentStreak,
        note: noteText,
        timestamp: nowISO
      });
      habit2.completions = habit2.completions.filter((d) => d !== todayStr);
      habit2.streakAnchor = nowISO;
      habit2.streakStartedAt = nowISO;
    });
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleSkipToday:", err);
    await app.alert(`Failed to log slip/skip: ${err.message || err}`);
  }
}
async function handleUndoToday(app, habitId) {
  if (!habitId) return;
  try {
    const todayStr = getTodayString();
    await mutateState(app, async (state) => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) return;
      habit.skips = (habit.skips || []).filter((d) => d !== todayStr);
      habit.completions = (habit.completions || []).filter((d) => d !== todayStr);
      if (Array.isArray(habit.events) && habit.events.length > 0) {
        let lastTodayIdx = -1;
        for (let i = habit.events.length - 1; i >= 0; i--) {
          if (habit.events[i].date === todayStr) {
            lastTodayIdx = i;
            break;
          }
        }
        if (lastTodayIdx !== -1) {
          habit.events.splice(lastTodayIdx, 1);
        }
      }
      if (Array.isArray(habit.resetLogs) && habit.resetLogs.length > 0) {
        let lastTodayResetIdx = -1;
        for (let i = habit.resetLogs.length - 1; i >= 0; i--) {
          if (habit.resetLogs[i].date === todayStr) {
            lastTodayResetIdx = i;
            break;
          }
        }
        if (lastTodayResetIdx !== -1) {
          habit.resetLogs.splice(lastTodayResetIdx, 1);
        }
      }
    });
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleUndoToday:", err);
    await app.alert(`Failed to undo today's action: ${err.message || err}`);
  }
}
async function handleCompleteToday(app, habitId) {
  if (!habitId) return;
  try {
    const todayStr = getTodayString();
    const state = await loadState(app);
    const habit = (state.habits || []).find((h) => h.id === habitId);
    if (!habit) return;
    const habitName = habit.name;
    const alreadyDoneToday = (habit.completions || []).includes(todayStr);
    const result = await app.prompt(alreadyDoneToday ? "Log Additional Completion (+1)" : "Mark Done Today", {
      inputs: [
        {
          type: "string",
          label: "Session Note / Reflection (Optional)",
          placeholder: "e.g., Completed morning workout, read chapter 3"
        },
        {
          type: "checkbox",
          label: `Confirm logging completion for ${habitName}?`,
          value: true
        }
      ]
    });
    if (!result) return;
    const noteVal = Array.isArray(result) ? result[0] : typeof result === "object" ? result.note : "";
    const confirmVal = Array.isArray(result) ? result[1] : typeof result === "object" ? result.confirm : true;
    if (confirmVal === false) return;
    const noteText = noteVal && String(noteVal).trim() ? String(noteVal).trim() : "Completed session";
    const nowISO = (/* @__PURE__ */ new Date()).toISOString();
    await mutateState(app, async (state2) => {
      const habit2 = state2.habits.find((h) => h.id === habitId);
      if (!habit2) return;
      habit2.skips = habit2.skips || [];
      habit2.completions = habit2.completions || [];
      habit2.events = habit2.events || [];
      habit2.events.push({
        id: generateUniqueId("event"),
        type: "done",
        date: todayStr,
        note: noteText,
        timestamp: nowISO
      });
      habit2.skips = habit2.skips.filter((d) => d !== todayStr);
      if (!habit2.completions.includes(todayStr)) {
        habit2.completions.push(todayStr);
      }
      if (!habit2.streakStartedAt) {
        habit2.streakStartedAt = nowISO;
        habit2.streakAnchor = nowISO;
      }
    });
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleCompleteToday:", err);
    await app.alert(`Failed to complete today: ${err.message || err}`);
  }
}
async function handleResetToDate(app, habitId) {
  if (!habitId) return;
  try {
    const todayStr = getTodayString();
    const result = await app.prompt("Reset Counter with Note", {
      inputs: [
        {
          type: "string",
          label: "Reset From Date (YYYY-MM-DD)",
          placeholder: todayStr,
          value: todayStr
        },
        {
          type: "string",
          label: "Reset Reflection / Reason Note (Optional)",
          placeholder: "e.g., Felt overwhelmed at party, resolved to restart tomorrow"
        },
        {
          type: "checkbox",
          label: "Mark all days between this date and today as skipped / reset",
          value: true
        }
      ]
    });
    if (!result || !Array.isArray(result)) {
      return;
    }
    const [startDateVal, noteVal, confirmVal] = result;
    if (!startDateVal || !confirmVal) {
      return;
    }
    const startDateStr = String(startDateVal).trim();
    const rangeDates = getDateRange(startDateStr, todayStr);
    if (rangeDates.length === 0) {
      await app.alert("Invalid start date provided.");
      return;
    }
    const noteText = noteVal && String(noteVal).trim() ? String(noteVal).trim() : "Reset logged";
    const nowISO = (/* @__PURE__ */ new Date()).toISOString();
    await mutateState(app, async (state) => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) return;
      const stats = calculateHabitStats(habit, todayStr);
      habit.skips = habit.skips || [];
      habit.completions = habit.completions || [];
      habit.resetLogs = habit.resetLogs || [];
      habit.events = habit.events || [];
      for (const d of rangeDates) {
        if (!habit.skips.includes(d)) {
          habit.skips.push(d);
        }
        habit.completions = habit.completions.filter((c) => c !== d);
      }
      habit.events.push({
        id: generateUniqueId("event"),
        type: "skip",
        date: startDateStr,
        note: noteText,
        timestamp: nowISO
      });
      habit.resetLogs.push({
        id: generateUniqueId("reset"),
        date: startDateStr,
        streakLength: stats.currentStreak,
        note: noteText,
        timestamp: nowISO
      });
      const resetAnchorISO = `${startDateStr}T00:00:00Z`;
      habit.streakAnchor = resetAnchorISO;
      habit.streakStartedAt = resetAnchorISO;
    });
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleResetToDate:", err);
    await app.alert(`Failed to reset counter: ${err.message || err}`);
  }
}

// anp-22-habit-streak/lib/features/habitManagement.js
async function handleDeleteHabit(app, habitId) {
  if (!habitId) return;
  try {
    const state = await loadState(app);
    const habit = (state.habits || []).find((h) => h.id === habitId);
    if (!habit) return;
    const habitName = habit.name;
    const confirm = await app.prompt(`Delete Habit: "${habitName}"?`, {
      inputs: [
        {
          type: "checkbox",
          label: "Confirm removing this habit from streak tracking",
          value: true
        }
      ]
    });
    if (!confirm) return;
    const isConfirmed = Array.isArray(confirm) ? confirm[0] : confirm;
    if (!isConfirmed) return;
    await mutateState(app, async (state2) => {
      state2.habits = state2.habits.filter((h) => h.id !== habitId);
      if (state2.activeHabitId === habitId) {
        state2.activeHabitId = state2.habits.length > 0 ? state2.habits[0].id : null;
      }
    });
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleDeleteHabit:", err);
    await app.alert(`Failed to delete habit: ${err.message || err}`);
  }
}
async function handleSelectHabit(app, habitId) {
  if (!habitId) return;
  try {
    await mutateState(app, async (state) => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) return;
      state.activeHabitId = habitId;
    });
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleSelectHabit:", err);
  }
}

// anp-22-habit-streak/lib/features/importFromNote.js
function getTaskDisplayText(taskObj, fallback = "Task") {
  if (!taskObj) return fallback;
  const raw = taskObj.content || taskObj.name || taskObj.text || fallback;
  return String(raw).trim() || fallback;
}
async function handleImportFromNote(app) {
  try {
    const notePrompt = await app.prompt("Select a Note to Import Tasks", {
      inputs: [
        {
          type: "note",
          label: "Source Note",
          placeholder: "Choose note containing recurring tasks..."
        }
      ]
    });
    if (!notePrompt) {
      return;
    }
    const selectedNote = Array.isArray(notePrompt) ? notePrompt[0] : notePrompt;
    if (!selectedNote) {
      return;
    }
    let noteUUID = null;
    if (typeof selectedNote === "object" && selectedNote !== null) {
      noteUUID = selectedNote.uuid || selectedNote.id;
    } else if (typeof selectedNote === "string") {
      const match = selectedNote.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      noteUUID = match ? match[1] : selectedNote;
    }
    if (!noteUUID) {
      await app.alert("Could not identify the selected note.");
      return;
    }
    let tasks = [];
    try {
      if (typeof app.getNoteTasks === "function") {
        tasks = await app.getNoteTasks({ uuid: noteUUID }, { includeDone: true });
      }
    } catch (err) {
      console.warn("[HabitStreak] app.getNoteTasks error, falling back to note content parsing:", err);
    }
    if (!tasks || tasks.length === 0) {
      try {
        const content = await app.getNoteContent({ uuid: noteUUID });
        if (content) {
          const lines = content.split("\n");
          for (const line of lines) {
            const match = line.match(/^\s*[-*]?\s*\[\s*[xX]?\s*\]\s*(.+)/);
            if (match) {
              tasks.push({ content: match[1].trim() });
            }
          }
        }
      } catch (err) {
        console.error("[HabitStreak] Error getting note content:", err);
      }
    }
    if (!tasks || tasks.length === 0) {
      await app.alert("No tasks found in the selected note.");
      return;
    }
    const taskInputs = tasks.slice(0, 25).map((t, idx) => ({
      type: "checkbox",
      label: `${idx + 1}. ${getTaskDisplayText(t, "Task")}`,
      value: true
    }));
    const confirmResult = await app.prompt("Select Tasks to Track as Habits", {
      inputs: taskInputs
    });
    if (confirmResult === null || confirmResult === void 0) {
      return;
    }
    const isCheckedArray = Array.isArray(confirmResult) ? confirmResult : [confirmResult];
    const selectedTasks = tasks.filter((_, idx) => isCheckedArray[idx]);
    if (selectedTasks.length === 0) {
      return;
    }
    const todayStr = getTodayString();
    const nowISO = (/* @__PURE__ */ new Date()).toISOString();
    const colorThemes = ["emerald", "blue", "indigo", "teal", "purple", "amber", "rose", "bronze"];
    const newHabits = [];
    for (let i = 0; i < selectedTasks.length; i++) {
      const taskObj = selectedTasks[i];
      const taskText = getTaskDisplayText(taskObj, `Task ${i + 1}`);
      const defaultTheme = colorThemes[i % colorThemes.length];
      const titlePrefix = selectedTasks.length > 1 ? `(${i + 1}/${selectedTasks.length}) ` : "";
      const configResult = await app.prompt(`Configure Habit: ${titlePrefix}${taskText.slice(0, 28)}`, {
        inputs: [
          {
            type: "string",
            label: "Emoji Icon (\u{1F525}, \u{1F3C3}, \u{1F4DA}, \u{1F9D8}, \u{1F377}...)",
            value: "\u{1F4DD}"
          },
          {
            type: "string",
            label: "Habit / Counter Name",
            value: taskText
          },
          {
            type: "select",
            label: "Tracking Philosophy",
            options: [
              { label: "\u2728 Positive Habit (Considered done when marked)", value: TRACK_TYPES.COMPLETE },
              { label: "\u{1F6E1}\uFE0F Bad Habit / Abstinence (Considered done unless skipped)", value: TRACK_TYPES.SKIP }
            ],
            value: TRACK_TYPES.COMPLETE
          },
          {
            type: "select",
            label: "Color Theme",
            options: [
              { label: "Emerald (Green)", value: "emerald" },
              { label: "Sky Blue", value: "blue" },
              { label: "Indigo (Navy)", value: "indigo" },
              { label: "Teal (Cyan)", value: "teal" },
              { label: "Purple (Violet)", value: "purple" },
              { label: "Amber (Orange/Gold)", value: "amber" },
              { label: "Rose (Pink/Red)", value: "rose" },
              { label: "Bronze (Warm Brown)", value: "bronze" }
            ],
            value: defaultTheme
          },
          {
            type: "string",
            label: "Every (Number)",
            value: "1"
          },
          {
            type: "select",
            label: "Period",
            options: [
              { label: "Day(s)", value: INTERVAL_PERIODS.DAY },
              { label: "Week(s)", value: INTERVAL_PERIODS.WEEK },
              { label: "Month(s)", value: INTERVAL_PERIODS.MONTH }
            ],
            value: INTERVAL_PERIODS.DAY
          }
        ]
      });
      if (!configResult) {
        continue;
      }
      const configArray = Array.isArray(configResult) ? configResult : [configResult];
      const [iconVal, nameVal, typeVal, themeVal, periodNVal, periodUnitVal] = configArray;
      const finalName = nameVal && String(nameVal).trim() ? String(nameVal).trim() : taskText;
      const finalIcon = iconVal && String(iconVal).trim() ? String(iconVal).trim() : "\u{1F4DD}";
      const finalType = typeVal === TRACK_TYPES.COMPLETE || typeVal === TRACK_TYPES.SKIP ? typeVal : TRACK_TYPES.COMPLETE;
      const finalTheme = themeVal && COLOR_THEMES[themeVal] ? themeVal : defaultTheme;
      const parsedN = parseInt(periodNVal, 10);
      const periodN = !isNaN(parsedN) && parsedN >= 1 && parsedN <= 365 ? parsedN : 1;
      const periodUnit = [INTERVAL_PERIODS.DAY, INTERVAL_PERIODS.WEEK, INTERVAL_PERIODS.MONTH].includes(periodUnitVal) ? periodUnitVal : INTERVAL_PERIODS.DAY;
      const habitId = generateUniqueId("habit");
      const newHabit = {
        id: habitId,
        name: finalName,
        icon: finalIcon,
        type: finalType,
        colorTheme: finalTheme,
        interval: {
          n: periodN,
          period: periodUnit
        },
        createdAt: nowISO,
        trackingStartDate: todayStr,
        streakAnchor: nowISO,
        streakStartedAt: nowISO,
        skips: [],
        completions: finalType === TRACK_TYPES.COMPLETE ? [todayStr] : [],
        events: [],
        resetLogs: []
      };
      newHabits.push(newHabit);
    }
    if (newHabits.length > 0) {
      await mutateState(app, async (state) => {
        state.habits = state.habits || [];
        for (const habit of newHabits) {
          state.habits.push(habit);
        }
        state.activeHabitId = newHabits[newHabits.length - 1].id;
      });
      await app.alert(`Successfully imported ${newHabits.length} habit(s)!`);
      if (app.context && typeof app.context.renderEmbed === "function") {
        await app.context.renderEmbed();
      }
    }
  } catch (err) {
    console.error("[HabitStreak] Error in handleImportFromNote:", err);
    await app.alert(`Failed to import habits: ${err.message || err}`);
  }
}

// anp-22-habit-streak/habit-streak.js
var plugin = {
  // App-level action: launches the Habit Streaks Dashboard (Fullscreen or Sidebar)
  appOption: {
    "Open Dashboard": async function(app) {
      await launchHabitDashboard(app);
    }
  },
  /**
   * Dispatches events sent from the embed iframe UI.
   * @param {object} app - Amplenote App instance.
   * @param  {...any} args - Action arguments from the embed.
   */
  async onEmbedCall(app, ...args) {
    const action = args[0];
    try {
      switch (action) {
        case "createHabit":
          await handleCreateHabit(app);
          break;
        case "createFromTemplate":
          await handleCreateFromTemplate(app, args[1]);
          break;
        case "importFromNote":
          await handleImportFromNote(app);
          break;
        case "editHabit":
          await handleEditHabit(app, args[1]);
          break;
        case "selectHabit":
          await handleSelectHabit(app, args[1]);
          break;
        case "deleteHabit":
          await handleDeleteHabit(app, args[1]);
          break;
        case "toggleDay":
          await handleToggleDay(app, args[1], args[2], args[3]);
          break;
        case "saveCalendarEdits":
          await handleSaveCalendarEdits(app, args[1], args[2], args[3]);
          break;
        case "skipToday":
          await handleSkipToday(app, args[1]);
          break;
        case "completeToday":
          await handleCompleteToday(app, args[1]);
          break;
        case "undoToday":
          await handleUndoToday(app, args[1]);
          break;
        case "resetToDate":
          await handleResetToDate(app, args[1]);
          break;
        case "setTheme":
          if (args[1]) {
            await mutateState(app, async (state) => {
              state.theme = args[1];
            });
          }
          break;
        case "refreshData":
          if (app.context && typeof app.context.renderEmbed === "function") {
            await app.context.renderEmbed();
          }
          break;
        default:
          console.warn("[HabitStreak] Unhandled embed action:", action);
      }
    } catch (err) {
      console.error("[HabitStreak] Error processing onEmbedCall:", err);
      await app.alert(`Action error: ${err.message || err}`);
    }
  },
  /**
   * Renders the interactive Habit Streak dashboard.
   * @param {object} app - Amplenote App instance.
   * @param  {...any} args - Embed rendering arguments.
   * @returns {Promise<string>} - Complete HTML string.
   */
  async renderEmbed(app, ...args) {
    const state = await loadState(app);
    const habits = state.habits || [];
    const summary = calculateAllHabitsSummary(habits);
    let activeHabit = null;
    if (state.activeHabitId) {
      activeHabit = habits.find((h) => h.id === state.activeHabitId) || null;
    }
    const embedOpts = args && args.length > 0 && typeof args[0] === "object" ? args[0] : {};
    const now = /* @__PURE__ */ new Date();
    const viewingYear = embedOpts.year || now.getFullYear();
    const viewingMonth = embedOpts.month || now.getMonth() + 1;
    let stats = null;
    let tiers = [];
    let calendar = null;
    if (activeHabit) {
      stats = calculateHabitStats(activeHabit);
      tiers = calculateTierProgress(stats.currentStreak);
      calendar = generateMonthCalendar(activeHabit, viewingYear, viewingMonth);
    }
    return buildDashboardTemplate({
      habits,
      summary,
      activeHabit,
      stats,
      tiers,
      calendar,
      theme: state.theme || "midnight"
    });
  }
};
var habit_streak_default = plugin;


return habit_streak_default;
})()