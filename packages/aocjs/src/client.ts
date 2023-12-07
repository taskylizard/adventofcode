export interface ClientOptions {
  /** Browser session key.*/
  session: string;
  /** User-Agent for requests, not recommended to change. */
  "user-agent"?: string;
}

export class Client {
  session: string;
  "user-agent"?: string = "taskylizard (https://github.com/taskylizard/adventofcode)";

  constructor(options: ClientOptions) {
    this.session = options.session;
    if (options["user-agent"]) this["user-agent"] = options["user-agent"];
  }

  private async fetcher(path: string): Promise<string> {
    const request = await fetch(`https://adventofcode.com/${path}`, {
      headers: {
        Cookie: `session=${this.session}`,
        "User-Agent": this["user-agent"]!,
        Accept: "text/plain",
      },
    });

    return await request.text();
  }

  /**
   * Get a puzzle's input.
   *
   * @param year Advent of Code year.
   * @param day Advent of Code year's puzzle day.
   */
  public async getInput(year: number, day: number): Promise<string> {
    return await this.fetcher(`${year}/day/${day}/input`);
  }
}
