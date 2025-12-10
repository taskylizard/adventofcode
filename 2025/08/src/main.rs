/// kruskal-style process with a disjoint set union (union‑find) to merge components in distance order
use rayon::prelude::*;

const K: usize = 1000;

#[derive(Clone, Copy)]
struct Point {
    x: i64,
    y: i64,
    z: i64,
}

#[derive(Debug)]
struct UnionFind {
    parent: Vec<usize>,
    size: Vec<u64>,
}

impl UnionFind {
    fn new(n: usize) -> Self {
        Self {
            parent: (0..n).collect(),
            size: vec![1; n],
        }
    }

    fn find(&mut self, x: usize) -> usize {
        if self.parent[x] != x {
            self.parent[x] = self.find(self.parent[x]);
        }
        self.parent[x]
    }

    fn union(&mut self, a: usize, b: usize) {
        let ra = self.find(a);
        let rb = self.find(b);
        if ra == rb {
            return;
        }
        if self.size[ra] < self.size[rb] {
            self.parent[ra] = rb;
            self.size[rb] += self.size[ra];
        } else {
            self.parent[rb] = ra;
            self.size[ra] += self.size[rb];
        }
    }
}

fn component_sizes(uf: &mut UnionFind) -> Vec<u64> {
    let n = uf.parent.len();
    let mut sizes = Vec::new();
    for i in 0..n {
        if uf.find(i) == i {
            sizes.push(uf.size[i]);
        }
    }
    sizes
}

fn parse_input() -> Vec<Point> {
    const INPUT: &str = include_str!("../input.txt");
    INPUT
        .lines()
        .filter(|l| !l.trim().is_empty())
        .map(|line| {
            let mut it = line
                .split(',')
                .map(|v| v.trim().parse::<i64>().expect("bad number"));
            Point {
                x: it.next().expect("x missing"),
                y: it.next().expect("y missing"),
                z: it.next().expect("z missing"),
            }
        })
        .collect()
}

#[inline]
fn dist2(a: Point, b: Point) -> u128 {
    let dx = (a.x - b.x) as i128;
    let dy = (a.y - b.y) as i128;
    let dz = (a.z - b.z) as i128;
    (dx * dx + dy * dy + dz * dz) as u128
}

fn main() {
    let points = parse_input();
    let n = points.len();
    if n < 3 {
        println!("Part 1: 0");
        println!("Part 2: 0");
        return;
    }

    // Build full edge list in parallel.
    let edge_chunks: Vec<Vec<(u128, usize, usize)>> = (0..n)
        .into_par_iter()
        .map(|i| {
            let mut v = Vec::with_capacity(n - i - 1);
            for j in (i + 1)..n {
                let d = dist2(points[i], points[j]);
                v.push((d, i, j));
            }
            v
        })
        .collect();

    let total_edges: usize = edge_chunks.iter().map(|v| v.len()).sum();
    let mut edges = Vec::with_capacity(total_edges);
    for chunk in edge_chunks {
        edges.extend(chunk);
    }
    edges.sort_unstable_by(|a, b| a.0.cmp(&b.0));

    // Part 1: connect K closest pairs.
    let mut uf1 = UnionFind::new(n);
    for &(_d, a, b) in edges.iter().take(K) {
        uf1.union(a, b);
    }

    let mut sizes1 = component_sizes(&mut uf1);
    sizes1.sort_unstable_by(|a, b| b.cmp(a));

    let answer1 = match sizes1.get(0..3) {
        Some(top3) => top3.iter().product::<u64>(),
        None => 0,
    };

    // Part 2: Kruskal until single component; track last edge used.
    let mut uf2 = UnionFind::new(n);
    let mut components = n;
    let mut last_edge = None;
    for &(_d, a, b) in &edges {
        let ra = uf2.find(a);
        let rb = uf2.find(b);
        if ra != rb {
            uf2.union(ra, rb);
            components -= 1;
            last_edge = Some((a, b));
            if components == 1 {
                break;
            }
        }
    }

    let answer2 = if let Some((a, b)) = last_edge {
        (points[a].x as i128 * points[b].x as i128) as i128
    } else {
        0
    };

    println!("Part 1: {}", answer1);
    println!("Part 2: {}", answer2);
}
