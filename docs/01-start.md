# Getting started

This page takes a game from nothing to a bundle the engine runs. The engine is any program that embeds a JavaScript runtime (V8, QuickJS, ...) and gives scripts an object to talk to it through; in these pages that object is called `engine`.

## What a project looks like

```
my-game/
  packages/gamekit/     this repository
  types/engine.slim     what the engine gives scripts
  src/host.slim         the engine as a GameHost
  src/main.slim         the game
  build.mjs             the build
```

## The steps

1. **Put the kit in `packages/`** and install `@slim-lang/core` and `esbuild`: see [Installation](02-installation.md).
2. **Describe the engine** in `types/engine.slim`, so the checker knows every call into it: see [The engine and GameHost](03-host.md#describe-the-engine).
3. **Connect the engine to the kit** with a `GameHost` in `src/host.slim`: see [The engine and GameHost](03-host.md#connect-the-engine-to-the-kit).
4. **Build** with `build.mjs`, which checks the whole project and bundles one classic script per entry point: see [Building](05-build.md).
5. **Write the game** in `src/main.slim`, below.

## Write the game

`src/main.slim`:

```js
use { host } from "./host"
use { createKeeper } from "@gamekit/keep"
use { createCommands } from "@gamekit/commands"

const keeper = createKeeper(host)
engine.on("reloadBegin", () => { keeper.stash() })

let score = 0
keeper.keep("score", () => score, (saved) => { score = saved })

const commands = createCommands()
commands.add("score|s", "/score - the current score", () => { engine.log(`score: ${score}`) })

host.onFrame((dt) => {
    score += dt
})
```

The engine calls the `reloadBegin` handlers before it evaluates the scripts again; on the next run, `keep` hands `score` back. Call the engine's own name for that moment, whatever it is.

Run the build:

```bash
node build.mjs
```

The engine then loads `dist/main.js` and evaluates it as a script. `node build.mjs --dev` keeps Slim's runtime type checks in the output (see [Building](05-build.md#release-and-dev-builds)).

## Next

- [Modules](04-modules/index.md): what else the kit has.
- [Recipes](07-recipes/index.md): hot-reload state, save files, inventory with crafting and more.
- [Things to know](08-notes.md) before the project grows.
