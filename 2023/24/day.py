from itertools import combinations
import random
import numpy as np
from typing import List, Optional, Tuple
from scipy import optimize
import sympy as sp

with open("input.txt", "r") as file:
    input = file.read().strip().splitlines()


def get_lines(input: List[str]) -> List[Tuple[List[int], List[int]]]:
    lines: List[Tuple[List[int], List[int]]] = []
    for line in input:
        point_str, vec_str = line.split(" @ ")
        point = [int(i) for i in point_str.split(", ")]
        vec = [int(i) for i in vec_str.split(", ")]
        lines.append((point, vec))

    return lines


def get_intersect(
    line1: Tuple[List[int], List[int]], line2: Tuple[List[int], List[int]]
) -> Optional[Tuple[float, float]]:
    p1 = line1[0][:2]
    p2 = [x + tx for x, tx in zip(p1, line1[1][:2])]
    p3 = line2[0][:2]
    p4 = [x + tx for x, tx in zip(p3, line2[1][:2])]
    norm = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0])
    if norm == 0:
        return None
    px = (
        (p1[0] * p2[1] - p1[1] * p2[0]) * (p3[0] - p4[0])
        - (p1[0] - p2[0]) * (p3[0] * p4[1] - p3[1] * p4[0])
    ) / norm
    py = (
        (p1[0] * p2[1] - p1[1] * p2[0]) * (p3[1] - p4[1])
        - (p1[1] - p2[1]) * (p3[0] * p4[1] - p3[1] * p4[0])
    ) / norm
    if (px - p1[0]) / line1[1][0] < 0 or (px - p3[0]) / line2[1][0] < 0:
        return None
    return (px, py)


def get_intersections_in_area(
    lines: List[Tuple[List[int], List[int]]], minxy: int, maxxy: int
) -> int:
    result = 0
    for l1, l2 in combinations(lines, 2):
        try:
            x, y = get_intersect(l1, l2)
        except TypeError:
            continue
        if minxy <= x <= maxxy and minxy <= y <= maxxy:
            result += 1
    return result


def get_line_line_distance(solution: List[int], line2: Tuple[List[int], List[int]]):
    n = np.cross(solution[3:], line2[1])
    norm_n = np.linalg.norm(n)
    if norm_n < 1e-9:
        return 1e9
    return np.dot(n, np.array(solution[:3]) - np.array(line2[0])) / norm_n


def part2_numerically(lines: List[Tuple[List[int], List[int]]]) -> int:
    x0 = np.array([0, 0, 0, 1, 1, 1])
    x = optimize.least_squares(
        lambda x: [get_line_line_distance(x, line) for line in lines], x0
    )
    return sum(x[:3])


def part2_symbolically(lines: List[Tuple[List[int], List[int]]]) -> int:
    R = random.sample(lines, 3)

    # Define symbols
    P0x, P0y, P0z = sp.symbols("P0x P0y P0z", real=True)
    V0x, V0y, V0z = sp.symbols("V0x V0y V0z", real=True)
    t1, t2, t3 = sp.symbols("t1 t2 t3", real=True)
    times = [t1, t2, t3]
    pos_x1, pos_y1, pos_z1 = R[0][0]
    vel_x1, vel_y1, vel_z1 = R[0][1]
    pos_x2, pos_y2, pos_z2 = R[1][0]
    vel_x2, vel_y2, vel_z2 = R[1][1]
    pos_x3, pos_y3, pos_z3 = R[2][0]
    vel_x3, vel_y3, vel_z3 = R[2][1]

    pos = [(pos_x1, pos_y1, pos_z1), (pos_x2, pos_y2, pos_z2), (pos_x3, pos_y3, pos_z3)]
    vel = [(vel_x1, vel_y1, vel_z1), (vel_x2, vel_y2, vel_z2), (vel_x3, vel_y3, vel_z3)]

    # Define the system of equations
    equations = []
    for i in range(3):
        equations.append(sp.Eq(P0x + V0x * times[i], pos[i][0] + vel[i][0] * times[i]))
        equations.append(sp.Eq(P0y + V0y * times[i], pos[i][1] + vel[i][1] * times[i]))
        equations.append(sp.Eq(P0z + V0z * times[i], pos[i][2] + vel[i][2] * times[i]))

    # Solve the system of equations
    solution = sp.solve(equations, [P0x, P0y, P0z, V0x, V0y, V0z, t1, t2, t3])

    return sum(solution[0][:3])


def part1(input: List[str]) -> int:
    result = get_intersections_in_area(
        get_lines(input), 200000000000000, 400000000000000
    )
    print(f"Part 1: {result}")
    return result


def part2(input: List[str]) -> int:
    result = part2_symbolically(get_lines(input))
    print(f"Part 2: {result}")
    return result


if __name__ == "__main__":
    part1(input)
    part2(input)
