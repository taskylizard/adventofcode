from typing import List, LiteralString
import itertools
from functools import cache

input = open("input.txt").read().strip()


def transpose_listgrid(grid):
    """Transpose `grid`, where `grid` is a list of equal-length strings."""
    return list(map("".join, zip(*grid)))


def apply_n_times(f, x, n):
    """
    Apply `f` to `x` `n` times, returning the result.

    Assumes `f` is deterministic and takes one hashable argument.

    Saves time by finding the first cycle, calculating its length, and using that to skip ahead.
    """
    seen = {}
    for i in range(n):
        if x in seen:
            break
        seen[x] = i
        x = f(x)
    else:
        return x

    cycle_start = seen[x]
    cycle_len = i - cycle_start
    remaining = (n - i) % cycle_len
    return apply_n_times(f, x, remaining)


def roll_line_east(line):
    return "#".join(("".join(sorted(p)) for p in line.split("#")))


def roll_line_west(line):
    return "#".join(("".join(sorted(p, reverse=True)) for p in line.split("#")))


def roll_east(lines):
    return [roll_line_east(l) for l in lines]


def roll_west(lines):
    return [roll_line_west(l) for l in lines]


def roll_north(lines):
    return transpose_listgrid(roll_west(transpose_listgrid(lines)))


def roll_south(lines):
    return transpose_listgrid(roll_east(transpose_listgrid(lines)))


def calculate_load(lines):
    return sum((r + 1) * row.count("O") for r, row in enumerate(lines[::-1]))


def do_a_cycle(lines):
    return roll_east(roll_south(roll_west(roll_north(lines))))


def apply_cycle_to_input(data):
    return "\n".join(do_a_cycle(data.splitlines()))


print(calculate_load(roll_north((input.splitlines()))))

data = apply_n_times(apply_cycle_to_input, input, 1_000_000_000)
print(calculate_load(data.splitlines()))
