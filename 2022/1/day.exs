data =
  File.read!("./input.txt")
  |> String.trim()
  |> String.split("\n\n")
  |> Enum.map(fn elf ->
    elf
    |> String.split("\n")
    |> Enum.map(fn elf -> elf |> String.to_integer() end)
    |> Enum.sum()
  end)

p1 = data |> Enum.max()

p2 =
  data
  |> Enum.sort(:desc)
  |> Enum.slice(0..2)
  |> Enum.sum()

IO.puts("Part 1: " <> Integer.to_string(p1))
IO.puts("Part 2: " <> Integer.to_string(p2))
