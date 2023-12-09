package main

import (
	"log"
	"strconv"
	"strings"

	must "github.com/gmlewis/advent-of-code-2021/must"
)

func main() {
	solve("./input.txt")
}

func solve(file string) {
	lines := must.ReadFileLines(file)
	predictSum, predictSum2 := 0, 0
	for _, line := range lines {
		var seq []int
		for _, v := range strings.Fields(strings.TrimSpace(line)) {
			i, _ := strconv.Atoi(v)
			seq = append(seq, i)
		}
		part1, part2 := parseSeq(seq)
		predictSum += part1
		predictSum2 += part2
	}
	log.Println("Part 1: ", predictSum)
	log.Println("Part 2: ", predictSum2)
}

func parseSeq(sequence []int) (next, prev int) {
	differences := make([]int, len(sequence)-1)
	allZeroes := true
	for i := 0; i < len(sequence)-1; i++ {
		differences[i] = sequence[i+1] - sequence[i]
		if differences[i] != 0 {
			allZeroes = false
		}
	}
	prevVal, nextVal := 0, 0
	if !allZeroes {
		nextVal, prevVal = parseSeq(differences)
	}
	return sequence[len(sequence)-1] + nextVal, sequence[0] - prevVal
}
