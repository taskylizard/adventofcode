import { run } from "aocity";

function replace(input: string): string {
  const characterNumbers: Record<string, string> = {
    one: "one1one",
    two: "two2two",
    three: "three3three",
    four: "four4four",
    five: "five5five",
    six: "six6six",
    seven: "seven7seven",
    eight: "eight8eight",
    nine: "nine9nine",
  };
  for (const num in characterNumbers) {
    input = input.replaceAll(num, characterNumbers[num]);
  }
  return input;
}

function findNumbers(input: string): number {
  const nums = input.match(/\d/g);
  const firstNumber = Number.parseInt(nums![0]);
  const lastNumber = Number.parseInt(nums![nums?.length! - 1]);
  return Number.parseInt(firstNumber + "" + lastNumber);
}

run({
  part1({ readInput }) {
    const input = readInput("lines");
    let sum = 0;
    input.forEach((i) => (sum += findNumbers(i)!));
    return sum;
  },
  part2({ readInput }) {
    const input = readInput("lines");

    let sum = 0;
    input.forEach((i) => (sum += findNumbers(replace(i))!));
    return sum;
  },
});
