# 🌆🎄 aocity

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href] [![jsdocs][jsdocs-src]][jsdocs-href]

aocity is a elegant CLI for [Advent of Code](https://adventofcode.com).

- Scaffolds a minimal setup for AoC with the folder structure: `<root>/<year>/<day>`
- Downloads your input file and saves it locally
- [Template support for other languages](#templates)
- Supports both JavaScript and TypeScript, powered by ESBuild
- Provides an elegant `run()` function and utlities

🚧 This project is under heavy development.

## Usage

Setup:

```sh
[pnpm|npm|yarn|bun] init
[pnpm|npm|yarn|bun] install aocity
```

Then run `pnpm aoc init` (you may have to checkout for other package managers, or just add aoc as a
package.json script.)

This will scaffold a year folder for your current year by default.

At this point, you'll have to add your Advent of Code browser session key, this requires a few more
steps.

1. Open [adventofcode.com](https://adventofcode.com) and log in.
2. Open your Chrome or Firefox Devtools (F12).
3. Go to Application tab.
4. On the sidebar, under Storage section, expand Cookies and click on https://adventofcode.com.
5. Now you're seeing 3 cookies, one of them must be named session. Copy it's value.
6. Save this in a `.env` file with the name `AOC_SESSION` in the root. You could also save this into
   your shell's rc, as this session lasts a very long time.

Now, to start a day, run: `pnpm aoc start -d <day>`, where `-d/--day` is the day number.

This will scaffold your day folder, downloads your input and instructions and saves them locally,
generates a minimal TypeScript file and starts the development server.

## Utils

### `run()`

Runs your solutions with utils and pretty formatting. It will also measure your performance with
`node:perf_hooks`.

It has two props, `part1` and `part2`. Both are structurally the same.

You can destructure context to use utlities like `readInput`, `sum`, `product`, `asc`, `desc`, `by`.

#### `readInput()`

This is just a fancy abstraction for reading your input file as we execute built files directly in a
worker thread from dist.

It takes a single parameter, `lines` or `groups` and returns a list.

- `lines` splits your input by newlines. (`\n`)
- `groups` splits your input by groups. (`\n\n`)

#### `input`

This is the raw input file, nothing else.

#### `sum()` and `product()`

Adds/Multiplies two numbers.

#### `asc` and `desc`

This are `compareFn`s for `Array.sort()`.

- `asc` sorts your list by ascending order.
- `desc` sorts your list by decending order.

## Templates

You can make custom templates for different languages, by placing them in the `templates/` folder at
the root.

For example, a Rust template could look like this:

```sh
.
├── 2023
└── templates
    └── rust
        ├── .aocity.json
        ├── Cargo.toml
        └── src
            └── main.rs
```

Your `.aocity.json`'s contents are important:

```json
{
  "runner": "cargo run"
}
```

This gets removed in the end and the runner script is added to your year's runner.

Now, you can start with `pnpm aoc start -d 1 -t rust`, where `-t`/`--template` is the name of your
template folder.

The next time, it will remember and will run your runner command on file changes.

## License

Copyright (c) 2023 taskylizard. MIT Licensed.

<!-- Badges -->


[npm-version-src]:
  https://img.shields.io/npm/v/aocity?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[npm-version-href]: https://npmjs.com/package/aocity
[npm-downloads-src]: https://img.shields.io/npm/dm/aocity?style=flat&labelColor=f38ba8&color=585b70&logoColor=white

[npm-downloads-href]: https://npmjs.com/package/aocity
[jsdocs-src]:
  https://img.shields.io/badge/jsDocs.io-reference-18181B?style=flat&labelColor=f38ba8&color=585b70&logoColor=white
[jsdocs-href]: https://www.jsdocs.io/package/aocity
