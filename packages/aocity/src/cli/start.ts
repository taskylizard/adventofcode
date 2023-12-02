import { existsSync } from "node:fs";
import { Worker } from "node:worker_threads";
import { execa } from "execa";
import { watch } from "chokidar";
import type { BuildOptions } from "esbuild";
import { context } from "esbuild";
import { join, resolve } from "pathe";
import { defineCommand } from "citty";
import { debounce } from "perfect-debounce";
import { scaffoldDay, readConfig } from "src/core/generators";
import { log } from "src/core/utils";

export default defineCommand({
  meta: {
    name: "start",
    description: "Start a new challenge.",
  },
  args: {
    year: {
      type: "string",
      description: "The Advent of Code calendar year.",
      default: new Date().getFullYear().toString(),
      alias: "y",
      valueHint: "2023",
    },
    day: {
      type: "string",
      description: "The Advent of Code calendar day.",
      alias: "d",
      valueHint: "1",
      required: true,
    },
    template: {
      type: "string",
      description: "Template to use from the name of folder in templates/ folder.",
      alias: "t",
    },
  },
  async run({ args }) {
    const { year, day, template } = args;
    const dir = join(year, day);

    if (!existsSync(dir)) {
      await scaffoldDay(year, day, template);
      log.success(`Successfully scaffolded project for day ${day}, year ${year}.`);
    }

    const config = await readConfig(year);
    if (config.days[Number(day)].runner !== null) {
      const [cmd, ...cmdArgs] = config.days[Number(day)].runner!.split(" ");
      const reload = debounce(async () => {
        try {
          const { stdout } = await execa(cmd, cmdArgs, { cwd: resolve(dir) });
          console.log(stdout);
        } catch (error) {
          log.error(`The command failed. stderr: ${error.stderr} (${error.exitCode})`);
        }
      });

      const watcher = watch(dir, {
        cwd: process.cwd(),
        ignoreInitial: true,
        ignored: [
          // Hidden directories like .git
          "**/.*/**",
          // Hidden files (e.g. logs or temp files)
          "**/.*",
          // Built files
          "**/dist/**",
          // 3rd party packages
          "**/{node_modules,bower_components,vendor}/**",
        ],
      })
        .on("ready", async () => {
          log.start(`Started server, listening for changes...`);
          log.ready("🦌 Press: r to reload • q to quit");
        })
        .on("all", async (change, path) => {
          log.info(`[dev:watcher:${change}]: ${path}`);
          await reload();
        })
        .on("error", (error) => log.error("[dev:watcher:error]", error));

      process.stdin
        .setRawMode(true)
        .resume()
        .setEncoding("utf-8")
        .on("data", async (key: string) => {
          switch (key) {
            case "\u0071":
            case "\u0003":
              log.info("Exiting.");
              await watcher.close();
              process.exit(0);
            case "\u0072":
              log.info("Reloading.");
              await reload();
              break;
            default:
              break;
          }
          process.stdout.write(key);
        });
    } else {
      // Copied all from rose but removed references to it because I still haven't finished it lol
      const buildConfig: BuildOptions = {
        entryPoints: [join(dir, "index.ts")],
        format: "esm",
        platform: "node",
        bundle: true,
        outfile: join(dir, "dist", "index.js"),
      };
      const ctx = await context(buildConfig);
      let worker: Worker | null = null;

      function createWorker(): void {
        if (worker) {
          return;
        }

        worker = new Worker(resolve(buildConfig.outfile!), {
          execArgv: ["--enable-source-maps"],
          workerData: {},
          stderr: true,
        });

        worker.stderr.on("error", (error) => {
          // Handle errors in the worker
          const newErr = new Error(`[dev:worker:error] ${error.message}`);
          newErr.stack = error.stack;
          log.error(newErr);
        });

        worker.once("exit", (code) => {
          if (code) {
            log.error(new Error(`[dev:worker:exit] exited with code: ${code}`));
          } else {
            log.debug("[dev:worker:exit] exited");
          }
          worker = null;
        });

        log.debug("Worker created.");
      }

      function deleteWorker(): void {
        if (worker) {
          worker.removeAllListeners();
          worker.terminate();
          worker = null;
        } else null;
      }

      const reload = debounce(async () => {
        deleteWorker();
        await ctx
          .rebuild()
          .then(() => createWorker())
          .catch((error) => log.error(error));
      });

      const watcher = watch(dir, {
        cwd: process.cwd(),
        ignoreInitial: true,
        ignored: [
          // Hidden directories like .git
          "**/.*/**",
          // Hidden files (e.g. logs or temp files)
          "**/.*",
          // Built files
          "**/dist/**",
          // 3rd party packages
          "**/{node_modules,bower_components,vendor}/**",
        ],
      })
        .on("ready", async () => {
          await reload();
          log.start(`Started server, listening for changes...`);
          log.ready("🦌 Press: r to reload • q to quit");
        })
        .on("all", async (change, path) => {
          log.info(`[dev:watcher:${change}]: ${path}`);
          await reload();
        })
        .on("error", (error) => log.error("[dev:watcher:error]", error));

      process.stdin
        .setRawMode(true)
        .resume()
        .setEncoding("utf-8")
        .on("data", async (key: string) => {
          switch (key) {
            case "\u0071":
            case "\u0003":
              log.info("Exiting.");
              await watcher.close();
              await ctx.dispose();
              deleteWorker();
              process.exit(0);
            case "\u0072":
              log.info("Reloading.");
              await reload();
              break;
            default:
              break;
          }
          process.stdout.write(key);
        });
    }
  },
});
