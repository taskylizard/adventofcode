import fsp from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "pathe";
import { fetchInstructions, fetchPuzzle, log } from "./utils";
import type { Config } from "./types";

export function generatePackageJSON(year: string) {
  return JSON.stringify(
    {
      name: year,
      version: "1.0.0",
      type: "module",
      scripts: {
        init: "aoc init",
        start: "aoc start",
      },
      keywords: ["aoc", "adventofcode"],
      dependencies: {},
    },
    null,
    2,
  );
}

async function generateConfig(template: string, year: string) {
  const defaultDay = { solved: false, result: null, time: null };
  let runner = null;
  if (template && existsSync(resolve(join(template, ".aocity.json")))) {
    const config = JSON.parse(
      await fsp.readFile(join(template, ".aocity.json"), { encoding: "utf8" }),
    );

    if (config.runner !== undefined) runner = config.runner;
  }

  return JSON.stringify(
    {
      runner,
      year: Number(year),
      days: Object.fromEntries(
        Array.from({ length: 25 }, (_, index) => [
          index + 1,
          { part1: { ...defaultDay }, part2: { ...defaultDay } },
        ]),
      ),
    } satisfies Config,
    null,
    2,
  );
}

export async function scaffoldDay(year: string, day: string, template: string) {
  const dir = join(year, day);
  await fsp.mkdir(dir, { recursive: true });
  await fsp.cp(template, dir, { recursive: true });

  if (!process.env.AOC_SESSION) {
    log.error("AOC_SESSION enviornment variable is not set in .env file.");
    process.exit(1);
  }

  log.info("Downloading input...");
  const input = await fetchPuzzle(year, day);
  await fsp.writeFile(join(dir, "input.txt"), input);
  log.info("Downloaded input!");

  const readme = await fetchInstructions(year, day);
  await fsp.writeFile(join(dir, "README.md"), readme);
  await fsp.writeFile(join(dir, ".aocity.json"), await generateConfig(template, year));
}
