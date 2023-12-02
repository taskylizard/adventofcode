import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const file = readFileSync(join(__dirname, "..", "input.txt"), "utf8");
let input = file.split("\n").filter(Boolean);

function part1() {
  let sum = 0;
  input.forEach((line) => {
    const reds = Math.max(...line.match(/(\d+) red/g)!.map((match) => parseInt(match)));
    const greens = Math.max(...line.match(/(\d+) green/g)!.map((match) => parseInt(match)));
    const blues = Math.max(...line.match(/(\d+) blue/g)!.map((match) => parseInt(match)));
    const id = parseInt(line.match(/Game (\d+)/)![1]);

    if ((reds <= 12) && (greens <= 13) && (blues <= 14)) {
      sum += id;
    }
  });
  return sum;
}

function part2() {
  let sum = 0;
  input.forEach((line) => {
    const reds = Math.max(...line.match(/(\d+) red/g)!.map((match) => parseInt(match)));
    const greens = Math.max(...line.match(/(\d+) green/g)!.map((match) => parseInt(match)));
    const blues = Math.max(...line.match(/(\d+) blue/g)!.map((match) => parseInt(match)));

    sum += reds * greens * blues;
  });
  return sum;
}

console.log(`Part 1: ${part1()}`);
console.log(`Part 2: ${part2()}`);
