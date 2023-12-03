import fsp from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "pathe";
import { fetchInstructions, fetchPuzzle, log } from "./utils";
import type { Config } from "./types";

export function generatePackageJSON(year: string): string {
  return JSON.stringify(
    {
      name: year,
      version: "1.0.0",
      type: "module",
      keywords: ["aoc", "adventofcode"],
      dependencies: {},
    },
    null,
    2,
  );
}

export async function readConfig(year: string): Promise<Config> {
  return JSON.parse(await fsp.readFile(join(year, ".aocity.json"), { encoding: "utf-8" }));
}

async function saveConfig(year: string, config: Config): Promise<void> {
  const data = JSON.stringify(config, null, 2);
  await fsp.writeFile(join(year, ".aocity.json"), data);
}

export function generateConfig(year: string): string {
  return JSON.stringify(
    {
      year: Number(year),
      days: Object.fromEntries(
        Array.from({ length: 25 }, (_, index) => [
          index + 1,
          {
            runner: null,
            part1: { solved: false, result: null, time: null },
            part2: { solved: false, result: null, time: null },
          },
        ]),
      ),
    } satisfies Config,
    null,
    2,
  );
}

export function generateBoilerplate(): string {
  return `import { run } from "aocity";

run({});
`;
}

export async function scaffoldDay(year: string, day: string, template?: string): Promise<void> {
  // exit early if not present
  if (!process.env.AOC_SESSION) {
    log.error(
      "The AOC_SESSION enviornment variable is not set. You can set it in .env file in root or in your shellrc.",
    );
    process.exit(1);
  }

  const dir = join(year, day); // 2023/2
  await fsp.mkdir(dir, { recursive: true });

  if (template) await setRunner(year, day, template, dir);
  else await fsp.writeFile(join(dir, "index.ts"), generateBoilerplate());

  log.info("Downloading input...");
  const input = await fetchPuzzle(year, day);
  await fsp.writeFile(join(dir, "input.txt"), input);
  log.info("Downloaded input!");

  const readme = await fetchInstructions(year, day);
  await fsp.writeFile(join(dir, "README.md"), readme);
}

async function setRunner(year: string, day: string, template: string, dir: string): Promise<void> {
  const tmpl = join("templates", template);
  const file = join(tmpl, ".aocity.json");

  // 1. Copy the template to our day
  await fsp.cp(tmpl, dir, { recursive: true });

  // 2. Exit early if template does not have an config file
  if (existsSync(file)) {
    // 3. Read our template config and the root config
    const conf = JSON.parse(await fsp.readFile(file, { encoding: "utf-8" }));
    const config = await readConfig(year);

    // 4. Write to our year root config
    if (conf.runner !== undefined) config.days[Number(day)].runner = conf.runner;
    await saveConfig(year, config);

    // 5. Remove the temporary file
    await fsp.rm(join(year, day, ".aocity.json"));
  }
}
