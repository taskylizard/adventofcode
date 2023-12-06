input = File.read("./input.txt").strip.lines

def part1(input : Array(String))
  time, distance = input.map(&.split[1..])
  time.zip(distance).product { |time, distance| (0_i64..time.to_i).count { |i| i * (time.to_i - i) > distance.to_i } }
end

def part2(input : Array(String))
  time, distance = input.map(&.split[1..].join)
  puts (0_i64..time.to_i64).count { |i| i * (time.to_i64 - i) > distance.to_i64 }
end

puts part1(input)
puts part2(input)
