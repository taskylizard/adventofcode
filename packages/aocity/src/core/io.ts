import fsp from "node:fs/promises";
import { Config } from "./types";
import { join } from "pathe";

export const config = {
  load: async (year: string) =>
    JSON.parse(await fsp.readFile(join(year, ".aocity.json"), { encoding: "utf-8" })),
  save: async (year: string, config: Config) => {
    const data = JSON.stringify(config, null, 2);
    await fsp.writeFile(join(year, ".aocity.json"), data);
  },
};

export const readme = {};
