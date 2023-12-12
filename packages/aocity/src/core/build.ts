import { existsSync, readFileSync } from "node:fs";
import { Worker } from "node:worker_threads";
import { execa } from "execa";
import { watch } from "chokidar";
import type { BuildOptions } from "esbuild";
import { context } from "esbuild";
import { join, resolve } from "pathe";
import { debounce } from "perfect-debounce";
import { colors as c } from "consola/utils";
import { log } from "src/core/utils";
import type { Config } from "./types";

const ignored = existsSync(join(".gitignore"))
  ? readFileSync(join(".gitignore"), { encoding: "utf8" }).split("\n").filter(Boolean)
  : undefined;

const watcher = async (dir: string, reload: () => Promise<void>, dispose?: () => Promise<void>) => {
  const w = watch(dir, {
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
      "**/{node_modules,bower_components,vendor,target}/**",
      // .gitignore
      ...ignored!,
    ],
  })
    .on("ready", async () => {
      log.start(`Started server, listening for changes...`);
      log.ready(`🦌 Press: ${c.green(c.bold("r"))} to reload • ${c.red(c.bold("q"))} to quit`);
      await reload();
    })
    .on("change", async (path) => {
      log.info(`[dev:watcher:change]: ${path}`);
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
          await w.close();
          dispose ? await dispose() : undefined;
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
};

interface BuildContext {
  config: Config;
  dir: string;
  day: string;
}

export async function createBuildContext(ctx: BuildContext) {
  if (ctx.config.days[Number(ctx.day)].runner !== null) {
    const [cmd, ...cmdArgs] = ctx.config.days[Number(ctx.day)].runner!.split(" ");
    const reload = debounce(async () => {
      try {
        const { stdout } = await execa(cmd, cmdArgs, { cwd: resolve(ctx.dir) });
        console.log(stdout);
      } catch (error) {
        log.error(`The command failed. stderr: ${error.stderr} (${error.exitCode})`);
      }
    });
    await watcher(ctx.dir, reload);
  } else {
    // Copied all from rose but removed references to it because I still haven't finished it lol
    const buildConfig: BuildOptions = {
      entryPoints: [join(ctx.dir, "index.ts")],
      format: "esm",
      platform: "node",
      bundle: true,
      outfile: join(ctx.dir, "dist", "index.js"),
    };
    const build = await context(buildConfig);

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

      worker.on("error", (error) => {
        // Handle errors in the worker
        const newErr = new Error(`[dev:worker:error] ${error.message}`);
        newErr.stack = error.stack;
        log.error(newErr);
      });

      worker.stderr.on("error", (error) => {
        // Handle errors in stderr
        const newErr = new Error(`[dev:stderr:error] ${error.message}`);
        newErr.stack = error.stack;
        newErr.cause = error.cause;
        log.error(newErr);
      });

      worker.once("exit", () => {
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
      await build
        .rebuild()
        .then(() => createWorker())
        .catch((error) => log.error(error));
    });

    await watcher(ctx.dir, reload, build.dispose);
  }
}
