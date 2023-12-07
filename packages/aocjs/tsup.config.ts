import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  sourcemap: true,
  clean: true,
  bundle: true,
  minify: true,
  platform: "node",
  entryPoints: ["src/index.ts"],
  dts: "src/index.ts",
  format: ["esm", "cjs"],
  treeshake: "recommended",
  ...options,
}));
