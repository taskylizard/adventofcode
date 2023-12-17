use std::{cmp::Reverse as Rev, collections::BinaryHeap, num::NonZeroUsize};

fn main() {
    let input = std::fs::read_to_string("input.txt").unwrap();
    println!("Part 1: {:#?}", part1(&input));
    println!("Part 2: {:#?}", part2(&input));
}

#[derive(Debug)]
struct Grid {
    data: Box<[u8]>,
    offset: usize,
}

impl Grid {
    fn input(char: &str) -> Self {
        let mut lines = char.lines().peekable();
        let line_len = lines.peek().map_or(0, |l| l.len());
        Self {
            data: lines
                .flat_map(str::as_bytes)
                .map(|&c| c - b'0')
                .collect::<Box<_>>(),
            offset: line_len,
        }
    }

    const fn next(&self, p: usize, dir: u8) -> Option<usize> {
        // 0 = up, 1 = right, 2 = down, 3 = left
        Some(match dir {
            0 if p > self.offset => p - self.offset,
            1 if (p + 1) % self.offset != 0 => p + 1,
            2 if p < self.data.len() - self.offset => p + self.offset,
            3 if p % self.offset != 0 => p - 1,
            _ => return None,
        })
    }

    fn run(&self, dmin: usize, dmax: usize) -> Option<NonZeroUsize> {
        let lp = self.data.len() - 1;
        let mut visited = vec![0u8; self.data.len()];
        // Cache for vertical and horizontal directions
        let mut cache = vec![usize::MAX; 2 * self.data.len()];
        let mut heap = BinaryHeap::new();
        heap.push((Rev(0), 0, 0));
        heap.push((Rev(0), 0, 1));
        while let Some((Rev(cost), p, dir)) = heap.pop() {
            if p == lp {
                return NonZeroUsize::new(cost);
            }
            if visited[p] & (1u8 << dir) != 0 {
                continue;
            }
            visited[p] |= 1u8 << dir;
            let odir = dir ^ 1;
            for nd in [odir, odir ^ 2] {
                let mut costsum = 0;
                let mut np = p;
                for dist in 1..=dmax {
                    if let Some(op) = self.next(np, nd) {
                        costsum += self.data[op] as usize;
                        if dist >= dmin {
                            let ncost = cost + costsum;
                            let cache_idx = (op << 1) | odir as usize;
                            if cache[cache_idx] > ncost {
                                cache[cache_idx] = ncost;
                                heap.push((Rev(ncost), op, odir));
                            }
                        }
                        np = op;
                    }
                }
            }
        }
        None
    }
}

fn solve(input: &str, dmin: usize, dmax: usize) -> Option<NonZeroUsize> {
    Grid::input(input).run(dmin, dmax)
}

fn part1(input: &str) -> NonZeroUsize {
    solve(input, 1, 3).unwrap()
}

fn part2(input: &str) -> NonZeroUsize {
    solve(input, 4, 10).unwrap()
}
