import run from "../../../../packages/core/src/index";

function count(part: 1 | 2, eq: bigint[], val: bigint, idx = 2): bigint {
  if (idx === eq.length) {
    return eq[0] === val ? 1n : 0n;
  } else if (val > eq[0]) {
    return 0n;
  }
  // recusively count the number of occurences of the value in the array
  return (
    count(part, eq, val + eq[idx], idx + 1) +
    count(part, eq, val * eq[idx], idx + 1) +
    (part === 1 ? 0n : count(part, eq, BigInt(`${val}${eq[idx]}`), idx + 1))
  );
}

run({
  part1: (input) => {
    const lines = input.read("lines");

    const nums = lines.map((eq) => eq.match(/\d+/g)!.map(BigInt));

    return nums
      .filter((eq) => count(1, eq, eq[1]))
      .map(([v]) => v)
      .reduce((a, b) => a + b, 0n);
  },

  part2: (input) => {
    const lines = input.read("lines");

    const nums = lines.map((eq) => eq.match(/\d+/g)!.map(BigInt));

    return nums
      .filter((eq) => count(2, eq, eq[1]))
      .map(([v]) => v)
      .reduce((a, b) => a + b, 0n);
  },
  options: {
    mode: "bench",
    benchOptions: {
      time: 1000,
      name: "day 7",
    },
  },
  bench: [
    {
      name: "Part 1",
      solution: (input) => {
        const lines = input.read("lines");

        const nums = lines.map((eq) => eq.match(/\d+/g)!.map(BigInt));

        return nums
          .filter((eq) => count(1, eq, eq[1]))
          .map(([v]) => v)
          .reduce((a, b) => a + b, 0n);
      },
    },
    {
      name: "Part 2",
      solution: (input) => {
        const lines = input.read("lines");

        const nums = lines.map((eq) => eq.match(/\d+/g)!.map(BigInt));

        return nums
          .filter((eq) => count(2, eq, eq[1]))
          .map(([v]) => v)
          .reduce((a, b) => a + b, 0n);
      },
    },
  ],
});
