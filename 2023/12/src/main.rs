use itertools::Itertools;
use std::collections::HashMap;

fn main() {
    let input = std::fs::read_to_string("input.txt").unwrap();
    let mut p1 = 0;
    let mut p2 = 0;
    for line in input.lines() {
        let parts = line.split_ascii_whitespace().collect_vec();
        let conditions = parts[1]
            .split(',')
            .map(|x| x.parse::<usize>().unwrap())
            .collect_vec();
        p1 += solve(&mut Default::default(), parts[0], &conditions);

        let s = std::iter::repeat(parts[0]).take(5).join("?");
        let conds = conditions.repeat(5);
        p2 += solve(&mut Default::default(), &s, &conds);
    }

    println!("Part 1: {}", p1);
    println!("Part 2: {}", p2);
}

fn solve(memo: &mut HashMap<(usize, usize), usize>, row: &str, conds: &[usize]) -> usize {
    let mut num = 0;

    if conds.len() == 0 {
        return (!row.contains('#')) as usize;
    }
    if row.len() < conds[0] {
        return 0;
    }
    let key = (row.as_ptr() as usize, conds.as_ptr() as usize);
    if memo.contains_key(&key) {
        return memo[&key];
    }
    if row[..conds[0]].chars().all(|x| ['?', '#'].contains(&x))
        && (row.len() == conds[0] || row.as_bytes()[conds[0]] != b'#')
    {
        if row.len() == conds[0] {
            if conds.len() == 1 {
                num += 1;
            }
        } else {
            num += solve(memo, &row[conds[0] + 1..], &conds[1..]);
        }
    }
    if row.as_bytes()[0] != b'#' {
        num += solve(memo, &row[1..], conds);
    }
    memo.insert(key, num);
    num
}

