use std::cmp::Reverse;
use std::collections::{BinaryHeap, HashSet, VecDeque};

fn main() -> Result<(), ()> {
    let input = std::fs::read_to_string("input.txt").unwrap();

    let mut grid: Vec<Vec<Tile>> = input
        .lines()
        .map(|line| line.chars().map(Tile::from).collect())
        .collect();

    let start = (0..grid.len())
        .find_map(|x| (0..grid[x].len()).find_map(|j| (grid[x][j].start == true).then_some((x, j))))
        .unwrap();

    grid[start.0][start.1].north = start.0 > 0 && grid[start.0 - 1][start.1].south;
    grid[start.0][start.1].south = start.0 < grid.len() - 1 && grid[start.0 + 1][start.1].north;
    grid[start.0][start.1].west = start.1 > 0 && grid[start.0][start.1 - 1].east;
    grid[start.0][start.1].east =
        start.1 < grid[start.0].len() - 1 && grid[start.0][start.1 + 1].west;

    // Part 1
    let mut distance = 0;
    let mut frontier = BinaryHeap::new();
    let mut visited: HashSet<(usize, usize)> = HashSet::new();
    frontier.push((Reverse(0), start));
    while let Some((Reverse(k), (i, j))) = frontier.pop() {
        if !visited.insert((i, j)) {
            continue;
        }
        distance = distance.max(k);
        let cell = &grid[i][j];
        if cell.north {
            frontier.push((Reverse(k + 1), (i - 1, j)));
        }
        if cell.south {
            frontier.push((Reverse(k + 1), (i + 1, j)));
        }
        if cell.west {
            frontier.push((Reverse(k + 1), (i, j - 1)));
        }
        if cell.east {
            frontier.push((Reverse(k + 1), (i, j + 1)));
        }
    }
    println!("Part 1: {}", distance);

    // Part 2
    // Cells are not part of the loop.
    for i in 0..grid.len() {
        for j in 0..grid[i].len() {
            if !visited.contains(&(i, j)) {
                grid[i][j] = Default::default();
            }
        }
    }

    let mut expanded: Vec<Vec<Tile>> = grid
        .iter()
        .flat_map(|row| {
            [
                row.iter().flat_map(|cell| cell.expand()[0]).collect(),
                row.iter().flat_map(|cell| cell.expand()[1]).collect(),
            ]
        })
        .collect();

    let mut frontier: VecDeque<(usize, usize)> = VecDeque::new();
    let mut outsiders = 0;
    for i in 0..grid.len() {
        let exp_i = 2 * i;
        frontier.push_back((exp_i, 0));
        frontier.push_back((exp_i, expanded[exp_i].len() - 1));
    }
    for j in 0..grid[0].len() {
        let jx = 2 * j;
        frontier.push_back((0, jx));
        frontier.push_back((expanded.len() - 1, jx));
    }

    while let Some((i, j)) = frontier.pop_front() {
        if expanded[i][j] != Default::default() {
            continue;
        }
        expanded[i][j].outside = true;
        if i % 2 == 0 && j % 2 == 0 {
            outsiders += 1;
        }

        if i > 0 {
            frontier.push_back((i - 1, j));
        }
        if i < expanded.len() - 1 {
            frontier.push_back((i + 1, j));
        }
        if j > 0 {
            frontier.push_back((i, j - 1));
        }
        if j < expanded[i].len() - 1 {
            frontier.push_back((i, j + 1));
        }
    }

    let insiders = grid.len() * grid[0].len() - outsiders - visited.len();

    println!("Part 2: {}", insiders);
    Ok(())
}

#[derive(Debug, Clone, Copy, PartialEq, Default)]
struct Tile {
    north: bool,
    east: bool,
    south: bool,
    west: bool,
    start: bool,
    outside: bool,
}

impl Tile {
    fn from(char: char) -> Self {
        match char {
            // Start positions
            'O' | 'I' | '.' => Default::default(),
            'S' => Self {
                start: true,
                ..Default::default()
            },
            '|' => Self {
                north: true,
                south: true,
                ..Default::default()
            },
            '-' => Self {
                east: true,
                west: true,
                ..Default::default()
            },
            'L' => Self {
                north: true,
                east: true,
                ..Default::default()
            },
            'J' => Self {
                north: true,
                west: true,
                ..Default::default()
            },
            '7' => Self {
                south: true,
                west: true,
                ..Default::default()
            },
            'F' => Self {
                south: true,
                east: true,
                ..Default::default()
            },
            _ => panic!("{:?}", char),
        }
    }

    fn expand(&self) -> [[Tile; 2]; 2] {
        [
            [
                *self,
                Tile {
                    west: self.east,
                    east: self.east,
                    ..Default::default()
                },
            ],
            [
                Tile {
                    north: self.south,
                    south: self.south,
                    ..Default::default()
                },
                Default::default(),
            ],
        ]
    }
}
