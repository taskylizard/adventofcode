import { existsSync } from "node:fs";
import fsp from "node:fs/promises";
import { defineCommand } from "citty";
import { join } from "pathe";
import { log, generatePackageJSON, generateConfig } from "src/core/utils";
import { generateReadme } from "src/core/generators/year";
import { config } from "src/core/io";

export default defineCommand({
  meta: {
    name: "init",
    description: "Scaffold a Advent of Code year.",
  },
  async run() {
    const firstYear = 2015;
    const currentYear = new Date().getFullYear();

    const years = new Array(currentYear - firstYear + 1)
      .fill(firstYear)
      .map((val, i) => val + i)
      .reverse();

    let year: any = await log.prompt("What calendar year do you want to do?", {
      type: "select",
      options: years.map((year) => ({ label: year, value: year })),
    });

    year = String(year!);

    if (existsSync(year)) {
      log.error(`${year} already exists, aborting.`);
      process.exit(1);
    }

    await fsp.mkdir(year);
    await fsp.writeFile(join(year, "package.json"), generatePackageJSON(year));
    await fsp.writeFile(join(year, ".aocity.json"), generateConfig(year));
    await fsp.writeFile(join(year, "README.md"), generateReadme(await config.load(year)));
    log.success(`Sucessfully scaffolded a ${year} workspace.`);
  },
});
