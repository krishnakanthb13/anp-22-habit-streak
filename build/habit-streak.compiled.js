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
  version: 1,
  activeHabitId: null,
  habits: []
};

// anp-22-habit-streak/lib/data/store.js
var SETTING_DATA_NOTE_UUID = "Habit_Streak_Data_UUID [Do not Edit!]";
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
        } catch {
        }
      } catch (error) {
        console.error("[HabitStreak] Error resolving note UUID:", error);
      }
    } else {
      return existingUUID;
    }
  }
  try {
    const allNotes = await app.filterNotes({});
    if (allNotes && Array.isArray(allNotes)) {
      const match = allNotes.find((n) => n.name === noteName);
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
    }
  }
  try {
    return JSON.parse(content.trim());
  } catch {
    return null;
  }
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
    const parsed = extractJsonFromMarkdown(content);
    if (parsed && typeof parsed === "object") {
      return {
        ...DEFAULT_STATE,
        ...parsed,
        habits: Array.isArray(parsed.habits) ? parsed.habits : []
      };
    }
    const fallbackState = { ...DEFAULT_STATE };
    const markdown = formatStateAsMarkdown(fallbackState);
    await app.replaceNoteContent({ uuid: dataNoteUUID }, markdown);
    return fallbackState;
  } catch (err) {
    console.error("[HabitStreak] Failed to load state:", err);
    return { ...DEFAULT_STATE };
  }
}
async function saveState2(app, state) {
  try {
    const dataNoteUUID = await getNoteUUID(app, DATA_NOTE_NAME, DATA_NOTE_TAGS, SETTING_DATA_NOTE_UUID);
    const markdown = formatStateAsMarkdown(state);
    await app.replaceNoteContent({ uuid: dataNoteUUID }, markdown);
    return true;
  } catch (err) {
    console.error("[HabitStreak] Failed to save state:", err);
    return false;
  }
}

// anp-22-habit-streak/lib/engine/streakEngine.js
function formatDate(date) {
  const d = new Date(date);
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
function getHabitDayStatus(habit, dateStr, todayStr = getTodayString()) {
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
    if (completions.has(dateStr) && !skips.has(dateStr)) {
      return "completed";
    }
    return "skipped";
  }
  if (skips.has(dateStr)) {
    return "skipped";
  }
  return "completed";
}
function calculateHabitStats(habit, todayStr = getTodayString()) {
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
      streakAnchorTimestamp: null,
      statusToday: "completed"
    };
  }
  const dayStatuses = allDates.map((dateStr) => ({
    dateStr,
    status: getHabitDayStatus(habit, dateStr, todayStr)
  }));
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
  const completionRate = totalTrackedDays > 0 ? Math.round(completedDays / totalTrackedDays * 100) : 0;
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
  let streakAnchorTimestamp = null;
  if (currentStreak > 0 && streakStartDate) {
    if (habit.streakAnchor && habit.streakAnchor.startsWith(streakStartDate)) {
      streakAnchorTimestamp = new Date(habit.streakAnchor).getTime();
    } else {
      streakAnchorTimestamp = (/* @__PURE__ */ new Date(`${streakStartDate}T00:00:00`)).getTime();
    }
  }
  const statusToday = getHabitDayStatus(habit, todayStr, todayStr);
  return {
    currentStreak,
    longestStreak,
    totalTrackedDays,
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

    .cal-grid-mini {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
      margin-bottom: 12px;
    }

    .day-mini-dot {
      aspect-ratio: 1;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      background: rgba(0,0,0,0.08);
      color: var(--text-sub);
    }

    .day-mini-dot.done {
      background: #22c55e;
      color: #ffffff;
    }

    .day-mini-dot.skip {
      background: #f43f5e;
      color: #ffffff;
    }

    .day-mini-dot.empty {
      background: transparent;
      cursor: default;
    }

    .resets-counter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
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

    let currentData = INITIAL_DATA;
    let currentView = "main"; // "main" | "detail" | "templates" | "settings"
    let selectedHabitId = null;
    let mainFilter = "all"; // "all" | "quit" | "positive"
    let templateFilter = "all"; // "all" | "quit" | "positive"
    let viewingYear = new Date().getFullYear();
    let viewingMonth = new Date().getMonth() + 1;

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

    function switchView(view, habitId = null) {
      currentView = view;
      selectedHabitId = habitId;
      viewingYear = new Date().getFullYear();
      viewingMonth = new Date().getMonth() + 1;
      render();
    }

    function setMainFilter(filter) {
      mainFilter = filter;
      render();
    }

    function setTemplateFilter(filter) {
      templateFilter = filter;
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

    function getClientDayStatus(habit, dateStr, todayStr) {
      const habitStart = habit.createdAt ? habit.createdAt.split("T")[0] : todayStr;
      if (dateStr < habitStart) return "before_start";
      if (dateStr > todayStr) return "future";
      const skips = new Set(habit.skips || []);
      const completions = new Set(habit.completions || []);
      if (habit.type === 'complete') {
        if (completions.has(dateStr) && !skips.has(dateStr)) return "completed";
        return "skipped";
      }
      if (skips.has(dateStr)) return "skipped";
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
            <button class="btn-header-round" onclick="switchView('main')">\u2715</button>
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

            <button class="btn-quitly-action" style="width: 100%; justify-content: center;" onclick="switchView('templates')">
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
            <div class="template-item-row \${grad}" onclick="callHost('createFromTemplate', \${globalIdx >= 0 ? globalIdx : 0})">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">\${p.icon}</span>
                <div>
                  <div style="font-weight: 700; font-size: 14px;">\${p.name}</div>
                  <div style="font-size: 11px; opacity: 0.85;">\${p.category}</div>
                </div>
              </div>
              <button class="template-btn-add">+</button>
            </div>
          \`;
        }).join("");

        let quitlyListHtml = renderTemplateRows(QUITLY_PRESETS);
        let amplenoteListHtml = renderTemplateRows(AMPLENOTE_PRESETS);

        root.innerHTML = \`
          <div class="app-top-header">
            <button class="btn-header-round" onclick="switchView('main')">\u2715</button>
            <span class="header-title-text">New Counter</span>
            <div style="width: 40px;"></div>
          </div>

          <div class="filter-segment-bar">
            <button class="filter-tab-btn \${templateFilter === 'all' ? 'active' : ''}" onclick="setTemplateFilter('all')">All</button>
            <button class="filter-tab-btn \${templateFilter === 'quit' ? 'active' : ''}" onclick="setTemplateFilter('quit')">\u{1F6E1}\uFE0F Quitting</button>
            <button class="filter-tab-btn \${templateFilter === 'positive' ? 'active' : ''}" onclick="setTemplateFilter('positive')">\u{1F3AF} Positive Habits</button>
          </div>

          <div class="templates-shelf-card">
            <button class="btn-create-custom" onclick="callHost('createHabit')">+ Create a Custom Counter</button>
            <button class="btn-quitly-action" style="width: 100%; justify-content: center; margin-top: 6px; margin-bottom: 4px;" onclick="callHost('importFromNote')">
              \u{1F4E5} Import Tasks from Note
            </button>

            <details class="guide-accordion">
              <summary>
                <span style="display: flex; align-items: center; gap: 6px;">
                  <span>\u{1F4A1}</span> <span>How to Add & Track Habits</span>
                </span>
                <span style="font-size: 10px; opacity: 0.75;">\u25BC</span>
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
                <div class="counter-card-emoji-box">\${icon}</div>
                <div class="counter-card-info">
                  <div class="counter-card-time">\${durationStr}</div>
                  <div class="counter-card-name">\${escapeHtml(cleanName)}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 11px; background: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 12px; font-weight: 700;">
                  \${isQuit ? '\u{1F6E1}\uFE0F Auto-Done' : '\u{1F3AF} Check-In'}
                </span>
                <span class="counter-card-arrow">\u203A</span>
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
            <button class="btn-header-round" title="Add Counter" onclick="switchView('templates')">+</button>
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

      const isQuitly = activeHabit.type === 'skip';
      const isCompletedToday = stats.statusToday === "completed";

      // Contextual Action Buttons & Phrasing
      let actionsClusterHtml = "";
      let statusBadgeHtml = "";
      let philosophyFooterHtml = "";

      if (isQuitly) {
        // Quitly / Bad Habit / Abstinence
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

        philosophyFooterHtml = \`
          <div class="activity-section-card" style="margin-top: 12px; background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.25);">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px; color: #10b981; margin-bottom: 4px;">
              <span>\u{1F6E1}\uFE0F Quitly Abstinence Philosophy (Quitting a Bad Habit)</span>
            </div>
            <p style="font-size: 12px; color: var(--text-sub); line-height: 1.4;">
              This is a quitting counter. Days count up automatically as long as you stay clean. You only need to interact when you experience a slip or relapse to reset the counter with an optional reflection note.
            </p>
          </div>
        \`;
      } else {
        // Amplenote / Positive Action Habit
        statusBadgeHtml = isCompletedToday ? \`
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
            \u2705 Completed for Today!
          </div>
        \` : \`
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); color: #6366f1; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
            \u23F3 Today Pending Check-In
          </div>
        \`;

        actionsClusterHtml = isCompletedToday ? \`
          <div class="action-pills-cluster">
            <button class="btn-quitly-action btn-done-success" onclick="callHost('completeToday', '\${activeHabit.id}')" title="Log additional completion">
              + Log Additional Done (+1)
            </button>
            <button class="btn-quitly-action" onclick="callHost('skipToday', '\${activeHabit.id}')">
              \u21A9\uFE0F Undo / Mark Skipped
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
              This is a positive action habit. Your streak grows by intentionally completing and checking in each day. Tap <strong>"Mark Done Today"</strong> whenever you finish your practice. You can also log multiple sessions per day.
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
      let dayDots = calendar.days.map(d => {
        let cls = (d.status === 'completed') ? 'done' : ((d.status === 'skipped') ? 'skip' : '');
        let isClickable = d.status === "completed" || d.status === "skipped";
        let clickAttr = isClickable 
          ? \`onclick="callHost('toggleDay', '\${activeHabit.id}', '\${d.dateStr}', '\${d.status}')"\` 
          : "";
        return \`<div class="day-mini-dot \${cls}" \${clickAttr} title="\${d.dateStr}: \${d.status}">\${d.dayNumber}</div>\`;
      }).join("");

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
            <button class="btn-header-round" onclick="switchView('main')">\u2039</button>
            <div style="display: flex; gap: 8px;">
              <button class="btn-header-round" title="Edit Settings" onclick="callHost('editHabit', '\${activeHabit.id}')">\u270F\uFE0F</button>
              <button class="btn-header-round" title="Delete Counter" onclick="callHost('deleteHabit', '\${activeHabit.id}')">\u{1F5D1}\uFE0F</button>
            </div>
          </div>

          <div class="hero-habit-badge">
            <span style="font-size: 22px;">\${icon}</span>
            <span class="hero-habit-title">\${escapeHtml(cleanName)}</span>
          </div>

          <div class="hero-its-been">\${isQuitly ? "Clean & sober for" : "Continuous unbroken streak"}</div>

          <!-- 4-Column Digital Ticker -->
          <div class="digital-ticker-row">
            <div class="ticker-col">
              <div class="ticker-num">\${stats.currentStreak || 0}</div>
              <div class="ticker-lbl">days</div>
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
            <button class="unit-pill">Y</button>
            <button class="unit-pill">M</button>
            <button class="unit-pill active">D</button>
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
              <span style="font-size: 14px; font-weight: 800;">\u{1F4CA} 7-Day Frequency</span>
              <span style="font-size: 12px; font-weight: 700; color: #2563eb;">\${weeklyFreq.totalWeekLogs} total this week</span>
            </div>
            <div class="weekly-bars-container">
              \${weeklyBarsHtml}
            </div>
          </div>

          <!-- Yearly / Monthly Activity Log -->
          <div class="activity-section-card">
            <div class="activity-header">
              <span style="font-size: 14px; font-weight: 800;">\u{1F4C5} \${calendar.monthName} \${calendar.year}</span>
              <div style="display: flex; gap: 4px;">
                <button class="btn-header-round" style="width: 28px; height: 28px; background: rgba(0,0,0,0.08); color: var(--text-main);" onclick="changeMonth(-1)">\u2039</button>
                <button class="btn-header-round" style="width: 28px; height: 28px; background: rgba(0,0,0,0.08); color: var(--text-main);" onclick="changeMonth(1)">\u203A</button>
              </div>
            </div>

            <div class="cal-grid-mini">
              \${emptyDots}
              \${dayDots}
            </div>

            <div class="resets-counter-bar">
              <span style="color: var(--text-sub);">Count of Resets / Skips</span>
              <span style="font-weight: 800;">\${stats.skippedDays || 0} times</span>
            </div>
          </div>

          <!-- Reset History Log with Notes -->
          <div class="activity-section-card" style="margin-top: 12px;">
            <div class="activity-header">
              <span style="font-size: 14px; font-weight: 800;">\u{1F4DD} Reset & Reflection History</span>
              <span style="font-size: 12px; font-weight: 700; color: var(--text-sub);">\${(activeHabit.resetLogs || []).length} logs</span>
            </div>
            \${(activeHabit.resetLogs && activeHabit.resetLogs.length > 0) ? \`
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${activeHabit.resetLogs.slice().reverse().map(log => \`
                  <div style="background: var(--card-container-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 12px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--text-main); margin-bottom: 2px;">
                      <span>\${log.streakLength || 0} days streak before reset</span>
                      <span style="color: var(--text-sub);">\${log.date}</span>
                    </div>
                    <div style="color: var(--text-sub); font-style: italic;">"\${escapeHtml(log.note || 'Reset logged')}"</div>
                  </div>
                \`).join("")}
              </div>
            \` : \`
              <div style="font-size: 12px; color: var(--text-sub); text-align: center; padding: 8px 0;">
                No resets recorded yet. Keep your unbroken streak going!
              </div>
            \`}
          </div>

          <!-- Philosophy Explainer Footer -->
          \${philosophyFooterHtml}
        </div>
      \`;

      startLiveTicker();
    }

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
    let lastChoice = (app.settings || {})["Last Embed View"];
    const choiceResult = await app.prompt("Choose Habit Streaks Launch Target:", {
      inputs: [
        {
          label: "Launch Target",
          type: "select",
          options: [
            { label: "Fullscreen Tab (Dedicated Workspace)", value: "fullscreen" },
            { label: "Peek Viewer (Sidebar)", value: "sidebar" }
          ],
          value: lastChoice || "fullscreen"
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
      if (app.context && app.context.pluginUUID) {
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
    console.error("Error in launchHabitDashboard:", error);
    await app.alert(`An error occurred while opening dashboard: ${error.message}`);
  }
}

// anp-22-habit-streak/lib/features/createHabit.js
async function handleCreateHabit(app) {
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
    return;
  }
  const habitName = String(nameVal).trim();
  const habitIcon = iconVal && String(iconVal).trim() ? String(iconVal).trim() : "\u{1F525}";
  const colorTheme = themeVal || "blue";
  const habitType = typeVal || TRACK_TYPES.SKIP;
  const periodN = parseInt(periodNVal, 10) || 1;
  const periodUnit = periodUnitVal || INTERVAL_PERIODS.DAY;
  const newHabit = {
    id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: habitName,
    icon: habitIcon,
    colorTheme,
    type: habitType,
    interval: {
      n: periodN,
      period: periodUnit
    },
    createdAt: `${getTodayString()}T00:00:00Z`,
    streakAnchor: (/* @__PURE__ */ new Date()).toISOString(),
    skips: [],
    completions: habitType === TRACK_TYPES.COMPLETE ? [getTodayString()] : [],
    events: [],
    resetLogs: []
  };
  const state = await loadState(app);
  state.habits.push(newHabit);
  state.activeHabitId = newHabit.id;
  await saveState2(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
async function handleCreateFromTemplate(app, templateIndex) {
  const template = PRESET_TEMPLATES[templateIndex];
  if (!template) return;
  const newHabit = {
    id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: template.name,
    icon: template.icon || "\u{1F525}",
    type: template.type || TRACK_TYPES.SKIP,
    colorTheme: template.colorTheme || "blue",
    interval: {
      n: 1,
      period: INTERVAL_PERIODS.DAY
    },
    createdAt: `${getTodayString()}T00:00:00Z`,
    streakAnchor: (/* @__PURE__ */ new Date()).toISOString(),
    skips: [],
    completions: template.type === TRACK_TYPES.COMPLETE ? [getTodayString()] : [],
    events: [],
    resetLogs: []
  };
  const state = await loadState(app);
  state.habits.push(newHabit);
  state.activeHabitId = newHabit.id;
  await saveState2(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}

// anp-22-habit-streak/lib/features/editHabit.js
async function handleEditHabit(app, habitId) {
  if (!habitId) return;
  const state = await loadState(app);
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) {
    await app.alert("Habit not found.");
    return;
  }
  const currentIcon = habit.icon || "\u{1F525}";
  const currentTheme = habit.colorTheme || "blue";
  const currentIntervalN = habit.interval && habit.interval.n ? String(habit.interval.n) : "1";
  const currentIntervalPeriod = habit.interval && habit.interval.period ? habit.interval.period : INTERVAL_PERIODS.DAY;
  const currentType = habit.type || TRACK_TYPES.SKIP;
  const result = await app.prompt(`Edit Counter: ${habit.name}`, {
    inputs: [
      {
        type: "string",
        label: "Emoji Icon (Paste or type any emoji: \u{1F525}, \u{1F3C3}, \u{1F377}, \u{1F4DA}...)",
        value: currentIcon
      },
      {
        type: "string",
        label: "Habit / Counter Name",
        value: habit.name
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
  habit.icon = iconVal && String(iconVal).trim() ? String(iconVal).trim() : "\u{1F525}";
  habit.name = String(nameVal).trim();
  habit.colorTheme = themeVal || "blue";
  habit.type = typeVal || TRACK_TYPES.SKIP;
  habit.interval = {
    n: parseInt(periodNVal, 10) || 1,
    period: periodUnitVal || INTERVAL_PERIODS.DAY
  };
  await saveState2(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}

// anp-22-habit-streak/lib/features/toggleDay.js
async function handleToggleDay(app, habitId, dateStr, currentStatus) {
  if (!habitId || !dateStr) return;
  const state = await loadState(app);
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  habit.skips = habit.skips || [];
  habit.completions = habit.completions || [];
  if (habit.type === TRACK_TYPES.COMPLETE) {
    if (currentStatus === "completed") {
      habit.completions = habit.completions.filter((d) => d !== dateStr);
      if (!habit.skips.includes(dateStr)) habit.skips.push(dateStr);
    } else {
      habit.skips = habit.skips.filter((d) => d !== dateStr);
      if (!habit.completions.includes(dateStr)) habit.completions.push(dateStr);
    }
  } else {
    if (currentStatus === "completed") {
      if (!habit.skips.includes(dateStr)) habit.skips.push(dateStr);
      habit.completions = habit.completions.filter((d) => d !== dateStr);
    } else {
      habit.skips = habit.skips.filter((d) => d !== dateStr);
      if (!habit.completions.includes(dateStr)) habit.completions.push(dateStr);
    }
  }
  const todayStr = getTodayString();
  if (dateStr === todayStr && habit.taskUUID) {
    try {
      if (currentStatus === "completed") {
        await app.updateTask(habit.taskUUID, { completedAt: null });
      } else {
        await app.updateTask(habit.taskUUID, { completedAt: Math.floor(Date.now() / 1e3) });
      }
    } catch (err) {
      console.warn("[HabitStreak] Task update sync:", err);
    }
  }
  await saveState2(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}

// anp-22-habit-streak/lib/features/resetStreak.js
async function handleSkipToday(app, habitId) {
  if (!habitId) return;
  const state = await loadState(app);
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  const todayStr = getTodayString();
  habit.skips = habit.skips || [];
  habit.completions = habit.completions || [];
  habit.resetLogs = habit.resetLogs || [];
  habit.events = habit.events || [];
  const stats = calculateHabitStats(habit, todayStr);
  habit.events.push({
    type: "skip",
    date: todayStr,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (!habit.skips.includes(todayStr)) {
    habit.skips.push(todayStr);
    habit.resetLogs.push({
      date: todayStr,
      streakLength: stats.currentStreak,
      note: "Daily slip logged",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  habit.completions = habit.completions.filter((d) => d !== todayStr);
  await saveState2(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
async function handleCompleteToday(app, habitId) {
  if (!habitId) return;
  const state = await loadState(app);
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  const todayStr = getTodayString();
  habit.skips = habit.skips || [];
  habit.completions = habit.completions || [];
  habit.events = habit.events || [];
  habit.events.push({
    type: "done",
    date: todayStr,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  habit.skips = habit.skips.filter((d) => d !== todayStr);
  if (!habit.completions.includes(todayStr)) {
    habit.completions.push(todayStr);
  }
  await saveState2(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
async function handleResetToDate(app, habitId) {
  if (!habitId) return;
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
  const rangeDates = getDateRange(String(startDateVal).trim(), todayStr);
  if (rangeDates.length === 0) {
    await app.alert("Invalid start date provided.");
    return;
  }
  const state = await loadState(app);
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
    type: "skip",
    date: String(startDateVal).trim(),
    note: noteVal && String(noteVal).trim() ? String(noteVal).trim() : "Reset logged",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  habit.resetLogs.push({
    date: String(startDateVal).trim(),
    streakLength: stats.currentStreak,
    note: noteVal && String(noteVal).trim() ? String(noteVal).trim() : "Reset logged",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  await saveState2(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}

// anp-22-habit-streak/lib/features/habitManagement.js
async function handleDeleteHabit(app, habitId) {
  if (!habitId) return;
  const state = await loadState(app);
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  const confirm = await app.prompt(`Delete Habit: "${habit.name}"?`, {
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
  state.habits = state.habits.filter((h) => h.id !== habitId);
  if (state.activeHabitId === habitId) {
    state.activeHabitId = state.habits.length > 0 ? state.habits[0].id : null;
  }
  await saveState2(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
async function handleSelectHabit(app, habitId) {
  if (!habitId) return;
  const state = await loadState(app);
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;
  state.activeHabitId = habitId;
  await saveState2(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}

// anp-22-habit-streak/lib/features/importFromNote.js
async function handleImportFromNote(app) {
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
    label: `${idx + 1}. ${(t.content || t.name || t.text || "Task").trim()}`,
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
  const state = await loadState(app);
  state.habits = state.habits || [];
  const colorThemes = ["emerald", "blue", "indigo", "teal", "purple", "amber", "rose", "bronze"];
  let importedCount = 0;
  let lastImportedHabitId = null;
  for (let i = 0; i < selectedTasks.length; i++) {
    const taskObj = selectedTasks[i];
    const taskText = (taskObj.content || taskObj.name || taskObj.text || `Task ${i + 1}`).trim();
    const defaultTheme = colorThemes[(state.habits.length + importedCount) % colorThemes.length];
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
    const finalType = typeVal || TRACK_TYPES.COMPLETE;
    const finalTheme = themeVal || defaultTheme;
    const periodN = parseInt(periodNVal, 10) || 1;
    const periodUnit = periodUnitVal || INTERVAL_PERIODS.DAY;
    const habitId = `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
      createdAt: `${todayStr}T00:00:00.000Z`,
      streakAnchor: (/* @__PURE__ */ new Date()).toISOString(),
      skips: [],
      completions: finalType === TRACK_TYPES.COMPLETE ? [todayStr] : [],
      events: [],
      resetLogs: []
    };
    state.habits.push(newHabit);
    lastImportedHabitId = habitId;
    importedCount++;
  }
  if (importedCount > 0) {
    if (lastImportedHabitId) {
      state.activeHabitId = lastImportedHabitId;
    }
    await saveState2(app, state);
    await app.alert(`Successfully imported ${importedCount} habit(s)!`);
    if (app.context && typeof app.context.renderEmbed === "function") {
      await app.context.renderEmbed();
    }
  }
}

// anp-22-habit-streak/habit-streak.js
var plugin = {
  // App-level action: launches the Habit Streaks Dashboard (Fullscreen or Sidebar)
  appOption: {
    "Habit Streaks Dashboard": async function(app) {
      await launchHabitDashboard(app);
    }
  },
  // Note-level action to open dashboard or embed widget into any note
  noteOption: {
    "Habit Streaks Dashboard": async function(app) {
      await launchHabitDashboard(app);
    },
    "Insert Habit Streaks Widget": async function(app, noteUUID) {
      const pluginUUID = app.context ? app.context.pluginUUID : "";
      const embedHtml = `<object data="plugin://${pluginUUID}" data-aspect-ratio="1" type="text/html"></object>`;
      await app.insertNoteContent({ uuid: noteUUID }, embedHtml);
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
        case "skipToday":
          await handleSkipToday(app, args[1]);
          break;
        case "completeToday":
          await handleCompleteToday(app, args[1]);
          break;
        case "resetToDate":
          await handleResetToDate(app, args[1]);
          break;
        case "setTheme":
          if (args[1]) {
            const state = await loadState(app);
            state.theme = args[1];
            await saveState(app, state);
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