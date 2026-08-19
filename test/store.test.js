import { extractJsonFromMarkdown, formatStateAsMarkdown } from "../lib/data/store.js";
import { DEFAULT_STATE } from "../lib/constants.js";

describe("store module", () => {
  test("formatStateAsMarkdown generates valid json fenced in ```json", () => {
    const state = {
      version: 1,
      activeHabitId: "habit_1",
      habits: [
        {
          id: "habit_1",
          name: "Morning Run",
          type: "skip",
          skips: ["2026-08-05"]
        }
      ]
    };

    const markdown = formatStateAsMarkdown(state);
    expect(markdown).toContain("```json");
    expect(markdown).toContain('"activeHabitId": "habit_1"');
    expect(markdown).toContain("```");

    const parsed = extractJsonFromMarkdown(markdown);
    expect(parsed).toEqual(state);
  });

  test("extractJsonFromMarkdown handles arbitrary text around code blocks", () => {
    const rawNote = `
# Habit Streak Data

Here is some note text before the code block.

\`\`\`json
{
  "version": 1,
  "activeHabitId": null,
  "habits": []
}
\`\`\`

Note footer notes.
    `;

    const parsed = extractJsonFromMarkdown(rawNote);
    expect(parsed).toEqual(DEFAULT_STATE);
  });

  test("extractJsonFromMarkdown returns null on invalid or missing json", () => {
    expect(extractJsonFromMarkdown("")).toBeNull();
    expect(extractJsonFromMarkdown("Just random note text with no code block")).toBeNull();
    expect(extractJsonFromMarkdown("```json\n{ invalid json here \n```")).toBeNull();
  });
});
