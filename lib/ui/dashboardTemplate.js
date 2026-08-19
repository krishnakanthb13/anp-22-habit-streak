import { PRESET_TEMPLATES, QUITLY_TEMPLATES, AMPLENOTE_TEMPLATES, COLOR_THEMES } from "../constants.js";

/**
 * Builds the complete Quitly-styled HTML/CSS/JS template for the Habit Streak embed dashboard.
 * Includes Main Screen segmented views, Weekly Frequency Bar Chart, Settings Drawer,
 * Categorized Templates (Positive vs Negative), and context-aware action buttons.
 * 
 * @param {object} dashboardData - Complete calculated state for rendering.
 * @returns {string} - Complete HTML string.
 */
export function buildDashboardTemplate(dashboardData) {
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
  <title>Quitly Habit Streaks</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --shell-bg: #0b0f19;
      --card-container-bg: #ffffff;
      --card-container-dark: #121826;
      --text-main: #0f172a;
      --text-sub: #64748b;
      --text-light: #f8fafc;
      --quitly-blue-gradient: linear-gradient(180deg, #1d84e8 0%, #1e40af 100%);
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
      color: #ffffff;
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
      background: var(--shell-bg);
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
      color: #ffffff;
    }

    .btn-header-round {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #ffffff;
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

    /* Main Container (White Rounded Sheet like Quitly) */
    .quitly-white-sheet {
      background: #ffffff;
      color: #0f172a;
      border-radius: var(--radius-xl);
      padding: 20px 16px;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Section Category Headings */
    .section-category-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 4px 0;
    }

    /* Quitly Colorful Counter Pill Cards (Image 2) */
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

    /* Single Counter Hero View (Image 1) */
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

    /* Laurel Tier Card (Image 1) */
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
      color: #64748b;
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
      background: #f1f5f9;
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

    /* 3-Column Goals Checklist Grid (Image 1) */
    .goals-section-title {
      font-size: 13px;
      font-weight: 700;
      color: #64748b;
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
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #334155;
    }

    .goal-check-box.unlocked {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
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
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #1e293b;
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
      background: #e2e8f0;
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

    /* Yearly / Monthly Activity Grid (Image 4) */
    .activity-section-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      padding: 16px;
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
      background: #e2e8f0;
      color: #64748b;
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
      color: #334155;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
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
      color: #64748b;
    }

    .weekly-count-lbl {
      font-size: 10px;
      font-weight: 800;
      color: #0f172a;
    }

    /* Templates Modal / Section (Image 3) */
    .templates-shelf-card {
      background: #ffffff;
      border-radius: var(--radius-xl);
      padding: 20px 16px;
      color: #0f172a;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .templates-category-title {
      font-size: 13px;
      font-weight: 800;
      color: #334155;
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
  </style>
</head>
<body>
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

    function callHost(action, ...args) {
      if (window.callAmplenotePlugin) {
        window.callAmplenotePlugin(action, ...args);
      } else {
        console.log("[Quitly Host Call]", action, args);
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
      return (habit && habit.type === 'skip' ? '⚡' : '📝');
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
      const root = document.getElementById("appRoot");
      const habits = currentData.habits || [];
      const summary = currentData.summary || {};
      const activeHabit = habits.find(h => h.id === selectedHabitId) || habits[0] || null;

      // 1. SETTINGS VIEW
      if (currentView === "settings") {
        root.innerHTML = \`
          <div class="app-top-header">
            <button class="btn-header-round" onclick="switchView('main')">✕</button>
            <span class="header-title-text">Settings & Data</span>
            <div style="width: 40px;"></div>
          </div>

          <div class="quitly-white-sheet">
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              ⚙️ Plugin Configuration
            </div>
            
            <div class="activity-section-card">
              <div style="font-weight: 800; font-size: 14px; margin-bottom: 6px;">🔄 Sync Status</div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.4; margin-bottom: 12px;">
                Your streak logs are stored in the data note with tag <code>-reports/-habit-streak</code>.
              </p>
              <button class="btn-create-custom" style="padding: 10px; font-size: 13px;" onclick="callHost('refreshData')">
                🔄 Force Refresh from Note
              </button>
            </div>

            <div class="activity-section-card">
              <div style="font-weight: 800; font-size: 14px; margin-bottom: 6px;">📊 Total Overview</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                <div style="background: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 18px; font-weight: 800; color: #2563eb;">\${habits.length}</div>
                  <div style="color: #64748b;">Total Counters</div>
                </div>
                <div style="background: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 18px; font-weight: 800; color: #10b981;">\${summary.bestOverallStreak || 0}d</div>
                  <div style="color: #64748b;">Best Record</div>
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
            <button class="btn-header-round" onclick="switchView('main')">✕</button>
            <span class="header-title-text">New Counter</span>
            <div style="width: 40px;"></div>
          </div>

          <div class="filter-segment-bar">
            <button class="filter-tab-btn \${templateFilter === 'all' ? 'active' : ''}" onclick="setTemplateFilter('all')">All</button>
            <button class="filter-tab-btn \${templateFilter === 'quit' ? 'active' : ''}" onclick="setTemplateFilter('quit')">🛡️ Quitting</button>
            <button class="filter-tab-btn \${templateFilter === 'positive' ? 'active' : ''}" onclick="setTemplateFilter('positive')">🎯 Positive Habits</button>
          </div>

          <div class="templates-shelf-card">
            <button class="btn-create-custom" onclick="callHost('createHabit')">+ Create a Custom Counter</button>

            \${(templateFilter === 'all' || templateFilter === 'quit') ? \`
              <div class="templates-category-title">
                <span>🛡️ Break Bad Habits & Sobriety (Quitly Style)</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${quitlyListHtml}
              </div>
            \` : ''}

            \${(templateFilter === 'all' || templateFilter === 'positive') ? \`
              <div class="templates-category-title" style="margin-top: 14px;">
                <span>🎯 Build Positive Daily Habits (Amplenote Style)</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${amplenoteListHtml}
              </div>
            \` : ''}
          </div>
        \`;
        return;
      }

      // 3. MAIN COUNTERS LIST VIEW (Image 2) - Segmented into Quitting vs Positive
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
                  \${isQuit ? '🛡️ Auto-Done' : '🎯 Check-In'}
                </span>
                <span class="counter-card-arrow">›</span>
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
                <span>🛡️ Bad Habits to Break (Abstinence)</span>
                <span style="font-size: 11px; color: #64748b;">\${quittingHabits.length}</span>
              </div>
              \${quittingHabits.map((h, i) => renderHabitCard(h, i)).join("")}
            \`;
          }

          if (positiveHabits.length > 0) {
            displayCardsHtml += \`
              <div class="section-category-header" style="margin-top: 10px;">
                <span>🎯 Positive Habits to Build (Daily Practice)</span>
                <span style="font-size: 11px; color: #64748b;">\${positiveHabits.length}</span>
              </div>
              \${positiveHabits.map((h, i) => renderHabitCard(h, i + quittingHabits.length)).join("")}
            \`;
          }
        }

        root.innerHTML = \`
          <div class="app-top-header">
            <button class="btn-header-round" title="Settings & Data" onclick="switchView('settings')">⚙️</button>
            <span class="header-title-text">Quitly Streaks</span>
            <button class="btn-header-round" title="Add Counter" onclick="switchView('templates')">+</button>
          </div>

          <div class="filter-segment-bar">
            <button class="filter-tab-btn \${mainFilter === 'all' ? 'active' : ''}" onclick="setMainFilter('all')">
              All (\${habits.length})
            </button>
            <button class="filter-tab-btn \${mainFilter === 'quit' ? 'active' : ''}" onclick="setMainFilter('quit')">
              🛡️ Quitting (\${quittingHabits.length})
            </button>
            <button class="filter-tab-btn \${mainFilter === 'positive' ? 'active' : ''}" onclick="setMainFilter('positive')">
              🎯 Positive (\${positiveHabits.length})
            </button>
          </div>

          <div class="quitly-white-sheet">
            \${habits.length > 0 ? displayCardsHtml : \`
              <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 44px; margin-bottom: 12px;">🌱</div>
                <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 6px;">No counters yet</h3>
                <p style="font-size: 13px; color: #64748b; margin-bottom: 18px;">Choose a template or create your custom habit streak counter.</p>
                <button class="btn-create-custom" onclick="switchView('templates')">+ Choose a Template</button>
              </div>
            \`}
          </div>
        \`;
        return;
      }

      // 4. SINGLE COUNTER DETAILED VIEW (Image 1, 4, 5)
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
            🛡️ Clean Today (Auto-Tracked)
          </div>
        \`;

        actionsClusterHtml = \`
          <div class="action-pills-cluster">
            <button class="btn-quitly-action btn-skip-danger" onclick="callHost('skipToday', '\${activeHabit.id}')">
              🚨 Log Slip / Reset Today
            </button>
            <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
              🔄 Backdate Relapse Date with Note
            </button>
          </div>
        \`;

        philosophyFooterHtml = \`
          <div class="activity-section-card" style="margin-top: 12px; background: #f0fdf4; border-color: #bbf7d0;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px; color: #166534; margin-bottom: 4px;">
              <span>🛡️ Quitly Abstinence Philosophy (Quitting a Bad Habit)</span>
            </div>
            <p style="font-size: 12px; color: #15803d; line-height: 1.4;">
              This is a quitting counter. Days count up automatically as long as you stay clean. You only need to interact when you experience a slip or relapse to reset the counter with an optional reflection note.
            </p>
          </div>
        \`;
      } else {
        // Amplenote / Positive Action Habit
        statusBadgeHtml = isCompletedToday ? \`
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
            ✅ Completed for Today!
          </div>
        \` : \`
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); color: #6366f1; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
            ⏳ Today Pending Check-In
          </div>
        \`;

        actionsClusterHtml = isCompletedToday ? \`
          <div class="action-pills-cluster">
            <button class="btn-quitly-action btn-done-success" onclick="callHost('completeToday', '\${activeHabit.id}')" title="Log additional completion">
              + Log Additional Done (+1)
            </button>
            <button class="btn-quitly-action" onclick="callHost('skipToday', '\${activeHabit.id}')">
              ↩️ Undo / Mark Skipped
            </button>
            <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
              🔄 Backfill Dates with Note
            </button>
          </div>
        \` : \`
          <div class="action-pills-cluster">
            <button class="btn-quitly-action btn-done-success" onclick="callHost('completeToday', '\${activeHabit.id}')">
              ✅ Mark Done Today
            </button>
            <button class="btn-quitly-action btn-skip-danger" onclick="callHost('skipToday', '\${activeHabit.id}')">
              🚫 Log Missed / Skip Today
            </button>
            <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
              🔄 Backfill Dates with Note
            </button>
          </div>
        \`;

        philosophyFooterHtml = \`
          <div class="activity-section-card" style="margin-top: 12px; background: #eef2ff; border-color: #c7d2fe;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px; color: #3730a3; margin-bottom: 4px;">
              <span>🎯 Amplenote Intentional Action Philosophy (Positive Habit)</span>
            </div>
            <p style="font-size: 12px; color: #4338ca; line-height: 1.4;">
              This is a positive action habit. Your streak grows by intentionally completing and checking in each day. Tap <strong>"Mark Done Today"</strong> whenever you finish your practice. You can also log multiple sessions per day.
            </p>
          </div>
        \`;
      }

      // 3-Column Goals Checklist Grid (Image 1)
      let goalsHtml = tiers.map(t => {
        const isUnlocked = t.isUnlocked;
        return \`
          <div class="goal-check-box \${isUnlocked ? 'unlocked' : ''}">
            <span class="goal-check-icon">\${isUnlocked ? '☑' : '🔒'}</span>
            <div class="goal-label-wrap">
              <span class="goal-days-text">\${t.label}</span>
              <span class="goal-tier-text">Tier \${t.tierNum || t.days}</span>
            </div>
          </div>
        \`;
      }).join("");

      // Calendar mini-dots (Image 4)
      let emptyDots = Array(calendar.firstDayWeekday).fill('<div class="day-mini-dot empty"></div>').join("");
      let dayDots = calendar.days.map(d => {
        let cls = (d.status === 'completed') ? 'done' : ((d.status === 'skipped') ? 'skip' : '');
        let isClickable = d.status === "completed" || d.status === "skipped";
        let clickAttr = isClickable 
          ? \`onclick="callHost('toggleDay', '\${activeHabit.id}', '\${d.dateStr}', '\${d.status}')"\` 
          : "";
        return \`<div class="day-mini-dot \${cls}" \${clickAttr} title="\${d.dateStr}: \${d.status}">\${d.dayNumber}</div>\`;
      }).join("");

      // Weekly frequency bars (Quitly Image 4)
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
        <!-- Hero Header (Image 1) -->
        <div class="single-counter-hero \${grad}">
          <div class="single-hero-nav">
            <button class="btn-header-round" onclick="switchView('main')">‹</button>
            <div style="display: flex; gap: 8px;">
              <button class="btn-header-round" title="Edit Settings" onclick="callHost('editHabit', '\${activeHabit.id}')">✏️</button>
              <button class="btn-header-round" title="Delete Counter" onclick="callHost('deleteHabit', '\${activeHabit.id}')">🗑️</button>
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

        <!-- White Sheet Below with Tier Laurel, Goals Grid, Actions, Calendar (Image 1 & 4) -->
        <div class="quitly-white-sheet">
          <div style="text-align: center;">
            \${statusBadgeHtml}
          </div>

          <!-- Tier Laurel Header -->
          <div class="tier-laurel-card">
            <div class="laurel-title">
              <span>🌿</span>
              <span>Tier \${activeTier ? activeTier.tierNum : 1}</span>
              <span>🌿</span>
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

          <!-- Weekly Repeatingness Frequency Bar Chart (Image 4) -->
          <div class="activity-section-card">
            <div class="activity-header">
              <span style="font-size: 14px; font-weight: 800; color: #1e293b;">📊 7-Day Frequency</span>
              <span style="font-size: 12px; font-weight: 700; color: #2563eb;">\${weeklyFreq.totalWeekLogs} total this week</span>
            </div>
            <div class="weekly-bars-container">
              \${weeklyBarsHtml}
            </div>
          </div>

          <!-- Yearly / Monthly Activity Log (Image 4) -->
          <div class="activity-section-card">
            <div class="activity-header">
              <span style="font-size: 14px; font-weight: 800; color: #1e293b;">📅 \${calendar.monthName} \${calendar.year}</span>
              <div style="display: flex; gap: 4px;">
                <button class="btn-header-round" style="width: 28px; height: 28px; background: #e2e8f0; color: #1e293b;" onclick="changeMonth(-1)">‹</button>
                <button class="btn-header-round" style="width: 28px; height: 28px; background: #e2e8f0; color: #1e293b;" onclick="changeMonth(1)">›</button>
              </div>
            </div>

            <div class="cal-grid-mini">
              \${emptyDots}
              \${dayDots}
            </div>

            <div class="resets-counter-bar">
              <span style="color: #64748b;">Count of Resets / Skips</span>
              <span style="color: #0f172a; font-weight: 800;">\${stats.skippedDays || 0} times</span>
            </div>
          </div>

          <!-- Reset History Log with Notes (Quitly Image 5) -->
          <div class="activity-section-card" style="margin-top: 12px;">
            <div class="activity-header">
              <span style="font-size: 14px; font-weight: 800; color: #1e293b;">📝 Reset & Reflection History</span>
              <span style="font-size: 12px; font-weight: 700; color: #64748b;">\${(activeHabit.resetLogs || []).length} logs</span>
            </div>
            \${(activeHabit.resetLogs && activeHabit.resetLogs.length > 0) ? \`
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${activeHabit.resetLogs.slice().reverse().map(log => \`
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; font-weight: 700; color: #1e293b; margin-bottom: 2px;">
                      <span>\${log.streakLength || 0} days streak before reset</span>
                      <span style="color: #64748b;">\${log.date}</span>
                    </div>
                    <div style="color: #475569; font-style: italic;">"\${escapeHtml(log.note || 'Reset logged')}"</div>
                  </div>
                \`).join("")}
              </div>
            \` : \`
              <div style="font-size: 12px; color: #64748b; text-align: center; padding: 8px 0;">
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
