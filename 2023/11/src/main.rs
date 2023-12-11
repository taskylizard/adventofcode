use itertools::Itertools;

fn main() {
    let universe = std::fs::read_to_string("input.txt")
        .unwrap()
        .lines()
        .map(|l| l.as_bytes().to_vec())
        .collect::<Vec<_>>();

    let galaxies: Vec<_> = (0..universe.len())
        .flat_map(|r| (0..universe[0].len()).map(move |c| (r, c)))
        .filter(|&(r, c)| universe[r][c] == b'#')
        .collect();

    let p1 = parse(&universe, galaxies.clone(), 2);
    let p2 = parse(&universe, galaxies, 1_000_000);

    println!("Part 1: {}", p1);
    println!("Part 2: {}", p2);
}

fn parse(universe: &Vec<Vec<u8>>, mut galaxies: Vec<(usize, usize)>, size: usize) -> usize {
    let (rows, cols) = (universe.len(), universe[0].len());
    let empty_rows = (0..rows)
        .rev()
        .filter(|&r| universe[r].iter().all(|&c| c == b'.'));
    let empty_cols = (0..cols)
        .rev()
        .filter(|&c| (0..rows).all(|r| universe[r][c] == b'.'));
    for r in empty_rows {
        for g in &mut galaxies {
            if g.0 > r {
                g.0 += size - 1
            }
        }
    }
    for c in empty_cols {
        for g in &mut galaxies {
            if g.1 > c {
                g.1 += size - 1
            }
        }
    }

    galaxies
        .iter()
        .tuple_combinations()
        .map(|(&(r1, c1), &(r2, c2))| r1.abs_diff(r2) + c1.abs_diff(c2))
        .sum()
}
