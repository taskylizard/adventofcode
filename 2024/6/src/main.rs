//! Day 6 Solution
//!
//! Solution to AoC 2024 Day 6
//! https://adventofcode.com/2024/day/6
use std::time::Instant;

use im::HashSet;
use rayon::prelude::*;

#[derive(Clone, PartialEq, Eq, Copy)]
enum Cell {
    Open,
    Blocked,
}

#[derive(Clone, PartialEq, Eq, Copy, Hash)]
enum Direction {
    Up,
    Down,
    Left,
    Right,
}

#[derive(Clone, PartialEq, Eq, Copy, Hash)]
struct Guard {
    i: i64,
    j: i64,
    direction: Direction,
}

impl Guard {
    fn direction(&self) -> (i64, i64) {
        match self.direction {
            Direction::Up => (-1, 0),
            Direction::Down => (1, 0),
            Direction::Left => (0, -1),
            Direction::Right => (0, 1),
        }
    }

    fn turn_right(&self) -> Guard {
        let dir = match self.direction {
            Direction::Left => Direction::Up,
            Direction::Up => Direction::Right,
            Direction::Right => Direction::Down,
            Direction::Down => Direction::Left,
        };
        Guard {
            direction: dir,
            i: self.i,
            j: self.j,
        }
    }

    fn advance(&self) -> Guard {
        let (di, dj) = self.direction();
        Guard {
            i: self.i + di,
            j: self.j + dj,
            direction: self.direction,
        }
    }
}

fn parse_direction(c: char) -> Option<Direction> {
    match c {
        '>' => Some(Direction::Right),
        '<' => Some(Direction::Left),
        '^' => Some(Direction::Up),
        'v' => Some(Direction::Down),
        _ => None,
    }
}

fn parse(s: &str) -> (Vec<Vec<Cell>>, Guard) {
    let grid = s
        .lines()
        .map(|line| {
            line.trim()
                .as_bytes()
                .to_vec()
                .iter()
                .map(|b| {
                    if *b == b'#' {
                        Cell::Blocked
                    } else {
                        Cell::Open
                    }
                })
                .collect()
        })
        .collect();
    let guards: Vec<Guard> = s
        .lines()
        .enumerate()
        .flat_map(|(i, line)| {
            let line: Vec<Guard> = line
                .trim()
                .as_bytes()
                .to_vec()
                .iter()
                .map(|c| *c as char)
                .enumerate()
                .filter_map(|(j, c)| {
                    parse_direction(c).map(|dir| Guard {
                        i: i as i64,
                        j: j as i64,
                        direction: dir,
                    })
                })
                .collect();
            line
        })
        .collect();
    (grid, guards[0])
}

fn inbounds(grid: &[Vec<Cell>], guard: &Guard) -> bool {
    0 <= guard.i && guard.i < grid.len() as i64 && 0 <= guard.j && guard.j < grid[0].len() as i64
}

fn collision(grid: &[Vec<Cell>], guard: &Guard) -> bool {
    if !inbounds(grid, guard) {
        false
    } else {
        grid[guard.i as usize][guard.j as usize] == Cell::Blocked
    }
}

fn main() {
    let input = include_str!("../input.txt");

    let part1_start = Instant::now();
    let part1 = {
        let (grid, mut guard) = parse(input);
        let mut visited = vec![vec![false; grid[0].len()]; grid.len()];
        while inbounds(&grid, &guard) {
            visited[guard.i as usize][guard.j as usize] = true;
            let new_guard = guard.advance();
            if collision(&grid, &new_guard) {
                guard = guard.turn_right();
            } else {
                guard = new_guard;
            }
        }

        let result = visited
            .par_iter()
            .map(|line| {
                line.par_iter()
                    .map(|b| if *b { 1 } else { 0 })
                    .reduce(|| 0, |x, y| x + y)
            })
            .reduce(|| 0, |x, y| x + y);

        result.to_string()
    };
    let part1_time = part1_start.elapsed().as_millis();

    let part2_start = Instant::now();
    let part2 = {
        let (grid, guard) = parse(input);

        let blockages: Vec<(usize, usize)> = (0..grid.len())
            .flat_map(|i| (0..grid[0].len()).map(move |j| (i, j)))
            .collect();
        let result = blockages
            .par_iter()
            .map(|(i, j)| {
                if *i as i64 == guard.i && *j as i64 == guard.j || grid[*i][*j] == Cell::Blocked {
                    return 0;
                }
                let mut guard = guard;
                let mut prevs: HashSet<Guard> = HashSet::new();

                while inbounds(&grid, &guard) && !prevs.contains(&guard) {
                    prevs.insert(guard);
                    let new_guard = guard.advance();
                    if collision(&grid, &new_guard)
                        || (new_guard.i == *i as i64 && new_guard.j == *j as i64)
                    {
                        guard = guard.turn_right();
                    } else {
                        guard = new_guard;
                    }
                }
                if prevs.contains(&guard) {
                    1
                } else {
                    0
                }
            })
            .reduce(|| 0, |x, y| x + y);

        result.to_string()
    };

    let part2_time = part2_start.elapsed().as_millis();
    println!("Part 1: {} (took {}ms)", part1, part1_time);
    println!("Part 2: {} (took {}ms)", part2, part2_time);
}
