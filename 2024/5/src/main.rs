//! Day 5 Solution
//!
//! Solution to AoC 2024 Day 5
//! https://adventofcode.com/2024/day/5

use itertools::Itertools;
use rayon::prelude::*;
use std::collections::HashMap;

fn parse(input: &str) -> (HashMap<u32, Vec<u32>>, Vec<Vec<u32>>) {
    let (rules_str, updates_str) = input.split_once("\n\n").unwrap();
    (
        rules_str
            .lines()
            .map(|rule| {
                rule.split('|')
                    .map(|n| n.parse().unwrap())
                    .collect_tuple()
                    .unwrap()
            })
            .fold(HashMap::new(), |mut map, (k, v)| {
                map.entry(k)
                    .and_modify(|x| x.push(v))
                    .or_insert_with(|| vec![v]);
                map
            }),
        updates_str
            .lines()
            .map(|update| update.split(',').map(|n| n.parse().unwrap()).collect())
            .collect(),
    )
}

fn part1(rules: &HashMap<u32, Vec<u32>>, updates: &[Vec<u32>]) -> u32 {
    updates
        .par_iter()
        .filter(|update| {
            update.iter().enumerate().all(|(i, entry)| {
                if i == 0 || !rules.contains_key(entry) {
                    true
                } else {
                    let entry_rules = &rules[entry];
                    !update[..i].iter().any(|prev| entry_rules.contains(prev))
                }
            })
        })
        .map(|update| update[update.len() / 2])
        .sum()
}

fn part2(rules: &HashMap<u32, Vec<u32>>, updates: &[Vec<u32>]) -> u32 {
    let incorrect_updates: Vec<Vec<u32>> = updates
        .par_iter()
        .filter(|update| {
            update.iter().enumerate().any(|(i, entry)| {
                if i == 0 || !rules.contains_key(entry) {
                    false
                } else {
                    let entry_rules = &rules[entry];
                    update[..i].iter().any(|prev| entry_rules.contains(prev))
                }
            })
        })
        .cloned()
        .collect();

    incorrect_updates
        .par_iter()
        .map(|update| {
            let mut sorted_update = update.clone();
            let mut i = 0;
            while i < sorted_update.len() {
                if !rules.contains_key(&sorted_update[i]) {
                    i += 1;
                    continue;
                }
                let entry_rules = &rules[&sorted_update[i]];
                let mut j = i + 1;
                while j < sorted_update.len() {
                    if entry_rules.contains(&sorted_update[j]) {
                        sorted_update.swap(i, j);
                        break;
                    }
                    j += 1;
                }
                if j == sorted_update.len() {
                    i += 1;
                }
            }
            sorted_update[sorted_update.len() / 2]
        })
        .sum()
}

fn main() {
    let input = include_str!("../input.txt");
    let (rules, updates) = parse(input);

    println!("Part 1: {:?}", part1(&rules, &updates));
    println!("Part 2: {:?}", part2(&rules, &updates));
}
