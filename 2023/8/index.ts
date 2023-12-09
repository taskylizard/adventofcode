import { run } from "aocity";

interface Node {
  [key: string]: { L: string; R: string };
}

function parse(input: string[], from: string, to: string) {
  const [instructions, ...allNodes] = input;

  const nodes: Node = allNodes.reduce((nodes: Node, node: string) => {
    const [key, L, R]: string[] = node.match(/\w{3}/g) || [];
    if (key) {
      nodes[key] = { L, R };
    }
    return nodes;
  }, {});

  const current: string[] = Object.keys(nodes).filter((node) => new RegExp(from).test(node));
  const steps: number[] = Array(current.length).fill(0);

  current.forEach((node, idx) => {
    while (!new RegExp(to).test(node)) {
      const instruction: string = instructions[steps[idx] % instructions.length];
      // @ts-expect-error do I look I give a fuck?
      node = nodes[node][instruction];
      steps[idx]++;
    }
  });

  const gcd = (a: number, b: number): number => (a ? gcd(b % a, a) : b);
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

  return steps.length ? steps.reduce(lcm) : 0;
}

run({
  part1: ({ readInput }) => {
    const input = readInput("lines");
    return parse(input, "AAA", "ZZZ");
  },
  part2: ({ readInput }) => {
    const input = readInput("lines");
    return parse(input, "..A", "..Z");
  },
});
