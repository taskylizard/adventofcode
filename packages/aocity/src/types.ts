interface Day {
  solved: boolean;
  result: any; // seems to be string, number blah
  time: null | number;
}

export interface Config {
  year: number;
  days: {
    [day: number]: {
      runner: null | string;
      part1: Day;
      part2: Day;
    };
  };
}
