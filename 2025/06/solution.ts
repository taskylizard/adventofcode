const input = (await (await import("node:fs")).promises.readFile("./input.txt", "utf-8"))
  .trim()
  .split("\n");
const w = Math.max(...input.map((l) => l.length));
const lines = input.map((l) => l.padEnd(w, " "));

const problems: any | unknown | (any | unknown)[] = [];
for (let c = 0; c < w; ) {
  const s = c;
  while (c < w && lines.some((l) => l[c] !== " ")) c++;
  if (c > s) problems.push([s, c - 1]);
  while (c < w && lines.every((l) => l[c] === " ")) c++;
}

const solve = (extr: any) =>
  problems.reduce((sum: any, [s, e]: any) => {
    const nums = extr(s, e);
    const op = lines[lines.length - 1].substring(s, e + 1).includes("*") ? "*" : "+";
    return sum + new Function(`return ${nums.join(op)}`)();
  }, 0);

const p1 = solve((s: any, e: any) => lines.slice(0, -1).map((l) => +l.substring(s, e + 1)));

const p2 = solve((s: any, e: any) => {
  const nums = [];
  for (let c = s; c <= e; c++) {
    const d = lines
      .slice(0, -1)
      .map((l) => l[c])
      .join("")
      .replace(/ /g, "");
    if (d) nums.push(+d);
  }
  return nums;
});

console.log(`Part 1: ${p1}`);
console.log(`Part 2: ${p2}`);
export {};
