import { existsSync } from "node:fs";
import fsp from "node:fs/promises";
import { defineCommand } from "citty";
import { join } from "pathe";
import { log } from "src/core/utils";
import { generatePackageJSON, generateConfig } from "src/core/generators";

export default defineCommand({
  meta: {
    name: "init",
    description: "Scaffold a Advent of Code year.",
  },
  args: {
    year: {
      type: "string",
      description: "The Advent of Code calendar year.",
      default: new Date().getFullYear().toString(),
      alias: "y",
      valueHint: "2023",
    },
  },
  async run({ args }) {
    if (existsSync(args.year)) {
      log.error(`${args.year} already exists, aborting.`);
      process.exit(1);
    }

    await fsp.mkdir(args.year);
    await fsp.writeFile(join(args.year, "package.json"), generatePackageJSON(args.year));
    await fsp.writeFile(join(args.year, ".aocity.json"), generateConfig(args.year));
    // TODO: nicer readme and all that
    log.success(`Sucessfully scaffolded a ${args.year} workspace.`);
  },
});
