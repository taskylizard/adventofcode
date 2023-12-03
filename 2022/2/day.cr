input = File.read("./input.txt").strip.split("\n")

playMap = {
  "A" => "rock",
  "B" => "paper",
  "C" => "scissors",
  "X" => "rock",
  "Y" => "paper",
  "Z" => "scissors",
}

strategies = {
  "X" => "lose",
  "Y" => "draw",
  "Z" => "win",
}

scoring = {
  "rock" => {
    "scissors" => 3,
    "rock"     => 4,
    "paper"    => 8,
  },
  "paper" => {
    "rock"     => 1,
    "paper"    => 5,
    "scissors" => 9,
  },
  "scissors" => {
    "paper"    => 2,
    "scissors" => 6,
    "rock"     => 7,
  },
}

plays = {
  "rock" => {
    "lose" => "scissors",
    "draw" => "rock",
    "win"  => "paper",
  },
  "paper" => {
    "lose" => "rock",
    "draw" => "paper",
    "win"  => "scissors",
  },
  "scissors" => {
    "lose" => "paper",
    "draw" => "scissors",
    "win"  => "rock",
  },
}

sum = 0
sum2 = 0

input.each do |line|
  opponent, player = line.split(" ")

  opponent_select = playMap[opponent]
  player_response = playMap[player]

  # Part 1
  sum += scoring[opponent_select][player_response]

  strategy = strategies[player]
  player_res2 = plays[opponent_select][strategy]

  # Part 2
  sum2 += scoring[opponent_select][player_res2]
end

puts "Part 1: #{sum}"
puts "Part 2: #{sum2}"
