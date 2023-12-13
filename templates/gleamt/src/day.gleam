import gleam/io
import gleam/string.{split}
import simplifile.{read}

pub fn main() {
  let assert Ok(file) = read(from: "./input.txt")
  io.debug(split(file, on: "\n"))
}
