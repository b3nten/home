import esbuild from "npm:esbuild";
import httpImports from "./esbuild_plugin_http.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import * as walk from "https://deno.land/std@0.198.0/fs/walk.ts";
import { debounce } from "https://deno.land/std@0.194.0/async/debounce.ts";
import slash from "https://deno.land/x/slash/mod.ts";
import { get_css } from "./uno.ts";

const BUILD_DIR = "./.dist";

if (Deno.args.includes("build")) {
  const t = performance.now();
  console.log("building...");
  build();
  console.log("built in", performance.now() - t, "ms");
} else {
  dev();
}

async function build() {
  // create dist folder
  await Deno.mkdir(BUILD_DIR, { recursive: true });

  // generate css
  const css = await get_css();

  // get paths to all blog component files
  const componentImports = ["import './app.tsx';"];
  const componentWalker = walk.walk("./components");
  for await (const file of componentWalker) {
    if (file.isFile) {
      componentImports.push(`import './${slash(file.path)}';`);
    }
  }
  // build the bundle with esbuild
  const result = await esbuild.build({
    stdin: {
      contents: componentImports.join(""),
      resolveDir: "./",
    },
    bundle: true,
    minify: Deno.args.includes("build"),
    write: false,
    format: "esm",
    target: "esnext",
    jsxFactory: "h",
    jsxImportSource: "https://esm.sh/preact",
    plugins: [httpImports()],
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  });

  const bundle = result.outputFiles[0].text;

  // generate pages for each route
  const routes = [
    "index",
    "posts",
    "p/hello-world"
  ];

  for await (const route of routes) {
    const html = createShell({
      title: "Deno App",
      bundle,
      styles: css,
    });
    WriteFile(`${BUILD_DIR}/${route}.html`, html);
  }

  // copy static files
  const staticFiles = walk.walk("./assets");
  for await (const file of staticFiles) {
    if (file.isFile) {
      const content = await Deno.readFile(`./assets/${file.name}`);
      Deno.writeFile(`${BUILD_DIR}/${file.name}`, content, {
        create: true,
      });
    }
  }
}

async function WriteFile(path: string, file: string | Uint8Array){
  // create folder if it doesn't exist
  const folder = path.split("/").slice(0, -1).join("/");
  await Deno.mkdir(folder, { recursive: true });
  // write file
  if(typeof file === "string") file = new TextEncoder().encode(file);
  await Deno.writeFile(path, file);
}

async function dev() {
  // use deno watch to watch for file changes
  // run build and then serve the files
  const t = performance.now();
  console.log("building...");
  await build();
  console.log("built in", performance.now() - t, "ms");
  console.log("serving...");
  Deno.serve((req) => {
    const url = new URL(req.url).pathname;
    const pathname = url === "/" ? "index" : url;
    let file;
    try {
      file = Deno.readFileSync(`${BUILD_DIR}/${pathname}.html`);
      return new Response(file, {
        headers: {
          "content-type": "text/html",
        },
      });
    } catch {
      file = Deno.readFileSync(`${BUILD_DIR}/${pathname}`);
      return new Response(file, {
        headers: {
          "content-type": mime.getType(path.extname(pathname)) || "text/plain",
        },
      });
    }
  });
}

function createShell({
  title = "Deno App",
  bundle = "",
  styles = "",
}) {
  return `<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style id="_global_styles">${styles}</style>
  </head>
  <body>
    <script type="module">${bundle}</script>
    <div id="app"></div>
    <route-handler></route-handler>
    <app-root></app-root>
    <blog-cache>
    ${
    JSON.stringify({
      "post1": "Hello from post 1",
      "post2": "Hello from post 2",
    })
  }
  </blog-cache>
  </body>
</html>`;
}

// watcher
const watcher = Deno.watchFs(".");
const debouncedBuild = debounce(async () => {
  const t = performance.now();
  console.log("building...");
  try {
    await build();
    console.log("built in", performance.now() - t, "ms");
  } catch (e) {
    console.error(e);
  }
}, 1000);
for await (const event of watcher) {
  if (
    event.kind === "create" || event.kind === "modify" ||
    event.kind === "remove"
  ) {
    if (event.paths.every((path) => !path.includes("dist"))) {
      debouncedBuild();
    }
  }
}
