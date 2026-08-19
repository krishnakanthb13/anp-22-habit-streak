/**
 * Handles launching the Habit Streak Dashboard in Fullscreen or Sidebar mode,
 * matching the pattern in anp-09-graph-utility.
 * 
 * @param {object} app - The Amplenote plugin application context.
 * @returns {Promise<void>}
 */
export async function launchHabitDashboard(app) {
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
