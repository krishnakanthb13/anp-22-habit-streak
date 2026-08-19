```markdown
# Amplenote Plugin Bounty: Beautiful Streaks
Published by Lucian | February 20, 2025 | Last changed 3 months ago | 189 views

## Updates May 2026

* *Since the creation of this bounty, Amplenote now implements task streaks to some degree on the Task Stats page. Therefore, this plugin has to do a little bit more in order that initially specced. The new requirements below.*
* The plugin should have feature parity with [Quitly](https://apps.apple.com/us/app/quitly-sober-days-counter/id6615060703), so refer to this app for more context about each point below:
  * Works as a "dashboard" plugin (check plugin API documentation for what that means)
  * Displays a list of tasks at the top of the page, each task is like a "tab" the user can navigate into; navigating into a task will show stats for that task (See below)
  * **Task list:**
    * By default, the plugin does not show any task, but lets the user (A) create new tasks as well as (B) import all tasks from a note
    * (A) create new tasks
      * Creating a new task lets the user specify plaintext description ~~and recurrence period~~, ~~and whether to auto-complete this task on every recurrence~~ (disregard, I think that makes it too complex)
      Every number periods
      * number is an integer (text field)
      * periods is a dropdown: day, week, month
      This is the concept implemented by Quitly, and it's that a task/habit is considered "done" unless marked otherwise; opposite from the Amplenote treatment.
      Implementation-wise, the developer will have to find a way to mark a recurring task as complete many times and on the correct days. This will be a potentially tricky challenge dev-wise, but not impossible.
      Essentially, this plugin will have two types of tasks: tasks that need to be marked as complete, and tasks that need to be marked as skipped. We give this choice to users in the plugin, but the default choice should be for tasks to be marked as skipped, such that it mimics what I think is Quitly's good philosophy.
      * The plugin will start displaying stats for this task
    * (B) import all tasks from a note
      * The plugin will prompt the user for a note:
        * Upon choosing a note, the plugin will identify all of the daily recurring tasks in that note, and show a list to the user
        * Upon confirmation, the plugin will start tracking and showing tasks for all of those tasks
        * ~~The plugin will ask the user to choose which of these tasks will start being auto-completed from now on (plugin defaults to all tasks in the list)~~
    * Tasks added to this plugin in either of the two ways will be marked as complete every day automatically by the plugin.
    * This is the concept implemented by Quitly, and it's that a task/habit is considered "done" unless marked otherwise; opposite from the Amplenote treatment. Implementation-wise, the developer will have to find a way to mark a recurring task as complete many times and on the correct days. This will be a potentially tricky challenge dev-wise, but not impossible.
  * **Reset button**
    * Somewhere visually associated to the task name, we show a "reset counter" button that lets the user either:
      * mark the current day as "skipped"
      * select a specific day to "skip" the task on; all days between that day and the current day as marked as skipped
    * All of these actions reflect in real task/note actions behind the scenes
  * **Stats:**
    * Below the selected task name/tab, the plugin shows a *live counter* of days, hours, minutes and seconds since the start of the oldest continuous streak for the current task
    * Below this, the plugin shows an *interactive monthly calendar widget*:
      * Days on which the task was completed are green, days on which it has not are default/gray
      * Calendar lets the user navigate or otherwise neatly scroll horizontally between months (check Quitly for their calendar - we could have that, but interactive)
      * Interactivity:
        * Clicking on a completed day offers the option to "skip the task" for that day
        * Clicking on a skipped day, offers the option to "complete the task" for that day
        * All of these actions reflect in real task/note actions behind the scenes
      * *For non-daily-recurring tasks, we fill in the period between completed days with green*
    * Reproduce the *tiered goals functionality from Quitly*
    * Reproduce the *all time overview* functionality from quitly

### Deprecated
* This plugin's requirements are open-ended; please ~~contact us~~ with your own ideas if you have any!
* This plugin works on top of a user's recurring tasks and displays (beautiful ✨) stats
* The plugin should have ~~feature parity~~ with [Quitly](https://apps.apple.com/us/app/quitly-sober-days-counter/id6615060703)
* ~~Optional extra functionality~~:
  * New habits can be added from within the plugin interface

```

Here's an execution plan for building this as an Amplenote plugin. I pulled the current Plugin API docs to ground this in what's actually possible (not all of it maps cleanly onto how Amplenote's task model works, so I've flagged the load-bearing assumptions you'll need to verify early).

## The core architectural problem to solve first

Amplenote plugins have **no background/cron execution** — they only run when a user triggers an action (opening the dashboard embed, clicking a button, etc.). But the spec wants tasks "marked as complete every day automatically." You can't run a literal daily job.

**Workaround:** auto-complete is simulated, not scheduled. Every time the dashboard embed renders (`renderEmbed`), the plugin computes "days elapsed since the last time this task's state was resolved" and *backfills* completions for each of those days that the user hasn't explicitly marked as skipped. So opening the plugin is what triggers the catch-up, not a timer. This needs to be true both for the tab you're looking at and (ideally) lazily for others, so stats don't quietly drift when a task tab hasn't been opened in weeks.

**Second problem:** does a recurring task's completion history actually persist per-occurrence, or does completing it just reset `completedAt` and lose the prior date? `app.getCompletedTasks(from, to)` strongly implies each completion is logged with its own timestamp — that would be exactly the ledger you need (real task data, not a shadow database, which satisfies the spec's "all actions reflect in real task/note actions" requirement). This is the single most important thing to verify before writing any UI code, because if per-occurrence history *isn't* retrievable that way, you're forced into a plugin-side data note as the source of truth instead, which is a materially different (and worse) build.

## Phase 0 — Spike (do this before anything else, 1-2 days)

1. Create a throwaway note with one recurring task. Complete it, let it recur, complete again. Call `app.getCompletedTasks()` and confirm you get multiple distinct dated entries for the *same* task, not just the latest.
2. Confirm `app.updateTask(uuid, { completedAt: <arbitrary past timestamp> })` actually lets you backdate a completion (needed for backfilling skipped-day corrections and the calendar's click-to-toggle interactions).
3. Read the `actions` doc (`/developing_amplenote_plugins/actions`) and Appendix I `task` object in full — I only pulled `app_interface`, not those two pages. Specifically confirm: (a) what "dashboard plugin" formally means — likely `renderEmbedTarget === "notesDashboard"` combined with `app.openEmbed`/`app.openSidebarEmbed`, not a separate registration type; (b) the full shape of `task.repeat` so you know how to detect "daily recurring" tasks when importing from a note.
4. If backdating/multi-completion doesn't work as hoped, stop and redesign the data model around a plugin-owned ledger (see Fallback below) before building UI on the wrong foundation.

## Data model

Two tracked-task types, both ultimately just Amplenote tasks with plugin metadata:

- **Skip-tracked** (default, Quitly philosophy): considered done unless explicitly skipped. Plugin auto-backfills completion.
- **Complete-tracked**: normal Amplenote semantics, user marks it done.

Per tracked task, plugin needs to persist:
- Which real task UUID + note UUID it maps to
- Its interval (`{ n: integer, period: "day"|"week"|"month" }`)
- Whether it's skip-tracked or complete-tracked
- The "streak start" anchor date (oldest continuous completed day) — can likely be *derived* live from completion history rather than stored, which is safer (no state to get out of sync)

**Where to store the tracked-task registry itself** (not the completion history — that lives on the real tasks): a dedicated hidden config note that the plugin creates and manages (`app.createNote`/`app.notes.find` by a reserved name), holding a small JSON/markdown table of tracked task UUIDs + settings. `app.settings` only stores strings and is meant for user-facing plugin config, not a growing task registry, so it's the wrong place for this.

**Fallback if Phase 0 shows per-occurrence completion history isn't retrievable:** maintain the day-by-day green/gray ledger yourself in that same config note (e.g. one row per tracked task, a run-length-encoded list of skip dates), and *mirror* every skip/complete action onto the real task's `completedAt` so it still satisfies "reflects in real task actions" even though your note is the actual source of truth for rendering.

## UI structure

Everything lives in one `renderEmbed` (rendered via `app.openEmbed` so it shows as a persistent dashboard section, per the "dashboard plugin" requirement) — this is HTML/CSS/JS you fully control, communicating back to plugin logic via `onEmbedCall` and `window.callAmplenotePlugin(...)`, per the `renderEmbed`/`onEmbedCall` pattern in the docs.

1. **Task tab bar** — horizontal list of tracked tasks; empty state offers "Create new task" / "Import from note" as buttons that call back into `onEmbedCall` → `app.prompt` flows.
2. **Import flow** — `app.prompt` with a `type: "note"` input to pick a note, then `app.getNoteTasks(noteHandle)` filtered to daily-recurring (`task.repeat`), shown as a confirm list.
3. **Live counter** — rendered client-side in the embed's own JS with `setInterval`, seeded from the streak-start timestamp computed server-side (plugin) at render time.
4. **Calendar widget** — custom HTML/CSS grid inside the embed (not a native Amplenote component — you're building this from scratch), horizontally scrollable by month, colored per day from the completion ledger. Click handlers call `onEmbedCall` with `(taskUUID, date, action)` to toggle skip/complete, then trigger `app.context.renderEmbed()` to refresh.
5. **Reset button** — "mark today skipped" is a direct call; "pick a day, skip everything since" is a `type: "date"` `app.prompt`, then a loop of `updateTask` backdated skip-writes (or ledger writes, per whichever model Phase 0 confirms) across the range.
6. **Tiered goals + all-time overview** — pure display/computation over the same completion data (no new Amplenote API surface needed) — these are really just "what's the current streak vs. milestone thresholds" and "total days tracked / longest streak / completion %" widgets. Low technical risk, mostly UI/design work — worth doing last.

## Suggested build order

1. Phase 0 spike (above) — do not skip this, it determines the whole data layer.
2. Config note + task registry CRUD (create/import, no UI polish yet).
3. Dashboard embed skeleton with tab bar reading from the registry.
4. Auto-backfill-on-render logic (the trickiest correctness piece — get this right with tests/manual scenarios before UI).
5. Calendar widget (read-only first, green/gray rendering).
6. Interactivity: click-to-toggle, reset button, date-range skip.
7. Live counter.
8. Tiered goals + all-time overview.
9. Polish pass matching Quitly's visual language, since the bounty explicitly wants feature parity.

## Open questions worth resolving with the bounty poster before you're deep in build

- For non-daily tasks (weekly/monthly), "fill the period between completed days with green" — does a *skip* inside that period still count as a break, or only a missed full period? The spec doesn't fully disambiguate this edge case.
- Does "tiered goals" mean user-defined milestones (e.g. 7/30/90/365 days) or literally Quitly's fixed tier set? Worth checking their app to lock exact numbers/copy rather than guessing.

If you want, I can go deeper on any one phase next — e.g. draft the actual `plugin.js` skeleton (manifest table + action stubs) once you've run the Phase 0 spike and confirmed which data-model branch you're on.

---
