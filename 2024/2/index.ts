import { run } from "@aockit/core";

function isLevelSequenceSafe(levels: number[]): boolean {
  // adjacent levels differ by at least 1 and at most 3
  for (let i = 1; i < levels.length; i++) {
    const diff = levels[i] - levels[i - 1];
    if (Math.abs(diff) > 3 || diff === 0) {
      return false;
    }
  }
  return true;
}

function isMonotonic(levels: number[]): boolean {
  let isIncreasing = true;
  let isDecreasing = true;

  for (let i = 1; i < levels.length; i++) {
    const diff = levels[i] - levels[i - 1];

    if (diff < 0) {
      isIncreasing = false;
    }
    if (diff > 0) {
      isDecreasing = false;
    }
  }

  return isIncreasing || isDecreasing;
}

function isReportSafe(levels: number[]): boolean {
  return isLevelSequenceSafe(levels) && isMonotonic(levels);
}

// 1ms
function part1(reports: number[][]): number {
  // eslint-disable-next-line unicorn/no-array-callback-reference
  return reports.filter(isReportSafe).length;
}

// 4ms
function part2(reports: number[][]): number {
  return reports.filter((report) => {
    if (isReportSafe(report)) {
      return true;
    }

    // Try removing each level to see if it makes the report safe
    for (let i = 0; i < report.length; i++) {
      const modifiedReport = [...report.slice(0, i), ...report.slice(i + 1)];

      if (isReportSafe(modifiedReport)) {
        return true;
      }
    }

    // Couldn't find a safe report, might as well kill myself
    return false;
  }).length;
}

function parseInput(input: string): number[][] {
  return input
    .trim()
    .split("\n")
    .map((line) => line.split(" ").map(Number));
}

const exampleInput = `
7 6 4 2 1
1 2 7 8 9
9 7 6 2 1
1 3 2 4 5
8 6 4 4 1
1 3 6 7 9
`;

run({
  part1({ input }) {
    return part1(parseInput(input));
  },
  part2({ input }) {
    return part2(parseInput(input));
  },
  tests: [
    {
      input: exampleInput,
      name: "Part 1",
      expected: 2,
      solution(context) {
        return part1(parseInput(context.input));
      },
    },

    {
      input: exampleInput,
      name: "Part 2",
      expected: 4,
      solution(context) {
        return part2(parseInput(context.input));
      },
    },
  ],
});
