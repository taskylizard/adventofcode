from __future__ import annotations

from bisect import bisect_right, bisect_left
from pathlib import Path
from typing import Iterable, Tuple, List, Dict


def read_points(path: Path) -> Iterable[Tuple[int, int]]:
    # parse input lines shaped as 'x,y' into integer pairs
    with path.open() as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            x_str, y_str = line.split(",")
            yield int(x_str), int(y_str)


def rect_area(p1: Tuple[int, int], p2: Tuple[int, int]) -> int:
    # inclusive area using opposite corners
    return (abs(p1[0] - p2[0]) + 1) * (abs(p1[1] - p2[1]) + 1)


def build_edge_structs(points: List[Tuple[int, int]]):
    # build vertical/horizontal edges plus lookup helpers
    n = len(points)
    v_edges: List[Tuple[int, int, int]] = []  # x, y0, y1 (sorted)
    h_edges: List[Tuple[int, int, int]] = []  # x0, x1, y
    vert_map: Dict[int, List[Tuple[int, int]]] = {}
    horiz_map: Dict[int, List[Tuple[int, int]]] = {}

    for i in range(n):
        x1, y1 = points[i]
        x2, y2 = points[(i + 1) % n]
        if x1 == x2:
            y0, y1b = sorted((y1, y2))
            v_edges.append((x1, y0, y1b))
            vert_map.setdefault(x1, []).append((y0, y1b))
        else:
            x0, x1b = sorted((x1, x2))
            h_edges.append((x0, x1b, y1))
            horiz_map.setdefault(y1, []).append((x0, x1b))

    v_edges.sort(key=lambda e: e[0])
    h_edges.sort(key=lambda e: e[2])

    # precompute crossing x positions for each interesting y (all red y's)
    ys_of_interest = set(y for _, y in points)
    crossings_by_y: Dict[int, List[int]] = {}
    for y in ys_of_interest:
        xs = []
        for x, y0, y1b in v_edges:
            if y0 <= y <= y1b:
                xs.append(x)
        xs.sort()
        crossings_by_y[y] = xs

    return v_edges, h_edges, vert_map, horiz_map, crossings_by_y


def point_in_poly_fast(
    px: int,
    py: int,
    vert_map: Dict[int, List[Tuple[int, int]]],
    horiz_map: Dict[int, List[Tuple[int, int]]],
    crossings_by_y: Dict[int, List[int]],
) -> bool:
    # boundary check first
    for y0, y1 in vert_map.get(px, ()):
        if y0 <= py <= y1:
            return True
    for x0, x1 in horiz_map.get(py, ()):
        if x0 <= px <= x1:
            return True

    xs = crossings_by_y[py]
    idx = bisect_right(xs, px)
    return (len(xs) - idx) % 2 == 1


def rectangle_inside_polygon(
    p1: Tuple[int, int],
    p2: Tuple[int, int],
    v_edges: List[Tuple[int, int, int]],
    h_edges: List[Tuple[int, int, int]],
    vert_map: Dict[int, List[Tuple[int, int]]],
    horiz_map: Dict[int, List[Tuple[int, int]]],
    crossings_by_y: Dict[int, List[int]],
) -> bool:
    x0, x1 = sorted((p1[0], p2[0]))
    y0, y1 = sorted((p1[1], p2[1]))

    # all four corners must be inside/on boundary
    for cx, cy in ((x0, y0), (x0, y1), (x1, y0), (x1, y1)):
        if cy not in crossings_by_y:
            return False  # y not part of polygon scanlines -> outside
        if not point_in_poly_fast(cx, cy, vert_map, horiz_map, crossings_by_y):
            return False

    # check vertical edges intersect rectangle interior
    vx_list = [e[0] for e in v_edges]
    start = bisect_right(vx_list, x0)
    end = bisect_left(vx_list, x1)
    for idx in range(start, end):
        x, ey0, ey1 = v_edges[idx]
        low = max(ey0, y0)
        high = min(ey1, y1)
        if high > low:
            return False

    # check horizontal edges intersect interior
    hy_list = [e[2] for e in h_edges]
    start = bisect_right(hy_list, y0)
    end = bisect_left(hy_list, y1)
    for idx in range(start, end):
        x0e, x1e, y = h_edges[idx]
        low = max(x0e, x0)
        high = min(x1e, x1)
        if high > low:
            return False

    return True


def solve(points: List[Tuple[int, int]]) -> Tuple[int, int]:
    n = len(points)
    v_edges, h_edges, vert_map, horiz_map, crossings_by_y = build_edge_structs(points)

    best1 = 0
    best2 = 0
    for i in range(n - 1):
        p_i = points[i]
        for j in range(i + 1, n):
            p_j = points[j]
            area = rect_area(p_i, p_j)
            if area > best1:
                best1 = area
            if area > best2 and rectangle_inside_polygon(
                p_i, p_j, v_edges, h_edges, vert_map, horiz_map, crossings_by_y
            ):
                best2 = area
    return best1, best2


def main():
    points = list(read_points(Path("input.txt")))
    part1, part2 = solve(points)
    print(f"Part 1: {part1}")
    print(f"Part 2: {part2}")


if __name__ == "__main__":
    main()
