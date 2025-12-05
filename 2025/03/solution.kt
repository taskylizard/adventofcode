import java.io.File

fun main() {
    val input = File("input.txt").readLines()

    val part1 = input.sumOf { bank ->
        val digits = bank.map { it.digitToInt() }
        var maxJoltage = 0
        for (i in digits.indices) {
            for (j in i + 1 until digits.size) {
                val joltage = digits[i] * 10 + digits[j]
                if (joltage > maxJoltage) {
                    maxJoltage = joltage
                }
            }
        }
        maxJoltage
    }

    val part2 = input.sumOf { bank ->
        val digits = bank.map { it.digitToInt() }
        val n = digits.size
        val toKeep = 12

        val remaining = digits.toMutableList()
        val result = mutableListOf<Int>()

        var neededMore = toKeep
        for (i in 0 until toKeep) {
            val canSkip = remaining.size - neededMore
            var bestIdx = 0
            var bestDigit = remaining[0]

            for (j in 0..canSkip) {
                if (remaining[j] > bestDigit) {
                    bestDigit = remaining[j]
                    bestIdx = j
                }
            }

            result.add(bestDigit)
            remaining.subList(0, bestIdx + 1).clear()
            neededMore--
        }

        result.joinToString("").toLong()
    }

    println("Part 1: $part1")
    println("Part 2: $part2")
}
