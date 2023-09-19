import esbuild from "npm:esbuild";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.1/mod.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import * as walk from "https://deno.land/std@0.198.0/fs/walk.ts";
import { get_css } from "./lib/uno.ts";
// import "./app.tsx"

if (Deno.args.includes("build")) {
  build();
} else {
  dev();
}

async function build() {
  // create dist folder
  await Deno.mkdir("./dist", { recursive: true });

  const css = await get_css();

  // build the bundle with esbuild
  const result = await esbuild.build({
    entryPoints: ["./app.tsx"],
    bundle: true,
    minify: false,
    write: false,
    format: "esm",
    // @ts-expect-error
    plugins: [...denoPlugins()],
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
    // inject the component globals
    inject: ["./lib/Component.tsx"],
  });

  // @ts-expect-error
  const bundle = result.outputFiles[0].text;

  // generate pages for each route
  const routes = [
    "index",
  ]

  for await (const route of routes) {
   const html = createShell({
      title: "Deno App",
      bundle,
      styles: css,
    });
    Deno.writeTextFile(`./dist/${route}.html`, html)
  }

  // copy static files
  const staticFiles = walk.walk("./assets");
  for await (const file of staticFiles) {
    if (file.isFile) {
      const content = await Deno.readFile(`./assets/${file.name}`);
      Deno.writeFile(`./dist/${file.name}`, content);
    }
  }
}

async function dev() {
  // use deno watch to watch for file changes
  // run build and then serve the files
  await build();
  Deno.serve((req) => {
    const url = new URL(req.url).pathname;
    const pathname = url === "/" ? "index" : url;
    let file;
    try {
      file = Deno.readFileSync(`./dist/${pathname}.html`);
      return new Response(file, {
        headers: {
          "content-type": "text/html",
        },
      });
    } catch {
      file = Deno.readFileSync(`./dist/${pathname}`);
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
}){
  return `<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style id="_global_styles">${styles}</style>
  </head>
  <body>
    <script type="module">${bundle}</script>
    <app-root></app-root>
  </body>
</html>`
}
