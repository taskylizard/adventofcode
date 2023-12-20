alias Part = Hash(Char, Int32)
alias Shelve = Hash(Char, Range(Int32, Int32))

struct Range(B, E)
  def covers?(other : Range(B, E))
    return false if !self.covers?(other.begin)

    my_end = self.excludes_end? ? self.end - 1 : self.end
    other_end = other.excludes_end? ? other.end - 1 : other.end
    return (self.begin..my_end).covers?(other_end)
  end

  def overlaps?(other : Range(B, E))
    return true if other.covers?(self)

    return true if self.covers?(other.begin)

    my_end = self.excludes_end? ? self.end - 1 : self.end
    other_end = other.excludes_end? ? other.end - 1 : other.end
    return (self.begin..my_end).covers?(other_end)
  end

  def *(other : Range(B, E)) : Range(B, E)
    return [self.begin, other.begin].max..[self.end, other.end].min
  end

  def -(other : Range(B, E)) : Array(Range(B, E))
    return [] of self if other.covers?(self)
    return [self] if !other.overlaps?(self)

    my_end = self.excludes_end? ? self.end - 1 : self.end
    other_end = other.excludes_end? ? other.end - 1 : other.end
    return [(self.begin..(other.begin - 1)), ((other_end + 1)..my_end)].select { |r| !r.empty? }
  end
end

class Filter
  property attr
  property range
  property state

  def initialize(@attr : Char, @range : Range(Int32, Int32), @state : String)
    @pass = (@attr == ' ')
  end

  def prune(other : Filter)
    return if other.attr != self.attr

    if other.range.covers?(@range)
      raise "#{@attr}#{@range} fully covered by #{other.range}"
    elsif other.range.overlaps?(@range)
      @range = (@range - other.range)[0]
    end
  end

  def match(part : Part) : String
    if @pass
      @state
    elsif @range.covers?(part[@attr])
      @state
    else
      ""
    end
  end

  def split(shelve : Shelve) : Tuple(Shelve, Array(Shelve))
    return {shelve, [] of Shelve} if @pass

    return {
      shelve.merge({@attr => shelve[@attr] * @range}),
      (shelve[@attr] - @range).map { |rng| shelve.merge({@attr => rng}) },
    }
  end
end

class Rule
  property filters

  def initialize(@filters : Array(Filter))
    @filters.each_with_index do |filter, i|
      next if i == 0
      @filters[0...i].each do |pred|
        filter.prune(pred)
      end
    end
  end

  def apply(part : Part) : String
    @filters.map { |filter| filter.match(part) }.find { |state| state != "" } || "R"
  end
end

Rules = Hash(String, Rule).new
Parts = [] of Part

File.read("input.txt").strip.lines.each do |line|
  case line
  when /^([a-z]+)[{]([^}]+)/
    Rules[$1] = Rule.new($2.split(",").map { |op|
      case op
      when /^([xmas])([<>])([0-9]+):([a-zAR]+)$/
        n = $3.to_i
        Filter.new($1[0], ($2 == "<") ? (1..(n - 1)) : ((n + 1)..4000), $4)
      else
        Filter.new(' ', 0..0, op)
      end
    })
  when /^$/
  when /^[{]([^}]+)/
    Parts << $1.split(",").reduce(Part.new) { |part, assignment|
      attr, n = assignment.split("=")
      part.merge({attr[0] => n.to_i})
    }
  else
    raise "Not a stanza: #{line}"
  end
end

p1 = Parts.select { |part|
  state = "in"
  until state.match(/^[AR]$/)
    state = Rules[state].apply(part)
  end
  state == "A"
}.map { |part| part.values.sum }.sum

p2 = 0_i64 # Otherwise shit overflows
shelves = 0
ops = [
  {"in", 0, {'x' => 1..4000, 'm' => 1..4000, 'a' => 1..4000, 's' => 1..4000}},
]
until ops.empty?
  shelves += 1
  state, fidx, part = ops.pop
  if state == "A"
    p2 += part.values.map { |rng| rng.size }.product(1_i64)
  elsif state == "R"
    nil
  else
    filter = Rules[state].filters[fidx]
    match, excluded = filter.split(part)
    ops << {filter.state, 0, match} unless match.values.find { |rng| rng.empty? }
    excluded.each do |p|
      ops << {state, fidx + 1, p} unless p.values.find { |rng| rng.empty? }
    end
  end
end

puts "Part 1: #{p1}"
puts "Part 2: #{p2}"
