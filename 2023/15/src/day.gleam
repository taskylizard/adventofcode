import gleam/io
import gleam/list
import gleam/string
import gleam/int
import simplifile.{read}
import gleam/dict
import gleam/option.{None, Some}
import gleam/pair
import gleam/result

pub fn main() {
  let assert Ok(file) = read(from: "./input.txt")
  io.println("Part 1: " <> p1(file))
  io.println("Part 2: " <> p2(file))
}

fn hash(char: String) -> Int {
  use current, grapheme <- list.fold(string.to_graphemes(char), 0)
  let assert [codepoint] = string.to_utf_codepoints(grapheme)
  let code = string.utf_codepoint_to_int(codepoint)
  let assert Ok(current) = int.remainder({ current + code } * 17, 256)
  current
}

fn p1(input: String) {
  string.trim(input)
  |> string.split(on: ",")
  |> list.map(hash)
  |> int.sum
  |> int.to_string
}

type Operation {
  Add(name: String, hash: Int, length: Int)
  Remove(name: String, hash: Int)
}

fn p2(input: String) {
  let boxes = {
    use boxes, operation <- list.fold(
      {
        use operation <- list.filter_map(
          string.trim(input)
          |> string.split(","),
        )

        use <- result.lazy_or({
          case string.split(operation, "=") {
            [name, length] -> {
              let assert Ok(length) = int.parse(length)
              Ok(Add(name, hash(name), length))
            }
            _ -> Error(Nil)
          }
        })

        case string.split(operation, "-") {
          [name, _] -> Ok(Remove(name, hash(name)))
          _ -> Error(Nil)
        }
      },
      dict.new(),
    )

    case operation {
      Add(name, hash, length) -> {
        use box <- dict.update(boxes, hash)

        case box {
          None -> [#(name, length)]
          Some(box) -> list.key_set(box, name, length)
        }
      }

      Remove(name, hash) -> {
        use box <- dict.update(boxes, hash)

        case box {
          None -> []

          Some(box) ->
            list.key_pop(box, name)
            |> result.map(pair.second)
            |> result.unwrap(box)
        }
      }
    }
  }

  dict.values({
    use hash, box <- dict.map_values(boxes)
    use index, #(_name, length) <- list.index_map(box)
    { 1 + hash } * { 1 + index } * length
  })
  |> list.flatten
  |> int.sum
  |> int.to_string
}
