input = File.read("input.txt").strip.split("\n")

# parse ranges and ingredient ids
ranges = [] of Tuple(Int64, Int64)
ingredient_ids = [] of Int64
blank_index = 0

input.each_with_index do |line, i|
  if line.empty?
    blank_index = i
  elsif i < (blank_index != 0 ? blank_index : input.size)
    # parse range "start-end"
    if match = line.match(/^(.+)-(\d+)$/)
      start = match[1].to_i64
      end_val = match[2].to_i64
      ranges << {start, end_val}
    end
  else
    # parse ingredient id
    ingredient_ids << line.to_i64
  end
end

# part 1: count fresh ingredients from the list
fresh_count = ingredient_ids.count do |id|
  ranges.any? { |start, end_val| id >= start && id <= end_val }
end

puts "Part 1: #{fresh_count}\n"

# part 2: count all unique ids in ranges (merge overlapping ranges first)
sorted_ranges = ranges.sort

merged = [] of Tuple(Int64, Int64)
sorted_ranges.each do |start, end_val|
  if merged.empty?
    merged << {start, end_val}
  else
    last_start, last_end = merged[-1]
    if start <= last_end + 1
      # overlapping or adjacent, merge
      merged[-1] = {last_start, {last_end, end_val}.max}
    else
      # non-overlapping, add new range
      merged << {start, end_val}
    end
  end
end

# count total ids in merged ranges
total_fresh = 0_i64
merged.each do |start, end_val|
  total_fresh += (end_val - start + 1)
end

puts "Part 2: #{total_fresh}"
