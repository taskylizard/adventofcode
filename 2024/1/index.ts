import { run } from "@aockit/core";

function parse(input: string): {
  leftList: number[];
  rightList: number[];
} {
  const lines = input.trim().split("\n");
  const leftList: number[] = [];
  const rightList: number[] = [];

  lines.forEach((line) => {
    const [left, right] = line.split(/\s+/).map(Number);
    leftList.push(left);
    rightList.push(right);
  });

  return { leftList, rightList };
}

function createCountMap(list: number[]): Map<number, number> {
  const countMap = new Map<number, number>();
  for (const num of list) {
    countMap.set(num, (countMap.get(num) || 0) + 1);
  }
  return countMap;
}

function part1(input: string): number {
  const { leftList, rightList } = parse(input);
  const sortedLeft = [...leftList].sort((a, b) => a - b);
  const sortedRight = [...rightList].sort((a, b) => a - b);

  const length = Math.max(sortedLeft.length, sortedRight.length);
  const left = padZero(sortedLeft, length);
  const right = padZero(sortedRight, length);

  let distance = 0;
  for (let idx = 0; idx < length; idx++) {
    distance += Math.abs(left[idx] - right[idx]);
  }

  return distance;
}

function part2(input: string): number {
  const { leftList, rightList } = parse(input);

  const counts = createCountMap(rightList);

  let sxore = 0;
  for (const num of leftList) {
    const occurrences = counts.get(num) || 0;

    sxore += num * occurrences;
  }

  return sxore;
}

function padZero(arr: number[], length: number): number[] {
  const paddedArr = [...arr];
  while (paddedArr.length < length) {
    paddedArr.push(0);
  }
  return paddedArr;
}

const exampleInput = `
3   4
4   3
2   5
1   3
3   9
3   3
`;

run({
  part1: ({ input }) => part1(input),
  part2: ({ input }) => part2(input),

  tests: [
    {
      name: "Part 1",
      input: exampleInput,
      expected: 11,
      solution: ({ input }) => part1(input),
    },
    {
      name: "Part 2",
      input: exampleInput,
      expected: 31,
      solution: ({ input }) => part2(input),
    },
  ],
});
