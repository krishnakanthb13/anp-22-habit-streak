import { PRESET_TEMPLATES, QUITLY_TEMPLATES, AMPLENOTE_TEMPLATES, COLOR_THEMES } from "../constants.js";

/**
 * Builds the complete HTML/CSS/JS template for the Habit Streaks embed dashboard.
 * Includes Header "Habit Streaks", 5 Appearance Themes (Midnight, Glassmorphism, Dark, Light, Neon),
 * Main Screen segmented views, Weekly Frequency Bar Chart, Settings Drawer,
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
      padding: 9px 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid var(--border-color);
      background: var(--card-subtle-bg);
      color: var(--text-main);
      text-align: left;
      transition: all 0.15s ease;
      overflow: hidden;
    }

    .goal-check-box.unlocked {
      background: rgba(59, 130, 246, 0.15) !important;
      border-color: #3b82f6 !important;
      color: #3b82f6 !important;
    }

    .goal-check-icon {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 14px;
    }

    .goal-label-wrap {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
      justify-content: center;
      min-width: 0;
    }

    .goal-days-text {
      font-weight: 800;
      font-size: 11.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .goal-tier-text {
      font-size: 9.5px;
      font-weight: 600;
      opacity: 0.75;
      white-space: nowrap;
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
      padding: 16px 14px;
      color: var(--text-main);
    }

    .activity-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      gap: 8px;
    }

    .cal-month-title-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.2px;
    }

    .cal-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cal-nav-buttons {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .btn-month-nav {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--card-container-bg);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-month-nav:hover {
      background: var(--card-subtle-bg);
      border-color: #94a3b8;
      transform: translateY(-1px);
    }

    .btn-cal-action {
      padding: 5px 12px;
      font-size: 11.5px;
      font-weight: 700;
      border-radius: 20px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
      background: var(--card-container-bg);
      color: var(--text-main);
    }

    .btn-cal-action:hover {
      border-color: #3b82f6;
      color: #2563eb;
    }

    .btn-cal-action.btn-cal-save {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      border-color: #059669 !important;
      color: #ffffff !important;
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    .btn-cal-action.btn-cal-save:hover {
      opacity: 0.92;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .btn-cal-action.btn-cal-cancel {
      background: rgba(244, 63, 94, 0.1) !important;
      border-color: rgba(244, 63, 94, 0.25) !important;
      color: #e11d48 !important;
    }

    .btn-cal-action.btn-cal-cancel:hover {
      background: rgba(244, 63, 94, 0.18) !important;
    }

    /* Edit Mode Banner */
    .cal-edit-active-banner {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.04));
      border: 1px solid rgba(37, 99, 235, 0.22);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 11.5px;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .cal-edit-banner-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cal-staged-badge {
      background: #2563eb;
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.2px;
    }

    .cal-quick-actions-row {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .btn-cal-quick {
      background: var(--card-container-bg);
      border: 1px solid var(--border-color);
      color: var(--text-sub);
      font-size: 10.5px;
      font-weight: 700;
      padding: 4px 9px;
      border-radius: 7px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.12s ease;
    }

    .btn-cal-quick:hover {
      color: var(--text-main);
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.08);
    }

    /* Weekday Column Headers */
    .cal-weekdays-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
      margin-bottom: 8px;
      text-align: center;
      font-size: 10.5px;
      font-weight: 800;
      color: var(--text-sub);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      opacity: 0.75;
    }

    /* Calendar Day Grid */
    .cal-grid-mini {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
      margin-bottom: 14px;
    }

    .day-mini-dot {
      aspect-ratio: 1;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.04);
      color: var(--text-sub);
      transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease, border-color 0.15s ease;
      position: relative;
      user-select: none;
    }

    .day-mini-dot:hover:not(.future):not(.empty) {
      transform: translateY(-1px) scale(1.06);
      z-index: 2;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    .day-mini-dot.done {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 2px 5px rgba(16, 185, 129, 0.25);
    }

    .day-mini-dot.skip {
      background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 2px 5px rgba(244, 63, 94, 0.25);
    }

    .day-mini-dot.before-start {
      background: rgba(148, 163, 184, 0.08);
      color: var(--text-sub);
      opacity: 0.45;
    }

    .day-mini-dot.future {
      background: transparent;
      color: var(--text-sub);
      opacity: 0.22;
      cursor: default;
    }

    .day-mini-dot.is-today {
      box-shadow: 0 0 0 2px #3b82f6, 0 2px 6px rgba(59, 130, 246, 0.35) !important;
      font-weight: 900;
    }

    /* Edit mode behavior on grid */
    .cal-grid-mini.is-editing .day-mini-dot:not(.future):not(.empty) {
      cursor: pointer;
    }

    .cal-grid-mini.is-editing .day-mini-dot:not(.future):not(.empty):hover {
      transform: translateY(-2px) scale(1.08);
      box-shadow: 0 0 0 2px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.35);
      z-index: 3;
    }

    .day-mini-dot.empty {
      background: transparent !important;
      cursor: default !important;
      box-shadow: none !important;
    }

    .day-multi-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 9px;
      font-weight: 900;
      line-height: 1;
      background: rgba(0, 0, 0, 0.48);
      color: #ffffff;
      padding: 1.5px 4px;
      border-radius: 4px;
      pointer-events: none;
      letter-spacing: -0.2px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    }

    /* Resets Counter Bottom Bar */
    .resets-counter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      border-top: 1px solid var(--border-color);
      font-size: 11.5px;
      color: var(--text-main);
    }

    .cal-stats-pills-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-weight: 600;
      font-size: 11.5px;
      color: var(--text-main);
      white-space: nowrap;
    }

    .stat-pill-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
    }

    .stat-pill-dot.clean {
      background: #10b981;
    }

    .stat-pill-dot.missed {
      background: #f43f5e;
    }

    .stat-resets-label {
      font-size: 11px;
      color: var(--text-sub);
      font-weight: 600;
      white-space: nowrap;
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
      checkCircle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="10"></circle><polyline points="16 9 10.5 15 8 12.5"></polyline></svg>',
      check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
      plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
      externalLink: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
      settings: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
      edit: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
      trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
      refresh: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
      undo: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>',
      reset: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>',
      import: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
      calendar: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      chart: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
      shield: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      target: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
      heart: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display:inline-block;vertical-align:middle;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
      save: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>'
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

        // Optimistically update trackingStartDate if earlier dates were recorded
        const allRecorded = [...editCompletions, ...editSkips].filter(Boolean).sort();
        if (allRecorded.length > 0) {
          const earliest = allRecorded[0];
          const currentStart = (activeHabit.trackingStartDate && activeHabit.trackingStartDate.length > 0)
            ? activeHabit.trackingStartDate
            : (activeHabit.createdAt ? activeHabit.createdAt.split("T")[0] : earliest);
          if (earliest < currentStart) {
            activeHabit.trackingStartDate = earliest;
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
        // Direct click in normal view:
        // 1. Optimistic instant local update
        if (!activeHabit.skips) activeHabit.skips = [];
        if (!activeHabit.completions) activeHabit.completions = [];

        if (currentStatus === "completed") {
          // Toggle to skipped
          activeHabit.completions = activeHabit.completions.filter(d => d !== dateStr);
          if (!activeHabit.skips.includes(dateStr)) activeHabit.skips.push(dateStr);
        } else {
          // Toggle to completed
          activeHabit.skips = activeHabit.skips.filter(d => d !== dateStr);
          if (!activeHabit.completions.includes(dateStr)) activeHabit.completions.push(dateStr);
        }

        // Optimistically update trackingStartDate if earlier dates were recorded
        const allRecorded = [...activeHabit.completions, ...activeHabit.skips].filter(Boolean).sort();
        if (allRecorded.length > 0) {
          const earliest = allRecorded[0];
          const currentStart = (activeHabit.trackingStartDate && activeHabit.trackingStartDate.length > 0)
            ? activeHabit.trackingStartDate
            : (activeHabit.createdAt ? activeHabit.createdAt.split("T")[0] : earliest);
          if (earliest < currentStart) {
            activeHabit.trackingStartDate = earliest;
          }
        }

        // 2. Instant re-render for zero-latency feedback and reliable subsequent clicks (on/off/on)
        render();

        // 3. Dispatch to host
        callHost('toggleDay', activeHabit.id, dateStr, currentStatus);
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
      return '🔥';
    }

    function getHabitCleanName(habit) {
      if (!habit || !habit.name) return "";
      if (habit.icon) return habit.name;
      const emojiMatch = habit.name.match(/^[\p{Emoji}\u200d]+/u);
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
      if (dateStr > todayStr) return "future";
      const skipsList = (isCalendarEditMode && editSkips) ? editSkips : (habit.skips || []);
      const completionsList = (isCalendarEditMode && editCompletions) ? editCompletions : (habit.completions || []);
      const skips = new Set(skipsList);
      const completions = new Set(completionsList);

      if (skips.has(dateStr)) return "skipped";
      if (completions.has(dateStr)) return "completed";

      const habitStart = habit.trackingStartDate || (habit.createdAt ? habit.createdAt.split("T")[0] : todayStr);
      if (dateStr < habitStart) return "before_start";

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
            <div style="font-size: 15px; font-weight: 800; margin-bottom: 2px; display: flex; align-items: center; gap: 6px;">
              \${ICONS.settings} <span>Appearance & Themes</span>
            </div>
            <p style="font-size: 12px; color: var(--text-sub); margin-bottom: 10px;">
              Choose your visual theme. Changes update in real-time.
            </p>

            <div class="theme-picker-grid">
              <button class="theme-option-btn \${activeTheme === 'midnight' ? 'active' : ''}" onclick="applyTheme('midnight')">
                Midnight (Default)
              </button>
              <button class="theme-option-btn \${activeTheme === 'glass' ? 'active' : ''}" onclick="applyTheme('glass')">
                Frosted Glass
              </button>
              <button class="theme-option-btn \${activeTheme === 'dark' ? 'active' : ''}" onclick="applyTheme('dark')">
                Pure Dark
              </button>
              <button class="theme-option-btn \${activeTheme === 'light' ? 'active' : ''}" onclick="applyTheme('light')">
                Light Clean
              </button>
              <button class="theme-option-btn \${activeTheme === 'neon' ? 'active' : ''}" onclick="applyTheme('neon')" style="grid-column: span 2;">
                Cyberpunk Neon
              </button>
            </div>
            
            <div class="activity-section-card" style="margin-top: 12px;">
              <div style="font-weight: 800; font-size: 14px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">\${ICONS.refresh} Sync Status</div>
              <p style="font-size: 12px; color: var(--text-sub); line-height: 1.4; margin-bottom: 12px;">
                Your streak logs are stored in the data note with tag <code>-reports/-habit-streak</code>.
              </p>
              <button class="btn-create-custom" style="padding: 10px; font-size: 13px;" onclick="callHost('refreshData')">
                \${ICONS.refresh} Force Refresh from Note
              </button>
            </div>

            <div class="activity-section-card">
              <div style="font-weight: 800; font-size: 14px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">\${ICONS.chart} Total Overview</div>
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
                \${ICONS.heart}
                <span>Support the Developer</span>
              </div>
              <p style="font-size: 12px; color: var(--text-sub); line-height: 1.45; margin-bottom: 12px;">
                If Habit Streak helps you stay focused, maintain your streaks, and build positive daily momentum, consider supporting future development and new features!
              </p>
              <a href="https://krishnakanthb13.github.io/S/" target="_blank" rel="noopener noreferrer" class="btn-support-dev">
                <span style="display: inline-flex; align-items: center; gap: 6px;">\${ICONS.heart} Support Development</span>
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

      // 2. TEMPLATES VIEW - Categorized into Quitting and Building
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
            <button class="filter-tab-btn \${templateFilter === 'quit' ? 'active' : ''}" onclick="setTemplateFilter('quit')">Quitting</button>
            <button class="filter-tab-btn \${templateFilter === 'positive' ? 'active' : ''}" onclick="setTemplateFilter('positive')">Building</button>
          </div>

          <div class="templates-shelf-card">
            <button class="btn-create-custom" onclick="createCustomHabit()">+ Create a Custom Counter</button>
            <button class="btn-quitly-action" style="width: 100%; justify-content: center; margin-top: 6px; margin-bottom: 4px;" onclick="importTasksFromNote()">
              \${ICONS.import} Import Tasks from Note
            </button>

            <details class="guide-accordion">
              <summary>
                <span style="display: flex; align-items: center; gap: 6px;">
                  \${ICONS.target} <span>How to Add & Track Habits</span>
                </span>
                <span style="display: flex; align-items: center; opacity: 0.75;">\${ICONS.chevronDown}</span>
              </summary>
              <div class="guide-accordion-body">
                <strong>1. Choose Source:</strong> Pick a preset template below, create a custom counter, or import tasks from any note.<br>
                <strong>2. Dual Tracking Philosophy:</strong><br>
                &nbsp;&nbsp;• <strong>Quitting (Bad Habits):</strong> Days count up continuously unless you log a reset/slip.<br>
                &nbsp;&nbsp;• <strong>Building (Good Habits):</strong> Requires daily intentional check-in to build your streak.<br>
                <strong>3. Interactive Tracking:</strong> Tap any calendar day to toggle status or log reflections on resets.
              </div>
            </details>

            \${(templateFilter === 'all' || templateFilter === 'quit') ? \`
              <div class="templates-category-title">
                <span>Bad habits to quit</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${quitlyListHtml}
              </div>
            \` : ''}

            \${(templateFilter === 'all' || templateFilter === 'positive') ? \`
              <div class="templates-category-title" style="margin-top: 14px;">
                <span>Good habits to build</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${amplenoteListHtml}
              </div>
            \` : ''}
          </div>
        \`;
        return;
      }

      // 3. MAIN COUNTERS LIST VIEW - Segmented into Quitting vs Building
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
                  \${isQuit ? 'Quitting' : 'Building'}
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
                <span>Bad habits to quit</span>
                <span style="font-size: 11px; color: var(--text-sub);">\${quittingHabits.length}</span>
              </div>
              \${quittingHabits.map((h, i) => renderHabitCard(h, i)).join("")}
            \`;
          }

          if (positiveHabits.length > 0) {
            displayCardsHtml += \`
              <div class="section-category-header" style="margin-top: 10px;">
                <span>Good habits to build</span>
                <span style="font-size: 11px; color: var(--text-sub);">\${positiveHabits.length}</span>
              </div>
              \${positiveHabits.map((h, i) => renderHabitCard(h, i + quittingHabits.length)).join("")}
            \`;
          }
        }

        root.innerHTML = \`
          <div class="app-top-header">
            <button class="btn-header-round" title="Settings & Themes" onclick="switchView('settings')">\${ICONS.settings}</button>
            <span class="header-title-text">Habit Streaks</span>
            <button class="btn-header-round" title="Add Counter" onclick="switchView('templates')">\${ICONS.plus}</button>
          </div>

          <div class="filter-segment-bar">
            <button class="filter-tab-btn \${mainFilter === 'all' ? 'active' : ''}" onclick="setMainFilter('all')">
              All (\${habits.length})
            </button>
            <button class="filter-tab-btn \${mainFilter === 'quit' ? 'active' : ''}" onclick="setMainFilter('quit')">
              Quitting (\${quittingHabits.length})
            </button>
            <button class="filter-tab-btn \${mainFilter === 'positive' ? 'active' : ''}" onclick="setMainFilter('positive')">
              Building (\${positiveHabits.length})
            </button>
          </div>

          <div class="quitly-white-sheet">
            \${habits.length > 0 ? displayCardsHtml : \`
              <div style="text-align: center; padding: 36px 18px;">
                <div style="font-size: 32px; margin-bottom: 12px; opacity: 0.8;">\${ICONS.target}</div>
                <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 6px;">No counters yet</h3>
                <p style="font-size: 13px; color: var(--text-sub); margin-bottom: 20px; line-height: 1.45; max-width: 320px; margin-left: auto; margin-right: auto;">
                  Track quitting goals continuously or build daily positive habits with real-time sub-second tickers & interactive calendars.
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px; max-width: 280px; margin: 0 auto;">
                  <button class="btn-create-custom" onclick="switchView('templates')">+ Choose a Template</button>
                  <button class="btn-quitly-action" style="justify-content: center;" onclick="callHost('importFromNote')">\${ICONS.import} Import Tasks from Note</button>
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

      const todaySlipsCount = Math.max(
        (activeHabit.events || []).filter(e => (e.type === 'skip' || e.type === 'slip' || e.type === 'reset') && (e.date === todayStr || (e.timestamp && e.timestamp.split('T')[0] === todayStr))).length,
        (activeHabit.resetLogs || []).filter(rl => (rl.date === todayStr || (rl.timestamp && rl.timestamp.split('T')[0] === todayStr))).length,
        isSlipToday ? 1 : 0
      );
      const todayDoneCount = (activeHabit.events || []).filter(e => (e.type === 'done' || e.type === 'complete') && (e.date === todayStr || (e.timestamp && e.timestamp.split('T')[0] === todayStr))).length;

      // Contextual Action Buttons & Phrasing
      let actionsClusterHtml = "";
      let statusBadgeHtml = "";
      let philosophyFooterHtml = "";

      if (isQuitly) {
        // Quitting / Bad Habit / Abstinence
        if (isSlipToday) {
          statusBadgeHtml = \`
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
              \${ICONS.undo} \${todaySlipsCount > 1 ? todaySlipsCount + ' Slips Logged Today' : 'Reset Logged Today'}
            </div>
          \`;

          actionsClusterHtml = \`
            <div class="action-pills-cluster">
              <button class="btn-quitly-action btn-skip-danger" onclick="callHost('skipToday', '\${activeHabit.id}')" title="Log additional slip for today">
                \${ICONS.plus} Log Additional Slip (+1)
              </button>
              <button class="btn-quitly-action btn-done-success" onclick="callHost('undoToday', '\${activeHabit.id}')">
                \${ICONS.undo} Undo Slip / Mark Clean Today
              </button>
              <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
                \${ICONS.reset} Reset Counter on Date
              </button>
            </div>
          \`;
        } else {
          statusBadgeHtml = \`
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
              \${ICONS.shield} Clean Today
            </div>
          \`;

          actionsClusterHtml = \`
            <div class="action-pills-cluster">
              <button class="btn-quitly-action btn-skip-danger" onclick="callHost('skipToday', '\${activeHabit.id}')">
                \${ICONS.reset} Reset Counter Today
              </button>
              <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
                \${ICONS.reset} Reset Counter on Date
              </button>
            </div>
          \`;
        }

        philosophyFooterHtml = \`
          <div class="activity-section-card" style="margin-top: 12px; background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.25);">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px; color: #10b981; margin-bottom: 4px;">
              \${ICONS.shield} <span>Quitting / Abstinence Philosophy</span>
            </div>
            <p style="font-size: 12px; color: var(--text-sub); line-height: 1.4;">
              This is a quitting counter. Days count up continuously as long as you stay clean. Tap <strong>"Reset Counter Today"</strong> or <strong>"Reset Counter on Date"</strong> to record slips with reflection notes.
            </p>
          </div>
        \`;
      } else {
        // Building / Good Habit / Positive Practice
        statusBadgeHtml = isCompletedToday ? \`
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
            \${ICONS.checkCircle} \${todayDoneCount > 1 ? todayDoneCount + ' Sessions Completed Today' : 'Completed Today'}
          </div>
        \` : \`
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); color: #6366f1; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
            \${ICONS.target} Today Pending Check-In
          </div>
        \`;

        actionsClusterHtml = isCompletedToday ? \`
          <div class="action-pills-cluster">
            <button class="btn-quitly-action btn-done-success" onclick="callHost('completeToday', '\${activeHabit.id}')" title="Log additional session with note">
              \${ICONS.plus} Log Additional Done (+1)
            </button>
            <button class="btn-quitly-action" onclick="callHost('undoToday', '\${activeHabit.id}')">
              \${ICONS.undo} Undo Today
            </button>
            <button class="btn-quitly-action btn-skip-danger" onclick="callHost('skipToday', '\${activeHabit.id}')">
              \${ICONS.reset} Reset Counter Today
            </button>
            <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
              \${ICONS.reset} Reset Counter on Date
            </button>
          </div>
        \` : \`
          <div class="action-pills-cluster">
            <button class="btn-quitly-action btn-done-success" onclick="callHost('completeToday', '\${activeHabit.id}')">
              \${ICONS.check} Mark Done Today
            </button>
            <button class="btn-quitly-action btn-skip-danger" onclick="callHost('skipToday', '\${activeHabit.id}')">
              \${ICONS.reset} Reset Counter Today
            </button>
            <button class="btn-quitly-action" onclick="callHost('resetToDate', '\${activeHabit.id}')">
              \${ICONS.reset} Reset Counter on Date
            </button>
          </div>
        \`;

        philosophyFooterHtml = \`
          <div class="activity-section-card" style="margin-top: 12px; background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.25);">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px; color: #6366f1; margin-bottom: 4px;">
              \${ICONS.target} <span>Building / Positive Habit Philosophy</span>
            </div>
            <p style="font-size: 12px; color: var(--text-sub); line-height: 1.4;">
              This is a positive habit. Your streak grows by intentionally completing and checking in each day. Tap <strong>"Mark Done Today"</strong> or <strong>"+ Log Additional Done (+1)"</strong> to log sessions with reflection notes.
            </p>
          </div>
        \`;
      }

      // 3-Column Goals Checklist Grid
      let goalsHtml = tiers.map(t => {
        const isUnlocked = t.isUnlocked;
        return \`
          <div class="goal-check-box \${isUnlocked ? 'unlocked' : ''}">
            <span class="goal-check-icon">\${isUnlocked ? ICONS.check : ICONS.lock}</span>
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
        let cls = (d.status === 'completed') ? 'done' : ((d.status === 'skipped') ? 'skip' : (d.status === 'before_start' ? 'before-start' : (d.status === 'future' ? 'future' : '')));
        if (d.status === 'completed') monthDoneCount++;
        if (d.status === 'skipped') monthSkipCount++;
        if (d.isToday) cls += ' is-today';

        const dayDoneEvents = (activeHabit.events || []).filter(e => (e.type === 'done' || e.type === 'complete') && (e.date === d.dateStr || (e.timestamp && e.timestamp.split('T')[0] === d.dateStr)));
        const daySlipEvents = (activeHabit.events || []).filter(e => (e.type === 'skip' || e.type === 'slip' || e.type === 'reset') && (e.date === d.dateStr || (e.timestamp && e.timestamp.split('T')[0] === d.dateStr)));
        const dayResetLogs = (activeHabit.resetLogs || []).filter(rl => (rl.date === d.dateStr || (rl.timestamp && rl.timestamp.split('T')[0] === d.dateStr)));

        const multiDoneCount = dayDoneEvents.length;
        const multiSlipCount = Math.max(daySlipEvents.length, dayResetLogs.length);

        const multiCount = (d.status === 'completed') ? multiDoneCount : ((d.status === 'skipped') ? multiSlipCount : 0);
        const multiBadgeHtml = (multiCount > 1) ? \`<span class="day-multi-badge">\${multiCount}</span>\` : "";

        let isClickable = (d.status !== 'future');
        let clickAttr = isClickable 
          ? \`onclick="onDayDotClick('\${d.dateStr}', '\${d.status}')"\` 
          : "";
        let titleTip = \`\${d.dateStr}: \${d.status === 'completed' ? (multiCount > 1 ? \`\${multiCount} sessions completed\` : 'Done / Clean') : (d.status === 'skipped' ? (multiCount > 1 ? \`\${multiCount} slips logged\` : 'Missed / Reset') : (d.status === 'before_start' ? 'Before Start' : 'Future'))}\`;
        return \`<div class="day-mini-dot \${cls}" \${clickAttr} title="\${titleTip}">\${d.dayNumber}\${multiBadgeHtml}</div>\`;
      }).join("");

      // Build unified timeline of events and reset logs
      const timelineEntries = [];
      (activeHabit.events || []).forEach(ev => {
        let evType = ev.type || "done";
        if (evType === "skip") evType = "slip";
        timelineEntries.push({
          type: evType,
          date: ev.date || (ev.timestamp ? ev.timestamp.split("T")[0] : ""),
          timestamp: ev.timestamp || null,
          note: ev.note || (evType === "done" ? "Daily check-in completed" : (evType === "calendar_edit" ? "Calendar history edited" : "Slip logged")),
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
      // Ensure all recorded completions and skips are represented in timeline
      (activeHabit.completions || []).forEach(compDate => {
        if (!timelineEntries.some(item => item.date === compDate && item.type === "done")) {
          timelineEntries.push({
            type: "done",
            date: compDate,
            timestamp: null,
            note: "Daily check-in completed",
            streakLength: null
          });
        }
      });
      (activeHabit.skips || []).forEach(skipDate => {
        if (!timelineEntries.some(item => item.date === skipDate && (item.type === "slip" || item.type === "reset"))) {
          timelineEntries.push({
            type: "slip",
            date: skipDate,
            timestamp: null,
            note: "Slip/Reset logged",
            streakLength: null
          });
        }
      });
      timelineEntries.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(a.date).getTime();
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(b.date).getTime();
        return timeB - timeA;
      });

      root.innerHTML = \`
        <!-- Hero Header -->
        <div class="single-counter-hero \${grad}">
          <div class="single-hero-nav">
            <button class="btn-header-round" title="Back to Habits (Esc / Backspace)" onclick="switchView('main')">\${ICONS.arrowLeft}</button>
            <div style="display: flex; gap: 8px;">
              <button class="btn-header-round" title="Edit Settings" onclick="callHost('editHabit', '\${activeHabit.id}')">\${ICONS.edit}</button>
              <button class="btn-header-round" title="Delete Counter" onclick="deleteHabitFromDetail('\${activeHabit.id}')">\${ICONS.trash}</button>
            </div>
          </div>

          <div class="hero-habit-badge">
            <span style="font-size: 22px;">\${escapeHtml(icon)}</span>
            <span class="hero-habit-title">\${escapeHtml(cleanName)}</span>
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
              <span>Tier \${activeTier ? activeTier.tierNum : 1}</span>
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

          <!-- Yearly / Monthly Activity Log -->
          <div class="activity-section-card">
            <div class="activity-header">
              <div class="cal-month-title-wrap">
                \${ICONS.calendar} <span>\${calendar.monthName} \${calendar.year}</span>
              </div>
              <div class="cal-header-actions">
                \${!isCalendarEditMode ? \`
                  <button class="btn-cal-action" onclick="startCalendarEditMode()">\${ICONS.edit} Edit Calendar</button>
                \` : \`
                  <button class="btn-cal-action btn-cal-save" onclick="saveCalendarEdits()">\${ICONS.save} Save (\${editModifiedCount})</button>
                  <button class="btn-cal-action btn-cal-cancel" onclick="cancelCalendarEditMode()">\${ICONS.close} Cancel</button>
                \`}
                <div class="cal-nav-buttons">
                  <button class="btn-month-nav" title="Previous Month (← / <)" onclick="changeMonth(-1)">\${ICONS.chevronLeft}</button>
                  <button class="btn-month-nav" title="Next Month (→ / >)" onclick="changeMonth(1)">\${ICONS.chevronRight}</button>
                </div>
              </div>
            </div>

            \${isCalendarEditMode ? \`
              <div class="cal-edit-active-banner">
                <div class="cal-edit-banner-left">
                  \${ICONS.edit}
                  <span>Tap any day to toggle status</span>
                </div>
                <span class="cal-staged-badge">\${editModifiedCount} staged</span>
              </div>
              <div class="cal-quick-actions-row">
                <button class="btn-cal-quick" onclick="markMonthAllDone()">\${ICONS.check} Mark Month Clean</button>
                <button class="btn-cal-quick" onclick="markMonthAllSkipped()">\${ICONS.close} Mark Month Missed</button>
                <button class="btn-cal-quick" onclick="cancelCalendarEditMode()">\${ICONS.undo} Discard</button>
              </div>
            \` : ''}

            <!-- Weekday Column Headers -->
            <div class="cal-weekdays-row">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            <div class="cal-grid-mini \${isCalendarEditMode ? 'is-editing' : ''}">
              \${emptyDots}
              \${dayDots}
            </div>

            <div class="resets-counter-bar">
              <div class="cal-stats-pills-row">
                <span class="stat-pill clean"><span class="stat-pill-dot clean"></span> <strong>\${monthDoneCount}</strong>&nbsp;Clean</span>
                <span class="stat-pill missed"><span class="stat-pill-dot missed"></span> <strong>\${monthSkipCount}</strong>&nbsp;Missed</span>
              </div>
              <div class="stat-resets-label">
                \${stats.skippedDays || 0}&nbsp;total resets
              </div>
            </div>
          </div>

          <!-- Reset & Activity History Log with Timestamps -->
          <div class="activity-section-card" style="margin-top: 12px;">
            <div class="activity-header">
              <span style="font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 6px;">\${ICONS.chart} Activity & Timestamped History</span>
              <span style="font-size: 12px; font-weight: 700; color: var(--text-sub);">\${timelineEntries.length} entries</span>
            </div>
            \${(timelineEntries && timelineEntries.length > 0) ? \`
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${timelineEntries.map((log, idx) => {
                  let badgeIcon = ICONS.reset;
                  let badgeColor = '#be123c';
                  let badgeBg = '#ffe4e6';
                  let headline = log.streakLength ? \`\${log.streakLength} days streak before reset\` : 'Reset';

                  if (log.type === 'done') {
                    badgeIcon = ICONS.check;
                    badgeColor = '#15803d';
                    badgeBg = '#dcfce7';
                    headline = \`Check-in #\${timelineEntries.length - idx}\`;
                  } else if (log.type === 'calendar_edit') {
                    badgeIcon = ICONS.edit;
                    badgeColor = '#1d4ed8';
                    badgeBg = '#dbeafe';
                    headline = 'Calendar History Edited';
                  } else if (log.type === 'reset') {
                    badgeIcon = ICONS.reset;
                    badgeColor = '#b45309';
                    badgeBg = '#fef3c7';
                    headline = log.streakLength ? \`Reset (\${log.streakLength}d streak)\` : 'Streak Reset';
                  }

                  const timeLabel = formatTimeOnly(log.timestamp);
                  const dateLabel = formatDateOnly(log.date || log.timestamp);
                  return \`
                    <div style="background: var(--card-container-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 12px; font-size: 12px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: var(--text-main); margin-bottom: 3px;">
                        <span style="display: flex; align-items: center; gap: 6px;">
                          <span style="background: \${badgeBg}; color: \${badgeColor}; padding: 2px 6px; border-radius: 4px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">
                            \${badgeIcon} <span>\${headline}</span>
                          </span>
                        </span>
                        <div style="font-size: 11px; color: var(--text-sub); display: flex; align-items: center; gap: 4px;">
                          <span>\${dateLabel}</span>
                          \${timeLabel ? \`<span style="font-weight: 800; color: #2563eb;">• \${timeLabel}</span>\` : ''}
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
