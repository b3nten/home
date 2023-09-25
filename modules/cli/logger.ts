import { crayon } from "https://deno.land/x/crayon@3.3.2/mod.ts";
import { sprintf } from "https://deno.land/std@0.176.0/fmt/printf.ts";

function gradient(string: string) {
  const chars: string[] = string.split("");
  for (const [index, char] of chars.entries()) {
    chars[index] = crayon.hsl(305 - (7 * index), 100, 70)(char);
  }
  return chars.join("");
}

export enum Level {
  DEBUG = 0,
  INFO = 10,
  WARNING = 20,
  ERROR = 30,
  CRITICAL = 40,
}

export default class Logger {
  formattedName: string;

  constructor(
    public name: string,
    public level: Level,
  ) {
    this.formattedName = gradient(`[${name}]`);
  }

  debug(...args: unknown[]) {
    if (this.level <= Level.DEBUG) {
      console.log(
        this.formattedName,
          crayon.bold.magenta("DEBUG"),
          ...args
      );
    }
  }
  info(...args: unknown[]) {
    if (this.level <= Level.INFO) {
      console.log(
        this.formattedName,
        ...args,
      );
    }
  }
  success(...args: unknown[]) {
    this.info(
      crayon.green("SUCCESS ✔", ...args),
    );
  }
  warning(...args: unknown[]) {
    if (this.level <= Level.WARNING) {
      console.log(
        this.formattedName,
          crayon.bold.yellow("WARNING ⚠"),
          ...args,
      );
    }
  }
  error(...args: unknown[]) {
    if (this.level <= Level.ERROR) {
      console.log(
        this.formattedName,
        crayon.bold.red("ERROR 🕱"),
        ...args,
      );
    }
  }
  critical(...args: unknown[]) {
    if (this.level <= Level.CRITICAL) {
      console.log(
        this.formattedName,
          crayon.bgRed.black.bold("CRITICAL ☢ "),
          ...args
      );
    }
  }
}
