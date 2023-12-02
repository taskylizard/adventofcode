import { run } from "aocity";

const mx = [1, -1, 0, 0, 1, 1, -1, -1];
const my = [0, 0, 1, -1, 1, -1, 1, -1];

run({
  part1: ({ readInput }) => {
    const grid = readInput("lines");
    let sum = 0;

    for (let i = 0; i < grid.length; ++i) {
      let numStart = -2;
      let numEnd = -2;
      let numMatch = false;
      for (let j = 0; j < grid[i].length; ++j) {
        if (!isNaN(Number(grid[i][j]))) {
          if (numStart < 0) {
            numStart = j;
            numMatch = false;
          }
          numEnd = j;
          for (let k = 0; k < 8; ++k) {
            if (
              i + mx[k] < 0 ||
              i + mx[k] >= grid.length ||
              j + my[k] < 0 ||
              j + my[k] >= grid[i].length
            )
              continue;
            if (grid[i + mx[k]][j + my[k]] !== "." && isNaN(Number(grid[i + mx[k]][j + my[k]]))) {
              numMatch = true;
            }
          }
        } else {
          if (numStart >= 0) {
            if (numMatch) {
              sum += Number(grid[i].slice(numStart, numEnd + 1));
            }
            numMatch = false;
            numStart = -1;
            numEnd = -1;
          }
        }
      }
      if (numMatch) {
        sum += Number(grid[i].slice(numStart, numEnd + 1));
      }
    }
    return sum;
  },
  part2: ({ readInput }) => {
    const grid = readInput("lines");
    let sum = 0;

    for (let i = 0; i < grid.length; ++i) {
      let start = -2;
      let end = -2;
      for (let j = 0; j < grid[i].length; ++j) {
        if (grid[i][j] === "*") {
          let matched = [];
          for (let k = 0; k < 8; ++k) {
            if (
              i + mx[k] < 0 ||
              i + mx[k] >= grid.length ||
              j + my[k] < 0 ||
              j + my[k] >= grid[i].length
            )
              continue;
            if (!isNaN(Number(grid[i + mx[k]][j + my[k]]))) {
              matched.push([i + mx[k], j + my[k]]);
            }
          }
          const around = new Set<string>();
          for (let k = 0; k < matched.length; ++k) {
            for (let l = matched[k][1]; l >= 0; --l) {
              if (!isNaN(Number(grid[matched[k][0]][l]))) {
                start = l;
              } else {
                break;
              }
            }
            for (let l = matched[k][1]; l < grid[matched[k][0]].length; ++l) {
              if (!isNaN(Number(grid[matched[k][0]][l]))) {
                end = l;
              } else {
                break;
              }
            }
            around.add([matched[k][0], start, end].join(","));
          }
          if (around.size === 2) {
            let answer = 1;
            for (const value of around.values()) {
              const [ii, start, end] = value.split(",").map((val) => Number(val));
              answer *= Number(grid[ii].slice(start, end + 1));
            }
            sum += answer;
          }
        }
      }
    }

    return sum;
  },
});
