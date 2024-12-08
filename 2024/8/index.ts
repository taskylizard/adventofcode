import run from "../../../../packages/core/src/index";

function anitnodes(lines: string[], unique?: boolean) {
  const grid: Map<string, string> = new Map<string, string>();
  const antinodes: Set<string> = new Set<string>();

  for (const [y, line] of lines.entries()) {
    for (let x = 0; x < line.length; x++) {
      if (line.charAt(x) !== ".") {
        grid.set(`${x},${y}`, line.charAt(x));
      }
    }
  }

  for (const [loc, antenna] of grid.entries()) {
    const [locX, locY] = loc.split(",", 2).map(Number);
    if (unique) antinodes.add(`${locX},${locY}`);

    const otherAntennas = Array.from(grid.entries()).filter(
      (v) => v[1] === antenna && v[0] !== `${locX},${locY}`,
    );

    for (const [otherLoc, _] of otherAntennas) {
      const [otherLocX, otherLocY] = otherLoc.split(",", 2).map(Number);

      const dist = {
        x: locX - otherLocX,
        y: locY - otherLocY,
      };

      const anti = {
        x: locX + dist.x,
        y: locY + dist.y,
      };

      if (unique) {
        while (anti.x >= 0 && anti.x < lines[0].length && anti.y >= 0 && anti.y < lines.length) {
          antinodes.add(`${anti.x},${anti.y}`);
          anti.x += dist.x;
          anti.y += dist.y;
        }
      } else if (anti.x >= 0 && anti.x < lines[0].length && anti.y >= 0 && anti.y < lines.length) {
        antinodes.add(`${anti.x},${anti.y}`);
      }
    }
  }

  return antinodes.size;
}

run({
  part1(input) {
    const lines = input.read("lines");
    return anitnodes(lines);
  },
  part2(input) {
    const lines = input.read("lines");
    return anitnodes(lines, true);
  },

  bench: [
    {
      name: "Part 1",
      solution(input) {
        const lines = input.read("lines");
        return anitnodes(lines);
      },
    },
    {
      name: "Part 2",
      solution(input) {
        const lines = input.read("lines");
        return anitnodes(lines, true);
      },
    },
  ],
  options: {
    // mode: "bench",
  },
});
