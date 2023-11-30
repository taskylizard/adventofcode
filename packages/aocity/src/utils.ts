/* eslint-disable no-return-await */
import consola from "consola";
import cheerio from "cheerio";

export const log = consola.create({ defaults: { tag: "🎄" } });

async function fetcher(path: string): Promise<string> {
  const res = await fetch(`https://adventofcode.com/${path}`, {
    headers: {
      Cookie: `session=${process.env.AOC_SESSION}`,
      "User-Agent": "taskylizard (https://github.com/taskylizard/adventofcode)",
      Accept: "text/plain",
    },
  });

  return await res.text();
}

export async function fetchPuzzle(year: string, day: string): Promise<string> {
  return await fetcher(`${year}/day/${day}/input`);
}

export async function fetchInstructions(year: string, day: string): Promise<string> {
  const page = await fetcher(`${year}/day/${day}`);
  return resolveInstructions(page);
}

function resolveInstructions(page: any) {
  const $ = cheerio.load(page);
  const nodes = $(".day-desc").children().toArray();
  const markdown = nodes.map((n) => cheerio.html(n)).join("");
  return markdown;
}
