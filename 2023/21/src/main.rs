use std::collections::BinaryHeap;
use std::collections::{HashMap, HashSet};

type Cords = (i32, i32);
type Map = HashMap<Cords, char>;
type State = (i32, Cords);

fn main() {
    let input = std::fs::read_to_string("input.txt").unwrap();
    println!("Part 1: {}", p1(&input));
    println!("Part 2: {}", p2(&input));
}

fn add(a: Cords, b: Cords) -> Cords {
    (a.0 + b.0, a.1 + b.1)
}

fn parser(s: &str) -> (Map, Cords) {
    let mut map: Map = HashMap::new();
    let mut initial = None;

    for (y, line) in s.lines().enumerate() {
        for (x, c) in line.chars().enumerate() {
            let y = y as i32;
            let x = x as i32;

            if c == 'S' {
                initial = Some((x, y));
                map.insert((x, y), '.');
            } else {
                map.insert((x, y), c);
            }
        }
    }
    (map, initial.unwrap())
}

fn solve(
    map: &Map,
    limit: i32,
    use_pu: bool,
    odd: &mut HashSet<Cords>,
    even: &mut HashSet<Cords>,
    visited: &mut HashMap<Cords, i32>,
    initial: &mut Vec<State>,
) -> usize {
    let mut frontier = BinaryHeap::new();
    frontier.extend(initial.iter().clone());
    initial.clear();

    let (max_x, max_y) = (
        map.keys().map(|p| p.0).max().unwrap(),
        map.keys().map(|p| p.1).max().unwrap(),
    );

    while let Some((d, pos)) = frontier.pop() {
        if d % 2 == 0 {
            even.insert(pos);
        } else {
            odd.insert(pos);
        }
        visited.insert(pos, d);

        if d == limit {
            initial.push((d, pos));
            continue;
        }

        for n in [(-1, 0), (0, -1), (0, 1), (1, 0)].iter() {
            let np = add(*n, pos);
            let nd = d + 1;
            let point = if use_pu {
                (np.0.rem_euclid(max_x + 1), np.1.rem_euclid(max_y + 1))
            } else {
                np
            };

            if let Some('.') = map.get(&point) {
                if let Some(&old) = visited.get(&np) {
                    if nd < old {
                        frontier.push((nd, np));
                    }
                } else {
                    frontier.push((nd, np));
                }
            }
        }
    }

    if limit % 2 == 0 {
        even.len()
    } else {
        odd.len()
    }
}

fn p1(input: &str) -> usize {
    let (map, start) = parser(input);
    let mut odd = HashSet::new();
    let mut even = HashSet::new();
    let mut visited = HashMap::new();
    let mut initial = vec![(0, start)];
    solve(
        &map,
        64,
        false,
        &mut odd,
        &mut even,
        &mut visited,
        &mut initial,
    )
}

fn p2(input: &str) -> usize {
    let mut past = vec![];
    let mut prev = 0;

    let (map, start) = parser(input);

    let max_x = map.keys().map(|p| p.0).max().unwrap();

    let check = max_x as usize + 1;
    let tgt = 26501365;

    let mut odd = HashSet::new();
    let mut even = HashSet::new();
    let mut visited = HashMap::new();
    let mut initial = vec![(0, start)];

    for i in 1.. {
        let next = solve(
            &map,
            i as i32,
            true,
            &mut odd,
            &mut even,
            &mut visited,
            &mut initial,
        );
        past.push(next - prev);
        prev = next;

        if i > 270 {
            let mut lut = vec![];
            let mut lut_d = vec![];
            for idx in (0..check).rev() {
                lut_d.push(past[i - 1 - idx] - past[i - 1 - check - idx]);
                lut.push(past[i - 1 - idx]);
            }
            let mut cur = next;
            for x in 0.. {
                let ndiff = lut[x % check] + lut_d[x % check];
                cur += ndiff;
                lut[x % check] = ndiff;
                if i + x + 1 == tgt {
                    return cur;
                }
            }
        }
    }

    unreachable!();
}
