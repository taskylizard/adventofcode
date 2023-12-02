#!/usr/bin/env node
/* eslint-disable unicorn/prefer-top-level-await */
import { defineCommand, runMain, type CommandDef } from "citty";
import "dotenv/config";

const _def = (r: any) => (r.default || r) as Promise<CommandDef>;

const main = defineCommand({
  meta: {
    name: "aocity",
    description: "Advent of Code CLI.",
  },
  subCommands: {
    start: import("./cli/start").then(_def),
    init: import("./cli/init").then(_def),
  },
});

runMain(main);
