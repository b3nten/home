import slash from "https://deno.land/x/slash@v0.3.0/mod.ts";
import CLI from "../modules/cli/mod.ts";
import { get_css } from "./uno.ts";
import esbuild from "npm:esbuild";
import httpImports from "./esbuild_plugin_http.ts";
import createShell from "../shell.ts";

const BUILD_DIR = "./.dist";
const ROUTES = [
	"index",
	"p",
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
			jsxFragment: "Fragment",
			jsxImportSource: "https://esm.sh/preact",
			plugins: [httpImports()],
			tsconfigRaw: {
				compilerOptions: {
					experimentalDecorators: true,
				},
			},
			inject: ["./internal/Component.tsx"]
		});
		const bundle = result.outputFiles[0].text;

		CLI.WalkDirectory("./posts", async (file) => {
			if(file.name.endsWith(".html")){
				ROUTES.push(`/p/${file.name.replace(".html", "")}`);
				const post = await CLI.ReadTextFile(file.path);
				if(post instanceof Error) throw post;
				const metadata = parseMetadata(post);
				await CLI.WriteFile(`${BUILD_DIR}/p/${file.name.replace(".html", "")}.json`, JSON.stringify(metadata));
			}
		})
		

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


type BlogPost = {
  title: string;
  summary: string;
  date: string;
  content: string;
};

function parseMetadata(post: string): BlogPost {
  // metadata is contained inside the <blog-metadata> tags.
  const metadata_raw = post.match(/<blog-metadata>(.*?)<\/blog-metadata>/s);
	console.log(metadata_raw?.[1])
  const metadata = JSON.parse(metadata_raw?.[1] ?? "{}");
  metadata.content = post.replace(metadata_raw?.[0] ?? "", "").trim();
  return metadata;
}