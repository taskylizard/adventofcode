open System

let input = IO.File.ReadAllLines "input.txt"

// parse a rotation line into direction and distance
let parseRotation (line: string) =
    let direction = line.[0]
    let distance = int (line.Substring(1))
    (direction, distance)

// rotate the dial from current position
let rotate currentPos direction distance =
    match direction with
    | 'L' -> (currentPos - distance) % 100
    | 'R' -> (currentPos + distance) % 100
    | _ -> currentPos

// count how many times we cross 0 during a rotation
let countZeroCrossings currentPos direction distance =
    match direction with
    | 'R' ->
        // going right: how many times do we pass through 0?
        // we pass through 0 when crossing from 99 to 0
        // formula: how many times do we cross the 100 boundary?
        (currentPos + distance) / 100
    | 'L' ->
        // going left: how many times do we pass through 0?
        if currentPos = 0 then
            // starting at 0: first click goes to 99
            // we hit 0 again at click 100, 200, 300, etc
            distance / 100
        elif distance >= currentPos then
            // we will reach or cross 0
            // from pos, going left pos clicks lands on 0 (first crossing)
            // then every 100 more clicks crosses 0 again
            1 + (distance - currentPos) / 100
        else
            0
    | _ -> 0

// part 1: process all rotations and count how many times we land on 0
let solvePart1 rotations =
    rotations
    |> Array.map parseRotation
    |> Array.fold (fun (pos, count) (dir, dist) ->
        let newPos = rotate pos dir dist
        // handle negative modulo: -5 % 100 = -5 in F#, we want 95, dotnet sucks bro
        let normalizedPos = if newPos < 0 then newPos + 100 else newPos
        let newCount = if normalizedPos = 0 then count + 1 else count
        (normalizedPos, newCount)
    ) (50, 0)
    |> snd

// part 2: count every time dial points at 0 during rotations
let solvePart2 rotations =
    rotations
    |> Array.map parseRotation
    |> Array.fold (fun (pos, count) (dir, dist) ->
        let zeroCrossings = countZeroCrossings pos dir dist
        let newPos = rotate pos dir dist
        let normalizedPos = if newPos < 0 then newPos + 100 else newPos
        (normalizedPos, count + zeroCrossings)
    ) (50, 0)
    |> snd

let password1 = solvePart1 input
let password2 = solvePart2 input

printfn "part 1: %d" password1
printfn "part 2: %d" password2
