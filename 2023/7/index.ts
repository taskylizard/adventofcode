import { run } from "aocity";

function frequency<T>(arr: T[]): Record<string, number> {
  const frequency: Record<string, number> = {};

  arr.forEach((element) => {
    const key = String(element);
    frequency[key] = (frequency[key] || 0) + 1;
  });

  return frequency;
}

function sort(a: number[], b: number[]) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return b[i] - a[i];
    }
  }
  return 0;
}

function solve(input: string[], part2: boolean, sum: any, desc: any) {
  const power = part2 ? "J23456789TQKA" : "23456789TJQKA";
  return input
    .map((line) => {
      let [cards, bids] = line.split(" ");
      const filtered = cards.split("").map((card) => power.indexOf(card));
      const frequencies = frequency<number>(filtered);

      let jokers: null | number = null;

      if (part2) {
        jokers = frequencies["0"];
        delete frequencies["0"];
      }

      const hands = Object.values(frequencies).sort(desc);

      if (part2 && jokers) {
        hands[0] ??= 0;
        hands[0] += jokers;
      }

      return { sort: hands.concat(filtered), bid: Number(bids) };
    })
    .sort((a, b) => sort(b.sort, a.sort))
    .map((hand, index) => hand.bid * (index + 1))
    .reduce(sum);
}

run({
  part1({ readInput, sum, desc }) {
    const input = readInput("lines");
    return solve(input, false, sum, desc);
  },
  part2({ readInput, sum, desc }) {
    const input = readInput("lines");
    return solve(input, true, sum, desc);
  },
});
