import { run } from "aocity";

run({
  part1({ readInput }) {
    const input = readInput("lines");
    let sum = 0;
    input.forEach((line) => {
      const reds = Math.max(...line.match(/(\d+) red/g)!.map((match) => parseInt(match)));
      const greens = Math.max(...line.match(/(\d+) green/g)!.map((match) => parseInt(match)));
      const blues = Math.max(...line.match(/(\d+) blue/g)!.map((match) => parseInt(match)));
      const id = parseInt(line.match(/Game (\d+)/)![1]);

      if (reds <= 12 && greens <= 13 && blues <= 14) {
        sum += id;
      }
    });
    return sum;
  },
  part2({ readInput }) {
    const input = readInput("lines");
    let sum = 0;
    input.forEach((line) => {
      const reds = Math.max(...line.match(/(\d+) red/g)!.map((match) => parseInt(match)));
      const greens = Math.max(...line.match(/(\d+) green/g)!.map((match) => parseInt(match)));
      const blues = Math.max(...line.match(/(\d+) blue/g)!.map((match) => parseInt(match)));

      sum += reds * greens * blues;
    });
    return sum;
  },
});
