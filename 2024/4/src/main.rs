use itertools::Itertools;
use rayon::prelude::*;
use std::str::FromStr;

#[derive(Eq, PartialEq, Debug, Clone)]
struct Grid {
    cells: Vec<Vec<char>>,
}

type Coordinates = (usize, usize);

fn apply_delta(
    (x, y): &Coordinates,
    (dx, dy): &(isize, isize),
    magnitude: usize,
) -> Option<Coordinates> {
    x.checked_add_signed(dx * magnitude as isize)
        .zip(y.checked_add_signed(dy * magnitude as isize))
}

impl Grid {
    fn find_all(&self, letter: &char) -> Vec<Coordinates> {
        let mut coords = Vec::new();
        for (y, row) in self.cells.iter().enumerate() {
            for (x, cell) in row.iter().enumerate() {
                if cell == letter {
                    coords.push((x, y))
                }
            }
        }

        coords
    }

    fn words_from(&self, start: &Coordinates, length: usize) -> Vec<String> {
        let deltas = [
            (-1, 0),
            (-1, -1),
            (0, -1),
            (1, -1),
            (1, 0),
            (1, 1),
            (0, 1),
            (-1, 1),
        ];
        deltas
            .iter()
            .map(|delta| self.get_word(start, length, delta))
            .collect()
    }

    fn get_word(&self, start: &Coordinates, length: usize, delta: &(isize, isize)) -> String {
        (0..length)
            .flat_map(|magnitude| apply_delta(start, delta, magnitude))
            .flat_map(|coord| self.at(&coord))
            .join("")
    }

    fn at(&self, &(x, y): &Coordinates) -> Option<&char> {
        self.cells.get(y).and_then(|row| row.get(x))
    }

    fn word_count(&self, search: &String) -> usize {
        let start = search.chars().next().expect("Word must not be empty");
        self.find_all(&start)
            .par_iter() // Parallel iterator
            .flat_map(|coord| self.words_from(coord, search.len()))
            .filter(|word| word == search)
            .count()
    }

    fn is_xmas(&self, coord: &Coordinates) -> bool {
        let top_left =
            apply_delta(coord, &(-1, -1), 1).map(|start| self.get_word(&start, 3, &(1, 1)));
        let top_right =
            apply_delta(coord, &(1, -1), 1).map(|start| self.get_word(&start, 3, &(-1, 1)));

        self.at(coord) == Some(&'A')
            && (top_left == Some("MAS".to_string()) || top_left == Some("SAM".to_string()))
            && (top_right == Some("MAS".to_string()) || top_right == Some("SAM".to_string()))
    }

    fn count_x_masses(&self) -> usize {
        self.find_all(&'A')
            .par_iter()
            .filter(|coord| self.is_xmas(coord))
            .count()
    }
}

impl FromStr for Grid {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let cells = s.lines().map(|l| l.chars().collect()).collect();

        Ok(Grid { cells })
    }
}

fn main() {
    let input = include_str!("../input.txt");

    let search = Grid::from_str(input).unwrap();

    println!("Part 1: {}", search.word_count(&"XMAS".to_string()));
    println!("Part 2: {}", search.count_x_masses());
}
