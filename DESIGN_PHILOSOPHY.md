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
- **Creation Baseline**: Starts with clean zero completions on creation rather than artificially pre-completing the first day.

---

## 2. Invariant-First State Integrity

A core lesson in distributed and local-first application design is maintaining absolute determinism at the mutation boundary:

- **Validate Against the Existing Anchor First**: The system never allows input data to alter the reference frame used for its own validation. In recurrence calculations, backdated calendar entries are strictly tested against the established schedule grid before any start-date extension is permitted.
- **Mutual Exclusivity by Invariant**: A calendar day cannot logically be both completed and skipped. The normalization layer enforces $\text{skips} \cap \text{completions} = \emptyset$ as an invariant, eliminating contradictory persisted state.
- **Strict Date & Timestamp Hygiene**: All calendar operations operate strictly on real calendar dates (`isValidDateString`), timestamps are strictly validated against ISO 8601 formatting, and date arithmetic runs through UTC midnight timestamps to eliminate off-by-one errors caused by seasonal Daylight Saving Time (23h/25h) shifts.
- **Historical Continuity & User Consent**: Changing a habit's recurrence interval or tracking philosophy changes what past data mathematically means. The system treats settings changes as active migrations and requires explicit user acknowledgment before recalculating historical records.

---

## 3. Off-Day Immunity & Schedule-First Evaluation

Recurrence schedules (Daily, Every N Days, Weekly, Monthly) introduce non-scheduled "off-days":
- **Neutrality**: Non-scheduled calendar days are classified as `not_applicable`. They never penalize streak momentum, never contribute false missed days, and cannot be transformed into tracked days by accidental clicks.
- **UI Guardrails**: Off-days are visually badged (`☕ Off-Schedule / Rest Day`), with daily action buttons suppressed and calendar cells disabled to prevent phantom check-in records.

---

## 4. Action Rollback vs. Audit History Isolation

User workflows require a clear distinction between daily behavioral check-ins and administrative history edits:
- **Action Rollback**: "Undo Today" operates specifically on explicit daily check-in actions (`done`, `skip`, `slip`), reconstructing today's state from any remaining check-in occurrences and restoring exact streak anchors.
- **Audit Preservation**: Calendar modifications are recorded as administrative audit events (`calendar_edit`) with dedicated styling and are preserved during check-in undos, maintaining an immutable log of historical corrections.
- **Reset Log Integrity**: Undoing an action never deletes an unrelated reset log from an earlier slip, and same-day duplicate slip logs are automatically deduplicated.

---

## 5. Zero-Lag Responsive Embed UI & Distributed Safety

Amplenote plugins run within sandboxed iframes. Frequent asynchronous host roundtrips degrade the tactile satisfaction of habit tracking.

- **Instantaneous Client State**: Tab switching, month traversal, theme switching, and view transitions occur entirely in-memory with 0ms delay.
- **Serialized Mutation Queue**: Persistence across Amplenote notes is strictly serialized through an in-memory promise queue, preventing concurrency race conditions during rapid user check-ins.
- **Refusal Over Silent Corruption & Visible Error Banners**: If note content is corrupted, unparseable, or temporarily unreachable via network errors, the plugin explicitly halts writes rather than silently wiping data with clean defaults, rendering a protective error banner in the embed to keep the user informed.
- **Multi-Device Revision Optimism**: Every write asserts expected note revisions to detect concurrent edits from multiple devices or tabs, preventing silent lost updates.
- **Algorithmic Scaling**: Multi-day operations (such as multi-month backdated resets) use set-based $O(N + M)$ algorithms, and ID generation uses monotonic counter tie-breakers to ensure absolute collision resistance under high-frequency batch imports.

---

## 6. Visual Delight & Emotional Momentum

- **Laurel Milestones & Progressive Tiers**: Unlocking tiers (from 1 Day to 5 Years) provides long-term intrinsic reward.
- **Vibrant Gradient Identity**: Distinct gradient palettes (Emerald, Rose, Sky Blue, Purple, Amber, Teal, Bronze, Indigo) make each counter immediately recognizable.
- **Atmospheric Appearance Modes**: 5 curated visual themes (Midnight, Frosted Glass, Pure Dark, Light Clean, Cyberpunk Neon) empower users to personalize their focus environment.
- **Tactile Reflection**: Instead of treating resets as simple zeroing of numbers, streak resets preserve past streak achievements and record reflection notes in a dedicated history log.

---

## 7. Vector-First UI & Keyboard Accessibility

- **Precision SVGs**: Core navigation (`chevronLeft`, `chevronRight`, `arrowLeft`, `close`), checklist state indicators (`checkCircle`, `lock`), and action icons are authored as clean, high-resolution SVG vectors.
- **Keyboard Ergonomics**: Power users can navigate months (<kbd>←</kbd> / <kbd>→</kbd>), dismiss modal views (<kbd>Esc</kbd>), and return to home (<kbd>Backspace</kbd>) without lifting their fingers from the keyboard.

---

## 8. Transparent Developer Support & Sustainability

To maintain high software quality, ongoing maintenance, and responsive community feature requests, transparent and non-intrusive developer patronage options are provided in the settings layer.

