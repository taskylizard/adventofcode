input = File.read("./input.txt")

def parse(input)
  seeds, *maps_parts = input.split(/\n\n/)
  seeds = seeds.split.tap(&.shift).map(&.to_i64)

  maps = [] of Array({Int64, Int64, Int64})

  maps_parts.each do |map|
    map_data = map.lines.tap(&.shift).map(&.split.map(&.to_i64))
    maps << map_data.map { |a| {a[1], a[1] + a[2] - 1, a[0] - a[1]} }
  end
  {seeds, maps}
end

def solve(range, maps)
  maps.each do |ranges|
    next_range = [] of {Int64, Int64}

    range.each do |a, b|
      unless found = ranges.find { |ra, rb, _| a.in?(ra..rb) || ra.in?(a..b) }
        next_range << {a, b}
        next
      end

      ra, rb, diff = found
      case
      when a >= ra && b <= rb
        next_range << {a + diff, b + diff}
      when a < ra && b > rb
        next_range << {a, ra - 1}
        next_range << {ra + diff, rb + diff}
        range << {rb + 1, b}
      when a >= ra && b > rb
        next_range << {a + diff, rb + diff}
        range << {rb + 1, b}
      when a < ra && b <= rb
        next_range << {a, ra - 1}
        next_range << {ra + diff, b + diff}
      end
    end
    range = next_range
  end
  range.min_of(&.[0])
end

def part1(input)
  seeds, maps = parse(input)
  input = seeds.map { |x| {x, x} }
  puts solve input, maps
end

def part2(input)
  seeds, maps = parse(input)
  input = seeds.each_slice(2).map { |a| {a[0], a[0] + a[1] - 1} }.to_a
  puts solve input, maps
end

puts part1 input
puts part2 input
