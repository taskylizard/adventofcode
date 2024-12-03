/* eslint-disable prefer-named-capture-group */
import { run } from "@aockit/core";

function extract(input: string): number[] {
  const matches = [...input.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/g)];
  return matches.map(([_, x, y]) => Number(x) * Number(y));
}

function part1(input: string): number {
  const multiplications = extract(input);
  return multiplications.reduce((sum, val) => sum + val, 0);
}

function part2(input: string): number {
  const commands = [...input.matchAll(/(?:mul\((\d{1,3}),(\d{1,3})\))|(?:do\(\))|(?:don't\(\))/g)];
  let isEnabled = true;
  let sum = 0;

  for (const [command, x, y] of commands) {
    if (command.startsWith("mul") && isEnabled) {
      sum += Number(x) * Number(y);
    } else if (command === "do()") {
      isEnabled = true;
    } else if (command === "don't()") {
      isEnabled = false;
    }
  }
  return sum;
}

run({
  part1: ({ input }) => part1(input),
  part2: ({ input }) => part2(input),
});
