/*
 Both https://github.com/lucsoft/esbuild-plugin-http-imports and https://github.com/lucacasonato/esbuild_deno_loader
 choke in various ways and are unusable. So I'm going to have to do this myself.
*/
import type {
  OnLoadArgs,
  OnLoadResult,
  OnResolveArgs,
  Plugin,
} from "npm:esbuild";

const NAME_SPACE = "http";

export default function httpLoader(): Plugin {
  const cache = new Map<string, string>();
  return {
    name: NAME_SPACE,
    setup(build) {
      build.onResolve(
        { filter: /^https:\/\// },
        ({ path }: OnResolveArgs) => ({ path, namespace: NAME_SPACE }),
      );
      build.onResolve(
        { filter: /^http:\/\// },
        ({ path }: OnResolveArgs) => ({ path, namespace: NAME_SPACE }),
      );
      build.onResolve(
        { filter: /.*/, namespace: NAME_SPACE },
        ({ path, importer, namespace }: OnResolveArgs) => {
          if (
            namespace !== NAME_SPACE || (path[0] !== "/" && path[0] !== ".")
          ) return;
          return {
            path: new URL(path, importer).toString(),
            namespace: NAME_SPACE,
          };
        },
      );
      build.onLoad(
        { filter: /.*/, namespace: NAME_SPACE },
        async ({ path }: OnLoadArgs): Promise<OnLoadResult> => {
          if (cache.has(path)) {
            return { contents: cache.get(path) };
          }
          const res = await fetch(path);
          const contents = await res.text();
          cache.set(path, contents);
          return { contents };
        },
      );
    },
  };
}
