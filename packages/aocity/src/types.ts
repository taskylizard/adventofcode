interface Day {
  solved: boolean;
  result: any; // seems to be string, number blah
  time: null | number;
}

export interface Config {
  runner: null | string;
  year: number;
  days: {
    [day: number]: { part1: Day; part2: Day };
  };
}
