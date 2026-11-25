# Building

Slim's own esbuild plugin, `@slim-lang/core/esbuild`, compiles and checks the project. The kit's `build/esbuild.mjs` adds what an engine needs on top of it:

- `embeddedOptions` makes one classic script per entry point (`iife`, `"use strict"`, no Node, no browser), the form an engine evaluates.
- `buildStatus` writes the result of a build to a file, so the game can show a broken build on its screen.

## build.mjs

```js
import * as esbuild from "esbuild";
import { slim } from "@slim-lang/core/esbuild";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildStatus, embeddedOptions } from "./packages/gamekit/build/esbuild.mjs";

const here = dirname(fileURLToPath(import.meta.url));

const project = {
  root: here,
  host: resolve(here, "types/engine.slim"),
  release: !process.argv.includes("--dev"),
};

await esbuild.build(embeddedOptions({
  entryPoints: [{ in: resolve(here, "src/main.slim"), out: "main" }],
  outdir: resolve(here, "dist"),
  plugins: [slim(project), buildStatus(resolve(here, "dist/build_status.json"))],
}));
```

`root` is the project folder: Slim finds `slimconfig.json` and `packages/` there, whatever folder the script runs from.

The engine then loads `dist/main.js` and evaluates it as a script.

### Release and dev builds

`release` leaves out Slim's runtime type checks. They catch what comes from the engine untyped, but they cost a lot in code that runs every frame, so keep them for a `--dev` build:

```bash
node build.mjs --dev
```

The static checks run in both.

### Watching

For a build on every save, use `esbuild.context(options)` and `ctx.watch()` with the same options:

```js
const ctx = await esbuild.context(embeddedOptions({
  entryPoints: [{ in: resolve(here, "src/main.slim"), out: "main" }],
  outdir: resolve(here, "dist"),
  plugins: [slim(project), buildStatus(resolve(here, "dist/build_status.json"))],
}));
await ctx.watch();
```

A rebuild starts when a bundled file or the host file changes, and each rebuild checks the project again, new files included. A new entry point needs a restart: `entryPoints` is read once.

### Checking without a bundle

`check` runs the same check alone, for CI or an editor task:

```js
import { check } from "@slim-lang/core/esbuild";

const errors = check(project);
for (const text of errors) console.error(text);
process.exitCode = errors.length ? 1 : 0;
```

## The plugin

`slim(options)` and `check(options)` take the same options; [esbuild](https://github.com/cdmtn/slim-lang/blob/main/docs/15-build-and-runtime/07-esbuild.md) in Slim's documentation lists them all. The ones a game uses:

| Option | What it is |
|---|---|
| `root` | The project folder |
| `host` | The host file (see [The engine and GameHost](03-host.md)) |
| `release` | `true` leaves out Slim's runtime type checks |

Before each build the plugin checks every `.slim` file of the project, `packages/` included, in the order of their imports, until the types settle, and reports the errors as esbuild errors. It then compiles each file without checking it again. A `*.test.slim` file is checked as `slmc test` sees it, with `test`, `assert` and the other test functions known; anywhere else they don't exist.

## buildStatus

`buildStatus(statusFile)` returns an esbuild plugin. It writes `{ failed, errors }` to `statusFile` after a build that failed and after the first good build that follows, so the game can show a broken build on its screen and take it away again:

```json
{ "failed": true, "errors": ["TypeError: \"Engine\" has no field \"nope\" ..."] }
```

## embeddedOptions

`embeddedOptions({ entryPoints, outdir, plugins, target = "es2020", sourcemap = true })` returns esbuild options: `bundle`, `format: "iife"`, `platform: "neutral"`, a `"use strict";` banner, the `target` and `sourcemap` given, and `logLevel: "info"`. `entryPoints`, `outdir` and `plugins` are passed as they are; add any other esbuild option to the object it returns.
