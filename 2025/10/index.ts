import { readFileSync } from "fs";
import glpkFactory from "glpk.js";

export type Machine = {
  lightTarget: bigint;
  lightRows: bigint[];
  lights: number;
  buttonCount: number;
  buttonEffects: number[][]; counters: number[];
};

export function parseInput(path: string): Machine[] {
  const raw = readFileSync(path, "utf8").trim();
  if (!raw) return [];
  return raw.split(/\r?\n/).map((line) => {
    const indicatorMatch = line.match(/\[([.#]+)]/);
    if (!indicatorMatch) throw new Error("Missing indicator diagram");
    const pattern = indicatorMatch[1];
    const lights = pattern!.length;

    const buttonMatches = [...line.matchAll(/\(([^)]+)\)/g)].map((m) =>
      m[1]
    );
    const buttonEffects: number[][] = buttonMatches.map((grp) =>
      grp!.split(",").map((s) => parseInt(s, 10))
    );

    // rows for part 1 (GF(2))
    const rows: bigint[] = Array.from({ length: lights }, () => 0n);
    buttonEffects.forEach((arr, btnIdx) => {
      for (const idx of arr) {
        if (idx < lights) rows![idx]! |= 1n << BigInt(btnIdx);
      }
    });

    let lightTarget = 0n;
    for (let i = 0; i < lights; i++) {
      if (pattern![i] === "#") {
        lightTarget |= 1n << BigInt(i);
      }
    }

    const braceMatch = line.match(/\{([^}]+)}/);
    if (!braceMatch) throw new Error("Missing joltage list");
    const counters = braceMatch![1].split(",").map((s) => parseInt(s, 10));

    return {
      lightTarget,
      lightRows: rows,
      lights,
      buttonCount: buttonEffects.length,
      buttonEffects,
      counters,
    };
  });
}

function popcount(x: bigint): number {
  let n = 0;
  while (x) {
    x &= x - 1n;
    n++;
  }
  return n;
}

// solve Ax = b over GF(2); rows = lights, cols = buttons. rows encoded as bitmask of cols.
export function minPresses(machine: Machine): number {
  const { lightRows: rowsInput, lightTarget: target, lights, buttonCount: cols } =
    machine;
  const rows = rowsInput.slice();
  const rhs: number[] = [];
  for (let r = 0; r < lights; r++) {
    rhs[r] = Number((target >> BigInt(r)) & 1n);
  }
  const debug = process.env.DEBUG_ONE === "1";
  if (debug) {
    console.log("rows", rows.map((r) => r.toString(2)), "rhs", rhs, "cols", cols);
  }

  const pivotRowForCol: number[] = Array(cols).fill(-1);
  let row = 0;
  for (let col = 0; col < cols && row < lights; col++) {
    // find pivot with bit set in this col
    let sel = -1;
    for (let r = row; r < lights; r++) {
      if ((rows[r] >> BigInt(col)) & 1n) {
        sel = r;
        break;
      }
    }
    if (sel === -1) continue;
    // swap
    [rows[row], rows[sel]] = [rows[sel], rows[row]];
    [rhs[row], rhs[sel]] = [rhs[sel], rhs[row]];
    pivotRowForCol[col] = row;

    // eliminate other rows
    for (let r = 0; r < lights; r++) {
      if (r !== row && ((rows[r] >> BigInt(col)) & 1n)) {
        rows[r] ^= rows[row];
        rhs[r] ^= rhs[row];
      }
    }
    row++;
  }

  // check consistency
  for (let r = 0; r < lights; r++) {
    if (rows[r] === 0n && rhs[r] === 1) {
      throw new Error("No solution");
    }
  }

  const freeVars: number[] = [];
  for (let c = 0; c < cols; c++) {
    if (pivotRowForCol[c] === -1) freeVars.push(c);
  }

  // particular solution x0 (free vars = 0). In RREF pivot rows only have free columns besides pivot.
  const x0Bits: bigint[] = Array(cols).fill(0n);
  for (let c = 0; c < cols; c++) {
    const pr = pivotRowForCol[c];
    if (pr !== -1) {
      x0Bits[c] = BigInt(rhs[pr]);
    }
  }

  const x0 = x0Bits.reduce(
    (acc, bit, idx) => acc | (bit << BigInt(idx)),
    0n as bigint
  );
  if (debug) {
    console.log("pivotRowForCol", pivotRowForCol, "x0", x0.toString(2));
  }

  // nullspace basis vectors
  const basis: bigint[] = [];
  for (const free of freeVars) {
    let vec = 1n << BigInt(free);
    for (let c = 0; c < cols; c++) {
      const pr = pivotRowForCol[c];
      if (pr === -1) continue;
      if ((rows[pr] >> BigInt(free)) & 1n) {
        vec |= 1n << BigInt(c);
      }
    }
    basis.push(vec);
  }
  if (debug) {
    console.log("basis", basis.map((v) => v.toString(2)));
  }

  const k = basis.length;
  if (k === 0) {
    return popcount(x0);
  }

  // enumerate all combinations of basis vectors; assume k reasonably small
  const limit = 1 << Math.min(k, 30); // avoid shift overflow
  if (k > 30) {
    // heuristic is to sample random combinations to approximate minimal
    let best = popcount(x0);
    const iterations = 1_000_000;
    for (let i = 0; i < iterations; i++) {
      let vec = x0;
      for (let j = 0; j < k; j++) {
        if (Math.random() < 0.5) vec ^= basis[j];
      }
      const w = popcount(vec);
      if (w < best) best = w;
    }
    return best;
  }

  let best = Number.MAX_SAFE_INTEGER;
  const combos = 1 << k;
  let vec = x0;
  let grayPrev = 0;
  for (let mask = 0; mask < combos; mask++) {
    if (mask === 0) {
      best = Math.min(best, popcount(vec));
      continue;
    }
    const gray = mask ^ (mask >> 1);
    const diff = gray ^ grayPrev;
    const bit = 31 - Math.clz32(diff); // index of changed bit (0-based)
    vec ^= basis[bit];
    const w = popcount(vec);
    if (w < best) best = w;
    grayPrev = gray;
  }
  return best;
}

// part 2: integer, non-negative presses, minimize sum, A x = b over Z_+
export function minPressesJoltage(machine: Machine): number {
  const { counters, buttonEffects } = machine;
  const nRows = counters.length;
  const nCols = buttonEffects.length;
  if (nRows === 0 || nCols === 0) return 0;

  const glpk = glpkFactory();
  const varNames = Array.from({ length: nCols }, (_, j) => `x${j}`);
  const lp: any = {
    name: "joltage",
    objective: {
      direction: glpk.GLP_MIN,
      name: "presses",
      vars: varNames.map((name) => ({ name, coef: 1 })),
    },
    subjectTo: [] as any[],
    bounds: [] as any[],
    generals: varNames,
  };
  for (let i = 0; i < nRows; i++) {
    const vars = [];
    for (let j = 0; j < nCols; j++) {
      if (buttonEffects[j].includes(i)) {
        vars.push({ name: varNames[j], coef: 1 });
      }
    }
    lp.subjectTo.push({
      name: `c${i}`,
      vars,
      bnds: { type: glpk.GLP_FX, ub: counters[i], lb: counters[i] },
    });
  }
  for (const name of varNames) {
    lp.bounds.push({ name, type: glpk.GLP_LO, lb: 0, ub: 0 });
  }
  const res = glpk.solve(lp, { presol: true, msglev: glpk.GLP_MSG_OFF });
  if (res.result.status !== glpk.GLP_OPT) {
    throw new Error("ILP failed");
  }
  return Math.round(res.result.z);
}

function solve(): void {
  const machines = parseInput("input.txt");
  let total1 = 0;
  let total2 = 0;
  const debug = process.env.DEBUG_MIN === "1";
  machines.forEach((m, idx) => {
    const p1 = minPresses(m);
    const p2 = minPressesJoltage(m);
    if (debug) console.log(idx, p1, p2);
    total1 += p1;
    total2 += p2;
  });
  console.log(`Part 1: ${total1}`);
  console.log(`Part 2: ${total2}`);
}

if (import.meta.main) {
  solve();
}
