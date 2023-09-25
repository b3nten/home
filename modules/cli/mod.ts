import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import * as fs from "https://deno.land/std@0.198.0/fs/mod.ts";
import slash from "https://deno.land/x/slash@v0.3.0/mod.ts";
import Logger, { Level } from "./logger.ts";
import { debounce } from "https://deno.land/std@0.194.0/async/debounce.ts";
const text_encoder = new TextEncoder();
const text_decoder = new TextDecoder();

type FileInfo = {
  path: string;
};

export interface LoaderPlugin {
  name: string;
  match: RegExp | ((file: FileInfo) => boolean);
  load: (input: Uint8Array, file: FileInfo) => Uint8Array | Promise<Uint8Array>;
}

export default class CLI {
  static Log: Logger = new Logger("CLI", Level.DEBUG);
  static async ReadFile(path: string): Promise<Uint8Array | Error> {
    try {
      const file = await Deno.readFile(path);
      return file;
    } catch (e) {
      CLI.Log.error(e);
      return e;
    }
  }
  static async ReadTextFile(path: string): Promise<string | Error> {
    try {
      const file = await Deno.readTextFile(path);
      return file;
    } catch (e) {
      CLI.Log.error(e);
      return e;
    }
  }
  static async FileStats(path: string): Promise<Deno.FileInfo | undefined> {
    try {
      const stats = await Deno.stat(path);
      return stats;
    } catch (e) {
      return undefined;
    }
  }
  static ReadFileSync(path: string): Uint8Array | Error {
    try {
      const file = Deno.readFileSync(path);
      return file;
    } catch (e) {
      CLI.Log.error(e);
      return e;
    }
  }
  static ReadTextFileSync(path: string): Promise<string | Error> {
    try {
      const file = Deno.readTextFile(path);
      return file;
    } catch (e) {
      CLI.Log.error(e);
      return e;
    }
  }
  static async WriteFile(
    path: string,
    file: string | Uint8Array,
  ): Promise<void | Error> {
    const data = typeof file === "string" ? text_encoder.encode(file) : file;
    try {
      await Deno.mkdir(path.split("/").slice(0, -1).join("/"), {
        recursive: true,
      });
      await Deno.writeFile(path, data);
      CLI.Log.success(`Wrote file ${path}`);
    } catch (e) {
      CLI.Log.error(e);
      return e;
    }
  }
  static WriteFileSync(
    path: string,
    file: string | Uint8Array,
  ): void | Error {
    const data = typeof file === "string" ? text_encoder.encode(file) : file;
    try {
      Deno.mkdirSync(path.split("/").slice(0, -1).join("/"), {
        recursive: true,
      });
      Deno.writeFileSync(path, data);
      CLI.Log.success(`Wrote file ${path}`);
    } catch (e) {
      CLI.Log.error(e);
      return e;
    }
  }
  static async CopyFile(from: string, to: string): Promise<void | Error> {
    try {
      await Deno.copyFile(from, to);
      CLI.Log.success(`Copied file ${from} to ${to}`);
    } catch (e) {
      CLI.Log.error(e);
      return e;
    }
  }
  static CopyFileSync(from: string, to: string): void | Error {
    try {
      Deno.copyFileSync(from, to);
      CLI.Log.success(`Copied file ${from} to ${to}`);
    } catch (e) {
      CLI.Log.error(e);
      return e;
    }
  }
  static async CopyDirectory(
    from: string,
    to: string,
  ): Promise<void | Error> {
    try {
      await fs.copy(from, to, {
        overwrite: true,
      });
    } catch (e) {
      return e;
    }
  }
  static CopyDirectorySync(
    from: string,
    to: string,
  ): void | Error {
    try {
      fs.copySync(from, to, {
        overwrite: true,
      });
    } catch (e) {
      return e;
    }
  }
  static async WalkDirectory(
    path: string,
    walker: (file: fs.WalkEntry) => void,
    options?: fs.WalkOptions,
  ): Promise<void> {
    const iterator = fs.walk(path, options);
    for await (const file of iterator) {
      walker(file);
    }
  }
  static async ServeStatic(filePath: string): Promise<Response> {
    CLI.Log.info(`Serving static file ${filePath}`);
    let stats = await CLI.FileStats(filePath);
    if (!stats || stats.isDirectory) {
      for (
        const path of [
          `${filePath}.html`,
          `${filePath}/index.html`,
        ]
      ) {
        stats = await CLI.FileStats(path);
        if (stats && !stats.isDirectory) {
          filePath = path;
          break;
        }
      }
    }
    if (!stats) {
      CLI.Log.error(`File ${filePath} not found.`);
      return new Response("Not found.", {
        status: 404,
      });
    }
    try {
      const file = await Deno.open(filePath);
      const mimetype = mime.getType(path.extname(filePath)) || "text/html";
      return new Response(file.readable, {
        headers: {
          "content-type": mimetype,
          "content-length": stats.size.toString(),
        },
      });
    } catch (e) {
      CLI.Log.error(e);
      return new Response("Internal server error.", {
        status: 500,
      });
    }
  }
  static ServeDirectory(directory: string): void {
    CLI.Log.info(`Serving directory ${directory}`);
    Deno.serve((req) => {
      const pathname = new URL(req.url).pathname;
      const filePath = directory + pathname;
      return CLI.ServeStatic(filePath);
    });
  }
  static async Run(commands: string[], name = "process") {
    const logger = new Logger(name.toUpperCase(), Level.INFO);
    const prefix_stream = new WritableStream({
      write(chunk) {
        logger.info("", text_decoder.decode(chunk).replace(/\n$/, ""));
      },
    });
    const runner = new Deno.Command(commands[0], {
      args: commands.slice(1),
      stdout: "piped",
    });
    CLI.Log.info(`Running command ${commands.join(" ")}`);
    const process = runner.spawn();
    // pipe stdout to console. use transform stream to prefix each line
    process.stdout.pipeTo(prefix_stream);
  }

  public port = 8000;
  public loaderPort = 8001;
  #loaders: Array<LoaderPlugin> = [];

  constructor({
    loaders = [],
    port = 8000,
    loaderPort = 8001,
  }: {
    loaders?: Array<LoaderPlugin>;
    port?: number;
    loaderPort?: number;
  } = {}) {
    this.#loaders = loaders;
    this.port = port;
    this.loaderPort = loaderPort;
    this.startDevServer();
    this.#init();
  }

  clients = new Map<string, {
    controller: ReadableStreamDefaultController;
    intervalId: number;
  }>()

  startDevServer() {
    this.#loaders.forEach((loader) => {
      CLI.Log.info(`Registered loader plugin ${loader.name}`);
    });
    CLI.Log.debug("Dev server established");
    Deno.serve({
      port: this.loaderPort,
    }, async (req) => {
      if (new URL(req.url).pathname === "/__refresh") {
        CLI.Log.debug("SSE connection opened");
        const headers = new Headers();
        headers.append("Content-Type", "text/event-stream");
        headers.append("Connection", "keep-alive");
        headers.append("Cache-Control", "no-cache");
        headers.append("Access-Control-Allow-Origin", "*");
        const id = Math.random().toString(36).slice(2);
        const body = new ReadableStream({
          start: (controller) => {
            controller.enqueue(new TextEncoder().encode(":\n\n"));  // SSE comment to keep connection alive
            const intervalId = setInterval(() => {
              controller.enqueue(new TextEncoder().encode(":\n\n"));  // SSE comment to keep connection alive
            }, 5000);
            this.clients.set(id, {
              controller: controller,
              intervalId,
            })
          },
          cancel: () => {
            const con = this.clients.get(id);
            if(!con) return;
            clearInterval(con.intervalId);
            this.clients.delete(id);
          },
        });
        return new Response(body, {
          headers,
        });
      }

      // Serve Loaders
      const path = new URL(req.url).pathname;
      const stats = await CLI.FileStats(path);
      if (!stats || stats.isDirectory) {
        return new Response("Not found", {
          status: 404,
        });
      }
      let file = await CLI.ReadFile(path);
      if (file instanceof Error) {
        return new Response("Internal server error", {
          status: 500,
        });
      }
      const plugin = this.#loaders.find((plugin) => {
        if (typeof plugin.match === "function") {
          return plugin.match({
            path,
          });
        }
        return plugin.match.test(path);
      });
      if (plugin) {
        file = await plugin.load(file, { path });
      }
      return new Response(file, {
        headers: {
          "content-type": mime.getType(path) || "text/plain",
        },
      });
    });
  }

  async #init() {
    await this.build();
    this.start();
    if (Deno.args.length) {
      CLI.Run([
        Deno.execPath(),
        "run",
        `reload='http://localhost:${this.loaderPort}'`,
        ...Deno.args,
      ], "App");
    }

    const watcher = Deno.watchFs(".");
    const debouncedBuild = debounce(async () => {
      const t = performance.now();
      try {
        await this.build();
      } catch (e) {
        console.error(e);
      }
    }, 200);
    for await (const event of watcher) {
      if (
        event.kind === "create" || event.kind === "modify" ||
        event.kind === "remove" || event.kind === "other"
      ) {
        if (event.paths.every((path) => !path.includes("dist"))) {
          debouncedBuild();
          // for(const [id, client] of this.clients) {
          //   if(!client.controller) continue;
          //   client.controller.enqueue(new TextEncoder().encode("data: reload\n\n"));
          // }
        }
      }
    }
  }

  async build() {}
  async start() {}
}
