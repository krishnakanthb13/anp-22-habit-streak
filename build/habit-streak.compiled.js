(() => {
// anp-22-habit-streak/lib/constants.js
var DATA_NOTE_NAME = "habit_streak_data";
var DATA_NOTE_TAGS = ["-reports/-habit-streak"];
var TRACK_TYPES = {
  SKIP: "skip",
  // Quitly default: habit is done unless explicitly marked skipped
  COMPLETE: "complete"
  // Amplenote default: habit is not done unless explicitly completed
};
var INTERVAL_PERIODS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month"
};
var QUITLY_TIERS = [
  { id: "1d", label: "1 Day", days: 1, badge: "\u{1F331}", title: "First Step" },
  { id: "3d", label: "3 Days", days: 3, badge: "\u{1F33F}", title: "Momentum" },
  { id: "7d", label: "1 Week", days: 7, badge: "\u{1F525}", title: "First Week" },
  { id: "14d", label: "2 Weeks", days: 14, badge: "\u26A1", title: "Fortnight" },
  { id: "30d", label: "1 Month", days: 30, badge: "\u{1F949}", title: "Monthly Milestone" },
  { id: "60d", label: "2 Months", days: 60, badge: "\u{1F948}", title: "Habit Formed" },
  { id: "90d", label: "3 Months", days: 90, badge: "\u{1F947}", title: "Quarter Champion" },
  { id: "180d", label: "6 Months", days: 180, badge: "\u{1F48E}", title: "Half Year" },
  { id: "365d", label: "1 Year", days: 365, badge: "\u{1F451}", title: "Annual Mastery" },
  { id: "730d", label: "2 Years", days: 730, badge: "\u{1F3C6}", title: "Unstoppable" },
  { id: "1825d", label: "5 Years", days: 1825, badge: "\u{1F31F}", title: "Legendary" }
];
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
async function saveState(app, state) {
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
      streakAnchorTimestamp: null
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
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Habit Streak Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-main: #0d1117;
      --bg-card: rgba(22, 27, 34, 0.85);
      --bg-card-hover: rgba(33, 38, 45, 0.95);
      --border-color: rgba(48, 54, 61, 0.7);
      --border-active: #238636;
      --text-main: #f0f6fc;
      --text-muted: #8b949e;
      --text-faint: #484f58;
      --accent-green: #2ea043;
      --accent-green-bright: #3fb950;
      --accent-green-glow: rgba(46, 160, 67, 0.25);
      --accent-red: #f85149;
      --accent-red-bg: rgba(248, 81, 73, 0.15);
      --accent-blue: #58a6ff;
      --accent-purple: #bc8cff;
      --accent-gold: #e3b341;
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.25);
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.4);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    body {
      background: var(--bg-main);
      color: var(--text-main);
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .container {
      width: 100%;
      max-width: 920px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Tab Bar */
    .tab-bar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 8px 12px;
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow-sm);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tab-bar-container::-webkit-scrollbar {
      display: none;
    }

    .tabs-list {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      overflow-x: auto;
    }

    .tab-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tab-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-btn.active {
      color: #ffffff;
      background: var(--accent-green);
      box-shadow: 0 0 16px var(--accent-green-glow);
    }

    .tab-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 1px solid var(--border-color);
      padding-left: 12px;
    }

    .action-btn-sm {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 7px 12px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .action-btn-sm:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: var(--text-muted);
    }

    .action-btn-sm.primary {
      background: rgba(46, 160, 67, 0.2);
      border-color: var(--accent-green);
      color: var(--accent-green-bright);
    }

    .action-btn-sm.primary:hover {
      background: var(--accent-green);
      color: #ffffff;
    }

    /* Hero Live Counter Card */
    .hero-card {
      background: linear-gradient(135deg, rgba(22, 27, 34, 0.95), rgba(13, 17, 23, 0.95));
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 28px 24px;
      box-shadow: var(--shadow-lg);
      backdrop-filter: blur(16px);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .hero-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      height: 180px;
      background: radial-gradient(circle, var(--accent-green-glow) 0%, transparent 70%);
      filter: blur(40px);
      pointer-events: none;
    }

    .habit-title-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 6px;
    }

    .habit-heading {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.5px;
    }

    .habit-badge {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 20px;
      background: rgba(88, 166, 255, 0.15);
      color: var(--accent-blue);
      border: 1px solid rgba(88, 166, 255, 0.3);
    }

    .counter-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .ticker-grid {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin: 16px 0;
    }

    .ticker-block {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      min-width: 90px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .ticker-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 38px;
      font-weight: 700;
      color: var(--accent-green-bright);
      line-height: 1;
      text-shadow: 0 0 20px var(--accent-green-glow);
    }

    .ticker-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-top: 6px;
    }

    .ticker-separator {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-faint);
      margin-top: -16px;
    }

    /* Reset / Quick Controls */
    .controls-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 24px;
      flex-wrap: wrap;
    }

    .btn-control {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 9px 18px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-control:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }

    .btn-control.btn-skip {
      border-color: rgba(248, 81, 73, 0.4);
      color: #ff7b72;
    }

    .btn-control.btn-skip:hover {
      background: var(--accent-red-bg);
      border-color: var(--accent-red);
    }

    .btn-control.btn-complete {
      border-color: rgba(46, 160, 67, 0.4);
      color: var(--accent-green-bright);
    }

    .btn-control.btn-complete:hover {
      background: var(--accent-green-glow);
      border-color: var(--accent-green-bright);
    }

    /* Calendar Card */
    .section-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      backdrop-filter: blur(12px);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cal-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cal-nav-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
    }

    .cal-nav-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .cal-month-label {
      font-size: 15px;
      font-weight: 600;
      min-width: 140px;
      text-align: center;
      color: var(--text-main);
    }

    /* Calendar Grid */
    .cal-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }

    .cal-day-cell {
      aspect-ratio: 1;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cal-day-cell:hover {
      transform: scale(1.08);
      z-index: 2;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    .cal-day-cell.empty {
      background: transparent;
      border-color: transparent;
      cursor: default;
    }
    .cal-day-cell.empty:hover {
      transform: none;
      box-shadow: none;
    }

    .cal-day-cell.status-completed {
      background: var(--accent-green);
      border-color: var(--accent-green-bright);
      color: #ffffff;
      box-shadow: 0 0 10px var(--accent-green-glow);
    }

    .cal-day-cell.status-skipped {
      background: rgba(248, 81, 73, 0.15);
      border-color: rgba(248, 81, 73, 0.4);
      color: #ff7b72;
    }

    .cal-day-cell.status-future {
      background: rgba(255, 255, 255, 0.01);
      border: 1px dashed var(--border-color);
      color: var(--text-faint);
      cursor: not-allowed;
    }
    .cal-day-cell.status-future:hover {
      transform: none;
    }

    .cal-day-cell.status-before_start {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-faint);
      cursor: not-allowed;
    }
    .cal-day-cell.status-before_start:hover {
      transform: none;
    }

    .cal-day-cell.is-today {
      outline: 2px solid var(--accent-blue);
      outline-offset: 2px;
    }

    .cal-legend {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 18px;
      font-size: 12px;
      color: var(--text-muted);
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 4px;
    }

    /* Milestones & Tiers */
    .tiers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .tier-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .tier-card.unlocked {
      background: rgba(46, 160, 67, 0.1);
      border-color: rgba(46, 160, 67, 0.4);
    }

    .tier-card.current-goal {
      background: rgba(88, 166, 255, 0.08);
      border-color: var(--accent-blue);
      box-shadow: 0 0 16px rgba(88, 166, 255, 0.15);
    }

    .tier-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tier-badge-icon {
      font-size: 22px;
    }

    .tier-status-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
    }

    .tier-status-pill.unlocked {
      background: rgba(46, 160, 67, 0.25);
      color: var(--accent-green-bright);
    }

    .tier-status-pill.in-progress {
      background: rgba(88, 166, 255, 0.2);
      color: var(--accent-blue);
    }

    .tier-status-pill.locked {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
    }

    .tier-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
    }

    .tier-subtitle {
      font-size: 12px;
      color: var(--text-muted);
    }

    .tier-progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 4px;
    }

    .tier-progress-fill {
      height: 100%;
      background: var(--accent-green);
      border-radius: 4px;
      transition: width 0.4s ease;
    }

    .tier-card.current-goal .tier-progress-fill {
      background: var(--accent-blue);
    }

    /* All-Time Overview Cards */
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }

    .overview-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .overview-val {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-main);
      font-family: 'JetBrains Mono', monospace;
    }

    .overview-lbl {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Empty state */
    .empty-state-box {
      text-align: center;
      padding: 48px 24px;
      background: var(--bg-card);
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .empty-icon {
      font-size: 48px;
    }

    .empty-title {
      font-size: 20px;
      font-weight: 700;
    }

    .empty-desc {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 440px;
      line-height: 1.5;
    }

    .btn-cta {
      background: var(--accent-green);
      border: none;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: var(--radius-sm);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px var(--accent-green-glow);
      transition: all 0.2s ease;
    }

    .btn-cta:hover {
      background: var(--accent-green-bright);
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container" id="appRoot">
    <!-- Rendered dynamically by JS below -->
  </div>

  <script>
    const INITIAL_DATA = ${safeDataJson};
    let currentData = INITIAL_DATA;
    let viewingYear = INITIAL_DATA.calendar ? INITIAL_DATA.calendar.year : new Date().getFullYear();
    let viewingMonth = INITIAL_DATA.calendar ? INITIAL_DATA.calendar.month : (new Date().getMonth() + 1);

    function callHost(action, ...args) {
      if (window.callAmplenotePlugin) {
        window.callAmplenotePlugin(action, ...args);
      } else {
        console.log("[HabitStreak Host Call]", action, args);
      }
    }

    function render() {
      const root = document.getElementById("appRoot");
      const habits = currentData.habits || [];
      const activeHabit = currentData.activeHabit;

      if (!activeHabit || habits.length === 0) {
        root.innerHTML = \`
          <div class="empty-state-box">
            <div class="empty-icon">\u{1F331}</div>
            <div class="empty-title">Welcome to Beautiful Habit Streaks</div>
            <div class="empty-desc">
              Track your daily habits, build continuous streaks, and unlock milestones. Start by creating your first habit.
            </div>
            <div style="display: flex; gap: 12px; margin-top: 8px;">
              <button class="btn-cta" onclick="callHost('createHabit')">+ Create First Habit</button>
            </div>
          </div>
        \`;
        return;
      }

      const stats = currentData.stats || {};
      const tiers = currentData.tiers || [];
      const calendar = currentData.calendar || { days: [] };

      let tabsHtml = habits.map(h => {
        const isActive = h.id === activeHabit.id;
        return \`
          <button class="tab-btn \${isActive ? 'active' : ''}" onclick="callHost('selectHabit', '\${h.id}')">
            <span>\${escapeHtml(h.name)}</span>
          </button>
        \`;
      }).join("");

      // Milestones HTML
      let milestonesHtml = tiers.map(t => {
        let statusClass = t.isUnlocked ? "unlocked" : (t.isCurrentGoal ? "in-progress" : "locked");
        let statusText = t.isUnlocked ? "Unlocked \u2713" : (t.daysRemaining + "d left");
        return \`
          <div class="tier-card \${t.isUnlocked ? 'unlocked' : ''} \${t.isCurrentGoal ? 'current-goal' : ''}">
            <div class="tier-top-row">
              <span class="tier-badge-icon">\${t.badge}</span>
              <span class="tier-status-pill \${statusClass}">\${statusText}</span>
            </div>
            <div class="tier-title">\${t.title}</div>
            <div class="tier-subtitle">\${t.label} (\${t.days} days)</div>
            <div class="tier-progress-track">
              <div class="tier-progress-fill" style="width: \${t.progressPercent}%;"></div>
            </div>
          </div>
        \`;
      }).join("");

      // Calendar Days Grid
      let emptyCells = Array(calendar.firstDayWeekday).fill('<div class="cal-day-cell empty"></div>').join("");
      let dayCells = calendar.days.map(d => {
        let statusClass = "status-" + d.status;
        let todayClass = d.isToday ? "is-today" : "";
        let isClickable = d.status === "completed" || d.status === "skipped";
        let clickAttr = isClickable 
          ? \`onclick="callHost('toggleDay', '\${activeHabit.id}', '\${d.dateStr}', '\${d.status}')"\` 
          : "";

        return \`
          <div class="cal-day-cell \${statusClass} \${todayClass}" \${clickAttr} title="\${d.dateStr}: \${d.status}">
            <span>\${d.dayNumber}</span>
          </div>
        \`;
      }).join("");

      root.innerHTML = \`
        <!-- Tab Bar -->
        <div class="tab-bar-container">
          <div class="tabs-list">
            \${tabsHtml}
          </div>
          <div class="tab-actions">
            <button class="action-btn-sm primary" onclick="callHost('createHabit')">+ New Habit</button>
            <button class="action-btn-sm" title="Delete current habit" onclick="callHost('deleteHabit', '\${activeHabit.id}')">\u{1F5D1}\uFE0F</button>
          </div>
        </div>

        <!-- Hero Live Counter -->
        <div class="hero-card">
          <div class="habit-title-row">
            <h1 class="habit-heading">\${escapeHtml(activeHabit.name)}</h1>
            <span class="habit-badge">\${activeHabit.type === 'skip' ? 'Skip-Tracked (Quitly)' : 'Complete-Tracked'}</span>
          </div>
          <div class="counter-subtitle">\u{1F525} Current Continuous Streak</div>

          <div class="ticker-grid">
            <div class="ticker-block">
              <div class="ticker-number" id="tickDays">00</div>
              <div class="ticker-label">Days</div>
            </div>
            <div class="ticker-separator">:</div>
            <div class="ticker-block">
              <div class="ticker-number" id="tickHours">00</div>
              <div class="ticker-label">Hours</div>
            </div>
            <div class="ticker-separator">:</div>
            <div class="ticker-block">
              <div class="ticker-number" id="tickMins">00</div>
              <div class="ticker-label">Minutes</div>
            </div>
            <div class="ticker-separator">:</div>
            <div class="ticker-block">
              <div class="ticker-number" id="tickSecs">00</div>
              <div class="ticker-label">Seconds</div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="controls-row">
            <button class="btn-control btn-skip" onclick="callHost('skipToday', '\${activeHabit.id}')">
              \u{1F6AB} Skip Today
            </button>
            <button class="btn-control btn-complete" onclick="callHost('completeToday', '\${activeHabit.id}')">
              \u2705 Mark Done Today
            </button>
            <button class="btn-control" onclick="callHost('resetToDate', '\${activeHabit.id}')">
              \u{1F504} Reset / Backdate Skips
            </button>
          </div>
        </div>

        <!-- Monthly Calendar Widget -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title">\u{1F4C5} Interactive Calendar</div>
            <div class="cal-nav">
              <button class="cal-nav-btn" onclick="changeMonth(-1)">\u2039</button>
              <div class="cal-month-label">\${calendar.monthName} \${calendar.year}</div>
              <button class="cal-nav-btn" onclick="changeMonth(1)">\u203A</button>
            </div>
          </div>

          <div class="cal-weekdays">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div class="cal-grid">
            \${emptyCells}
            \${dayCells}
          </div>

          <div class="cal-legend">
            <div class="legend-item"><div class="legend-dot" style="background: var(--accent-green);"></div> Completed / Done</div>
            <div class="legend-item"><div class="legend-dot" style="background: rgba(248, 81, 73, 0.4);"></div> Skipped / Missed</div>
            <div class="legend-item"><div class="legend-dot" style="border: 1px dashed var(--border-color);"></div> Future</div>
          </div>
        </div>

        <!-- Tiered Goals (Quitly Milestones) -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title">\u{1F3AF} Tiered Goals & Milestones</div>
          </div>
          <div class="tiers-grid">
            \${milestonesHtml}
          </div>
        </div>

        <!-- All-Time Overview -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title">\u{1F4CA} All-Time Overview</div>
          </div>
          <div class="overview-grid">
            <div class="overview-card">
              <div class="overview-val">\${stats.currentStreak || 0}</div>
              <div class="overview-lbl">Current Streak (Days)</div>
            </div>
            <div class="overview-card">
              <div class="overview-val" style="color: var(--accent-gold);">\${stats.longestStreak || 0}</div>
              <div class="overview-lbl">Longest Streak (Days)</div>
            </div>
            <div class="overview-card">
              <div class="overview-val" style="color: var(--accent-blue);">\${stats.totalTrackedDays || 0}</div>
              <div class="overview-lbl">Total Days Tracked</div>
            </div>
            <div class="overview-card">
              <div class="overview-val" style="color: var(--accent-green-bright);">\${stats.completionRate || 0}%</div>
              <div class="overview-lbl">Completion Rate</div>
            </div>
          </div>
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
      callHost('navigateMonth', currentData.activeHabit.id, viewingYear, viewingMonth);
    }

    let tickerInterval = null;

    function startLiveTicker() {
      if (tickerInterval) clearInterval(tickerInterval);

      const stats = currentData.stats || {};
      const anchor = stats.streakAnchorTimestamp;

      function update() {
        const daysEl = document.getElementById("tickDays");
        const hoursEl = document.getElementById("tickHours");
        const minsEl = document.getElementById("tickMins");
        const secsEl = document.getElementById("tickSecs");

        if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

        if (!anchor || stats.currentStreak <= 0) {
          daysEl.textContent = "00";
          hoursEl.textContent = "00";
          minsEl.textContent = "00";
          secsEl.textContent = "00";
          return;
        }

        const now = Date.now();
        const diffSeconds = Math.max(0, Math.floor((now - anchor) / 1000));

        const days = Math.floor(diffSeconds / 86400);
        const hours = Math.floor((diffSeconds % 86400) / 3600);
        const mins = Math.floor((diffSeconds % 3600) / 60);
        const secs = diffSeconds % 60;

        daysEl.textContent = String(days).padStart(2, "0");
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
  const result = await app.prompt("Create New Habit", {
    inputs: [
      {
        type: "string",
        label: "Habit Name / Description",
        placeholder: "e.g., Daily Morning Meditation"
      },
      {
        type: "select",
        label: "Tracking Philosophy",
        options: [
          { label: "Skip-Tracked (Quitly Default: Considered done unless skipped)", value: TRACK_TYPES.SKIP },
          { label: "Complete-Tracked (Amplenote: Considered done only when marked)", value: TRACK_TYPES.COMPLETE }
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
  const [nameVal, typeVal, periodNVal, periodUnitVal] = result;
  if (!nameVal || !String(nameVal).trim()) {
    return;
  }
  const habitName = String(nameVal).trim();
  const habitType = typeVal || TRACK_TYPES.SKIP;
  const periodN = parseInt(periodNVal, 10) || 1;
  const periodUnit = periodUnitVal || INTERVAL_PERIODS.DAY;
  const newHabit = {
    id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: habitName,
    type: habitType,
    interval: { n: periodN, period: periodUnit },
    createdAt: getTodayString(),
    streakAnchor: (/* @__PURE__ */ new Date()).toISOString(),
    skips: [],
    completions: habitType === TRACK_TYPES.COMPLETE ? [getTodayString()] : []
  };
  const state = await loadState(app);
  state.habits.push(newHabit);
  state.activeHabitId = newHabit.id;
  await saveState(app, state);
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
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
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
  await saveState(app, state);
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
  if (!habit.skips.includes(todayStr)) {
    habit.skips.push(todayStr);
  }
  habit.completions = habit.completions.filter((d) => d !== todayStr);
  await saveState(app, state);
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
  habit.skips = habit.skips.filter((d) => d !== todayStr);
  if (!habit.completions.includes(todayStr)) {
    habit.completions.push(todayStr);
  }
  await saveState(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
  }
}
async function handleResetToDate(app, habitId) {
  if (!habitId) return;
  const todayStr = getTodayString();
  const result = await app.prompt("Reset Streak / Backdate Skips", {
    inputs: [
      {
        type: "string",
        label: "Start Skip Date (YYYY-MM-DD)",
        placeholder: todayStr,
        value: todayStr
      },
      {
        type: "checkbox",
        label: "Mark all days between this date and today as skipped",
        value: true
      }
    ]
  });
  if (!result || !Array.isArray(result)) {
    return;
  }
  const [startDateVal, confirmVal] = result;
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
  habit.skips = habit.skips || [];
  habit.completions = habit.completions || [];
  for (const d of rangeDates) {
    if (!habit.skips.includes(d)) {
      habit.skips.push(d);
    }
    habit.completions = habit.completions.filter((c) => c !== d);
  }
  await saveState(app, state);
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
  await saveState(app, state);
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
  await saveState(app, state);
  if (app.context && typeof app.context.renderEmbed === "function") {
    await app.context.renderEmbed();
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
        case "navigateMonth":
          if (app.context && typeof app.context.updateEmbedArgs === "function") {
            await app.context.updateEmbedArgs({ year: args[2], month: args[3] });
          } else if (app.context && typeof app.context.renderEmbed === "function") {
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
    let activeHabit = null;
    if (habits.length > 0) {
      activeHabit = habits.find((h) => h.id === state.activeHabitId) || habits[0];
    }
    const embedOpts = args && args.length > 0 && typeof args[0] === "object" ? args[0] : {};
    const now = /* @__PURE__ */ new Date();
    const viewingYear = embedOpts.year || now.getFullYear();
    const viewingMonth = embedOpts.month || now.getMonth() + 1;
    if (!activeHabit) {
      return buildDashboardTemplate({
        habits: [],
        activeHabit: null,
        stats: null,
        tiers: [],
        calendar: null
      });
    }
    const stats = calculateHabitStats(activeHabit);
    const tiers = calculateTierProgress(stats.currentStreak);
    const calendar = generateMonthCalendar(activeHabit, viewingYear, viewingMonth);
    return buildDashboardTemplate({
      habits,
      activeHabit,
      stats,
      tiers,
      calendar
    });
  }
};
var habit_streak_default = plugin;


return habit_streak_default;
})()