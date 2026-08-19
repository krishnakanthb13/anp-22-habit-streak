# Design Philosophy: Habit Streaks Plugin

## 1. Dual Paradigm Habit Tracking

Traditional habit trackers enforce a single rigid model: every habit starts as "incomplete" each morning and requires an explicit button click. While this fits positive actions, it completely breaks down for **sobriety, abstinence, and breaking bad habits**.

### A. The Abstinence / Quitting Paradigm (Quitly Style)
- **Concept**: If your goal is *No Alcohol*, *No Smoking*, or *No Sugar*, you are already succeeding by default simply by living your day.
- **Interaction Model**: Zero daily clicks. The streak clock ticks continuously in real time.
- **Intervention**: You only interact with the system when an intentional slip or relapse occurs, accompanied by an honest reflection note to promote psychological mindfulness rather than shame.

### B. The Intentional Practice Paradigm (Amplenote Style)
- **Concept**: If your goal is *Daily Workout*, *Meditation*, or *Reading*, you must actively expend effort to complete the practice.
- **Interaction Model**: Requires an explicit check-in each period. Supports multiple session repetitions per day with a 7-day frequency chart.

---

## 2. Zero-Lag Responsive Embed UI

Amplenote plugins run within sandboxed iframes. Frequent asynchronous host roundtrips degrade the tactile satisfaction of habit tracking.

- **Instantaneous Client State**: Tab switching, month traversal, and view transitions occur entirely in-memory with 0ms delay.
- **Restricted Sync Boundary**: Persistence across Amplenote notes is strictly triggered on initial load, mutating actions (create, edit, toggle, reset), and manual refresh.

---

## 3. Visual Delight & Emotional Momentum

- **Laurel Milestones & Progressive Tiers**: Unlocking tiers (from 1 Day to 5 Years) provides long-term intrinsic reward.
- **Vibrant Gradient Identity**: Distinct gradient palettes (Emerald, Rose, Sky Blue, Purple, Amber, Teal, Bronze, Indigo) make each counter immediately recognizable.
- **Atmospheric Appearance Modes**: 5 curated visual themes (Midnight, Frosted Glass, Pure Dark, Light Clean, Cyberpunk Neon) empower users to personalize their focus environment.
- **Tactile Reflection**: Instead of treating resets as simple zeroing of numbers, streak resets preserve past streak achievements and record reflection notes in a dedicated history log.
