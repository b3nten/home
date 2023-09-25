import slash from "https://deno.land/x/slash@v0.3.0/mod.ts";
import CLI from "../modules/cli/mod.ts";
import { get_css } from "./uno.ts";
import esbuild from "npm:esbuild";
import httpImports from "./esbuild_plugin_http.ts";

const BUILD_DIR = "./.dist";
const ROUTES = [
	"index",
	"about",
	"posts",
]

class MyCli extends CLI {
	async build(){
		const css = await get_css();
		const componentImports = ["import './app.tsx';"];
		await CLI.WalkDirectory("./components", async (file) => {
			if (file.isFile) {
				componentImports.push(`import './${slash(file.path)}';`);
			}
		})
		const result = await esbuild.build({
			stdin: {
				contents: componentImports.join(""),
				resolveDir: "./",
			},
			bundle: true,
			minify: false,
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
		ROUTES.forEach(async (route) => {
			const shell = createShell({
				bundle,
				styles: css,
			});
			await CLI.WriteFile(`${BUILD_DIR}/${route}.html`, shell)
		})
		await CLI.CopyDirectory("./assets", BUILD_DIR);
	}
	async start(){
		CLI.ServeDirectory(BUILD_DIR);
	}
}

new MyCli();

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
		<script>const eventSource = new EventSource("http://localhost:8001/__refresh", {
			withCredentials: false
		});
		eventSource.onmessage = (event) => {
			if (event.data === 'reload') {
				location.reload();
			}
		};
		</script>
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
