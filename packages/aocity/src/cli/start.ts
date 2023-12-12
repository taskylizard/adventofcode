import { existsSync } from "node:fs";
import { join } from "pathe";
import { defineCommand } from "citty";
import { log, scaffoldDay, readConfig } from "src/core/utils";
import { createBuildContext } from "src/core/build";

export default defineCommand({
  meta: {
    name: "start",
    description: "Start a new challenge.",
  },
  args: {
    day: {
      type: "positional",
      description: "The Advent of Code calendar day.",
      required: true,
    },
    year: {
      type: "string",
      description: "The Advent of Code calendar year.",
      default: new Date().getFullYear().toString(),
      alias: "y",
      valueHint: "2023",
    },
    template: {
      type: "string",
      description: "Template to use from the name of folder in templates/ folder.",
      alias: "t",
    },
  },
  async run({ args }) {
    const { year, day, template } = args;
    const dir = join(year, day);

    if (!existsSync(dir)) {
      await scaffoldDay(year, day, template);
      log.success(`Successfully scaffolded project for day ${day}, year ${year}.`);
    }

    const config = await readConfig(year);
    return await createBuildContext({ dir, config, day });
  },
});
