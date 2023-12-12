import { dedent } from "../utils";

export function generateDayReadme(year: number, day: number) {
  return dedent(`
    # 🎄 Advent of Code ${year} • day ${day} 🎄

    ## Info

    Task description: [link](https://adventofcode.com/${year}/day/${day})

    ## Notes

    ...
  `);
}
