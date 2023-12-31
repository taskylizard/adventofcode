import fsp from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "pathe";
import consola from "consola";
import { colors as c } from "consola/utils";
import { Client } from "aocjs";
import type { Config } from "./types";
import { config } from "./io";

export const log = consola.create({ defaults: { tag: "🎄" } });
export const dedent = (str: string) =>
  str.replace(RegExp("^" + (str.match(/^(\t| )+/) || "")[0], "gm"), "");
export const toFixed = (value: number, precision: number = 3) => Number(value.toFixed(precision));

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
      `The ${c.magenta(
        "AOC_SESSION",
      )} enviornment variable is not set. You can set it in .env file in root or in your shellrc.`,
    );
    process.exit(1);
  }

  const client = new Client({ session: process.env.AOC_SESSION! });

  const dir = join(year, day); // 2023/2
  await fsp.mkdir(dir, { recursive: true });

  if (template) await setRunner(year, day, template, dir);
  else await fsp.writeFile(join(dir, "index.ts"), generateBoilerplate());

  log.info("Downloading input...");
  const input = await client.getInput(Number(year), Number(day));
  await fsp.writeFile(join(dir, "input.txt"), input);
  log.success("Downloaded input!");

  // const readme = await fetchInstructions(year, day);
  // await fsp.writeFile(join(dir, "README.md"), readme);
}

async function setRunner(year: string, day: string, template: string, dir: string): Promise<void> {
  const tmpl = join("templates", template);
  const file = join(tmpl, ".aocity.json");

  // 1. Copy the template to our day
  await fsp.cp(tmpl, dir, { recursive: true });

  // 2. Exit early if template does not have an config file
  if (existsSync(file)) {
    // 3. Read our template config and the root config
    const tmpconf = JSON.parse(await fsp.readFile(file, { encoding: "utf-8" }));
    const conf = await config.load(year);

    // 4. Write to our year root config
    if (tmpconf.runner !== undefined) conf.days[Number(day)].runner = tmpconf.runner;
    await config.save(year, conf);

    // 5. Remove the temporary file
    await fsp.rm(join(year, day, ".aocity.json"));
  }
}
