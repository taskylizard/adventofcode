# https://en.wikipedia.org/wiki/Shoelace_formula
data =
  File.read!("./input.txt")
  |> String.trim()
  |> String.split("\n")

p1 =
  data
  |> Enum.map(fn line ->
    [d, n, h] =
      line
      |> String.replace(~r/[#()]/, "")
      |> String.split(" ")

    {d, String.to_integer(n)}
  end)
  |> Enum.to_list()
  |> Enum.reduce({{0, 0}, 0, 0, 0}, fn {d, n}, {{x, y}, sum1, sum2, border_len} ->
    {dx, dy} =
      case d do
        "R" -> {0, 1}
        "L" -> {0, -1}
        "U" -> {-1, 0}
        "D" -> {1, 0}
      end

    nx = x + n * dx
    ny = y + n * dy

    {{nx, ny}, sum1 + x * ny, sum2 + y * nx, border_len + n}
  end)
  |> then(fn {_, s1, s2, b} ->
    area = abs(s1 - s2) |> div(2)
    area + div(b, 2) + 1
  end)

p2 =
  data
  |> Enum.map(fn s ->
    [d, n, h] =
      s
      |> String.replace(~r/[#()]/, "")
      |> String.split(" ")

    {n, d} = String.split_at(h, -1)
    d = %{"0" => "R", "1" => "D", "2" => "L", "3" => "U"}[d]
    {d, String.to_integer(n, 16)}
  end)
  |> Enum.to_list()
  |> Enum.reduce({{0, 0}, 0, 0, 0}, fn {d, n}, {{x, y}, sum1, sum2, border_len} ->
    {dx, dy} =
      case d do
        "R" -> {0, 1}
        "L" -> {0, -1}
        "U" -> {-1, 0}
        "D" -> {1, 0}
      end

    nx = x + n * dx
    ny = y + n * dy

    {{nx, ny}, sum1 + x * ny, sum2 + y * nx, border_len + n}
  end)
  |> then(fn {_, s1, s2, b} ->
    area = abs(s1 - s2) |> div(2)
    area + div(b, 2) + 1
  end)

IO.puts("Part 1: #{p1}")
IO.puts("Part 2: #{p2}")
