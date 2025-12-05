import { readFileSync } from 'fs';

const input = readFileSync('input.txt', 'utf-8').trim();

function isInvalidPart1(n: number): boolean {
  const s = n.toString();
  const len = s.length;
  if (len % 2 !== 0) return false;
  const half = len / 2;
  return s.slice(0, half) === s.slice(half);
}

function isInvalidPart2(n: number): boolean {
  const s = n.toString();
  const len = s.length;
  for (let patternLen = 1; patternLen <= len / 2; patternLen++) {
    if (len % patternLen !== 0) continue;
    const pattern = s.slice(0, patternLen);
    if (s === pattern.repeat(len / patternLen)) {
      return true;
    }
  }
  return false;
}

let total1 = 0;
let total2 = 0;

for (const range of input.split(',')) {
  const [start, end] = range.split('-').map(Number);
  for (let i = start; i <= end; i++) {
    if (isInvalidPart1(i)) {
      total1 += i;
    }
    if (isInvalidPart2(i)) {
      total2 += i;
    }
  }
}

console.log(`Part 1: ${total1}`);
console.log(`Part 2: ${total2}`);
