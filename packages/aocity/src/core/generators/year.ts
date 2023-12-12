import type { Config } from "../types";
import { dedent, toFixed } from "../utils";

export function generateDayBadges(config: Config) {
  return config.days
    .map(({ part1, part2 }, index) => {
      const day = String(index + 1).padStart(2, "0");

      const color =
        (part1.solved && part2.solved) || (part1.solved && day === "25")
          ? "green"
          : part1.solved || part2.solved
            ? "yellow"
            : "gray";

      const badge = `![Day](https://badgen.net/badge/${day}/%E2%98%8${part1.solved ? 5 : 6
        }%E2%98%8${part2.solved || (part1.solved && day === "25") ? 5 : 6}/${color})`;

      return color !== "gray" ? `[${badge}](src/day${day})` : badge;
    })
    .join("\n");
}

export function generateResults(config: Config) {
  let totalTime = 0;
  let totalStars = 0;

  const results = config.days
    .map(({ part1, part2 }, index) => {
      const day = String(index + 1).padStart(2, "0");

      let timeBoth = 0;

      if (part1.solved) {
        totalStars++;
        totalTime += part1.time ?? 0;
        timeBoth += part1.time ?? 0;
      }
      if (part2.solved) {
        totalStars++;
        totalTime += part2.time ?? 0;
        timeBoth += part2.time ?? 0;
      }

      if (day === "25" && part1.solved) {
        totalStars++;
      }

      return dedent(`
      \`\`\`
      Day ${day}
      Time part 1: ${part1.time !== null && part1.solved ? toFixed(part1.time) + "ms" : "-"}
      Time part 2: ${part2.time !== null && part2.solved ? toFixed(part2.time) + "ms" : "-"}
      Both parts: ${timeBoth !== 0 ? toFixed(timeBoth) + "ms" : "-"}
      \`\`\`
    `);
    })
    .join("\n\n");

  const summary = dedent(`
    \`\`\`
    Total stars: ${totalStars}/50
    Total time: ${toFixed(totalTime)}ms
    \`\`\`
  `);

  return [results, summary].join("\n\n");
}

export function generateReadme(config: Config) {
  const badges = generateDayBadges(config);
  const results = generateResults(config);

  return dedent(`
    <!-- Entries between SOLUTIONS and RESULTS tags are auto-generated -->

    [![Advent of Code](https://badgen.net/badge/Advent%20of%20Code/${config.year}/blue)](https://adventofcode.com/${config.year})

    # 🎄 Advent of Code ${config.year} 🎄

    ## Solutions

    <!--SOLUTIONS-->

    ${badges}

    <!--/SOLUTIONS-->

    _Click a badge to go to the specific day._

    ---

    ## Results

    <!--RESULTS-->

    ${results}

    <!--/RESULTS-->

    ---

    ✨🎄🎁🎄🎅🎄🎁🎄✨
  `);
}
