import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { dirname, join } from "pathe";

import type { Solutions, SolutionContext, Solution } from "src/core/types";
import { log } from "src/core/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Runs your solutions with utils and pretty formatting.
 */
export function run(solutions: Solutions): void {
  const context: SolutionContext = {
    input: readFileSync(join(__dirname, "..", "input.txt"), "utf8"),
    readInput(into) {
      const filter = into === "groups" ? "\n\n" : "\n";
      return readFileSync(join(__dirname, "..", "input.txt"), "utf8")
        .split(filter)
        .filter(Boolean);
    },
    sum: (a: number, b: number) => a + b,
    product: (a: number, b: number) => a * b,

    asc: (a: number, b: number) => {
      if (a < b) return -1;
      if (a === b) return 0;
      return +1;
    },
    desc: (a: number, b: number) => {
      if (a > b) return -1;
      if (a === b) return 0;
      return +1;
    },

    by: <O, K extends keyof O>(key: K, compareFn: (a: O[K], b: O[K]) => number) => {
      return (a: O, b: O) => compareFn(a[key], b[key]);
    },
  };

  if (solutions.part1) runSolution(solutions.part1, context, 1);
  if (solutions.part2) runSolution(solutions.part2, context, 2);
}

function runSolution(solution: Solution, context: SolutionContext, part: 1 | 2): void {
  const startTime = performance.now();
  const result = solution(context);
  const time = performance.now() - startTime;
  log.info(`Part ${part} (${time.toFixed()}ms):`, result);
}
