input = File.read("./input.txt").lines

def part1(input : Array(String))
  cardnums = input.map &.partition(":")[2].split("|").map &.split
  matched = cardnums.map { |num| (num[0] & num[1]).size }

  puts "Part 1:", matched.sum { |x| 1 << (x - 1) }
end

def part2(input : Array(String))
  cardnums = input.map &.partition(":")[2].split("|").map &.split
  matched = cardnums.map { |num| (num[0] & num[1]).size }
  pp matched.sum
  counts = Array.new(matched.size, 1)
  val = matched.sum do |c|
    v = counts.shift
    c.times { |i| counts[i] += v }
    v
  end

  puts "Part 2:", val
end

part1(input)
part2(input)
