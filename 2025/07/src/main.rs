use itertools::Itertools;
use rayon::prelude::*;
use std::collections::{HashSet, VecDeque};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct Position {
    x: usize,
    y: usize,
}

fn solve_part1(input: &str) -> usize {
    let grid: Vec<Vec<char>> = input.lines().map(|line| line.chars().collect()).collect();
    let height = grid.len();
    let width = grid[0].len();

    let start = grid
        .iter()
        .enumerate()
        .find_map(|(y, row)| {
            row.iter()
                .position(|&ch| ch == 'S')
                .map(|x| Position { x, y })
        })
        .unwrap();

    let mut split_count = 0;
    let mut processed_splitters = HashSet::new();

    let mut beams = VecDeque::new();
    beams.push_back(start);

    while let Some(pos) = beams.pop_front() {
        let mut current_y = pos.y;

        while current_y < height {
            let cell = grid[current_y][pos.x];

            if cell == '^' {
                let splitter_pos = Position {
                    x: pos.x,
                    y: current_y,
                };

                if !processed_splitters.contains(&splitter_pos) {
                    split_count += 1;
                    processed_splitters.insert(splitter_pos);

                    let new_positions: Vec<Position> = [pos.x.checked_sub(1), Some(pos.x + 1)]
                        .iter()
                        .flatten()
                        .filter(|&&x| x < width)
                        .map(|&x| Position { x, y: current_y })
                        .collect_vec();

                    beams.extend(new_positions);
                }
                break;
            }

            current_y += 1;
        }
    }

    split_count
}

fn count_timelines(
    x: usize,
    y: usize,
    grid: &[Vec<char>],
    memo: &mut Vec<Vec<Option<u64>>>,
) -> u64 {
    let height = grid.len();
    let width = grid[0].len();

    if let Some(result) = memo[y][x] {
        return result;
    }

    let mut current_y = y;

    while current_y < height {
        if grid[current_y][x] == '^' {
            let mut total = 0u64;

            if x > 0 {
                total += count_timelines(x - 1, current_y + 1, grid, memo);
            }
            if x + 1 < width {
                total += count_timelines(x + 1, current_y + 1, grid, memo);
            }

            memo[y][x] = Some(total);
            return total;
        }
        current_y += 1;
    }

    memo[y][x] = Some(1);
    1
}

fn solve_part2(input: &str) -> usize {
    let grid: Vec<Vec<char>> = input.lines().map(|line| line.chars().collect()).collect();
    let height = grid.len();
    let width = grid[0].len();

    let start = grid
        .iter()
        .enumerate()
        .find_map(|(y, row)| {
            row.iter()
                .position(|&ch| ch == 'S')
                .map(|x| Position { x, y })
        })
        .unwrap();

    let mut memo = vec![vec![None; width]; height];

    let result = count_timelines(start.x, start.y, &grid, &mut memo);
    result as usize
}

fn main() {
    let input = include_str!("../input.txt");
    let part1_result = solve_part1(input);
    let part2_result = solve_part2(input);
    println!("Part 1: {}", part1_result);
    println!("Part 2: {}", part2_result);

    let bigboy = include_str!("../bigboy.txt");
    let p1 = solve_part1(bigboy);
    let p2 = solve_part2(bigboy);
    println!("Bigboy p1: {}", p1);
    println!("Bigboy p2: {}", p2);
}
