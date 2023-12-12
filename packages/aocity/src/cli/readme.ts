import { defineCommand } from "citty";
import { readFileSync, writeFileSync } from "fs";
import { generateResults, generateDayBadges } from "src/core/generators/year";
import { config } from "src/core/io";

const readReadme = (): string => {
  return readFileSync("README.md", { encoding: "utf8" }).toString();
};

const saveReadme = (readme: string) => {
  writeFileSync("README.md", readme);
};

export default defineCommand({
  meta: { name: "readme" },
  args: {
    year: {
      type: "positional",
      required: true,
      default: new Date().getFullYear().toString(),
      description: "The advent year.",
    },
  },
  async run({ args }) {
    const { year } = args;
    const conf = await config.load(year);
    const badges = generateDayBadges(conf);
    const results = generateResults(conf);

    const readme = readReadme()
      .replace(
        /<!--SOLUTIONS-->(.|\n|\r)+<!--\/SOLUTIONS-->/,
        `<!--SOLUTIONS-->\n\n${badges}\n\n<!--/SOLUTIONS-->`,
      )
      .replace(
        /<!--RESULTS-->(.|\n|\r)+<!--\/RESULTS-->/,
        `<!--RESULTS-->\n\n${results}\n\n<!--/RESULTS-->`,
      );

    saveReadme(readme);
  },
});
