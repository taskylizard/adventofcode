from typing import List


def solve(input: List[str]):
    grids = [grid.split("\n") for grid in input]
    total = [0, 0]
    for grid in grids:
        for grid, mul in [(grid, 100), (list(zip(*grid)), 1)]:
            for y in range(1, len(grid)):
                c = sum(
                    sum(a != b for a, b in zip(grid[y - j - 1], grid[y + j]))
                    for j in range(min(y, len(grid) - y))
                )
                if c < 2:
                    total[c] += mul * y
    return total


with open("input.txt", "r") as file:
    input = file.read().strip().split("\n\n")
    print(*solve(input))
