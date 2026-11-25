# gamekit

Game building blocks for [Slim](https://github.com/cdmtn/slim-lang), for any engine that runs Slim scripts.

| Module | What it has |
|---|---|
| `math` | `distance2`, `distance3`, `damp`, `moveTowards` |
| `format` | `formatVector` |
| `host` | `GameHost`: what the engine gives the kit: frames, a log, storage that outlives a reload |
| `keep` | `createKeeper(host)`: state that survives a hot-reload, and save files |
| `commands` | `createCommands()`: a command table, several names per command, `run("give stone 2")` |
| `scenario` | `scenarioContext` and `advanceSteps`: tests that play out frame by frame |
| `inventory` | `createInventory(store, rules)`: slots with stacks and durability |
| `crafting` | `createCrafting(recipes, stock)`: recipes with inputs, tools and outputs, discovery, a craft that rolls back |
| `effects` | `createEffectClock()`: timed effects shown in whole seconds, counting down or up |
| `timers` | `createInterval(seconds)`: something done every few seconds from a frame callback, or at once when asked |
| `build/esbuild.mjs` | Bundling Slim scripts for an engine with Slim's esbuild plugin: classic-script output and a build status file |

## Setup

Slim looks for packages in the project's `packages/` folder, so `use { damp } from "@gamekit/math"` reads `packages/gamekit/math.slim`. Install it with spm (`spm i gamekit`, and `spm i std` for the standard library it uses), clone the repository there, or link a clone you keep elsewhere (PowerShell):

```bash
New-Item -ItemType Junction -Path packages\gamekit -Target path\to\gamekit
```

On Linux or macOS, `ln -s ~/code/gamekit packages/gamekit` does the same. The project needs `@slim-lang/core` and esbuild, and builds with Slim's plugin, `@slim-lang/core/esbuild`.

```bash
npm i -D @slim-lang/core esbuild
```

`commands` and the examples use Slim's standard library, [std](https://github.com/spm-libs/std). It goes in `packages/std` the same way: `spm i std`, or a link.

A game then describes its engine in a host file (`types/engine.slim`), wraps it in a `GameHost` (`src/host.slim`) and builds with Slim's `slim` plugin and `embeddedOptions` from `build/esbuild.mjs`. See [Getting started](docs/01-start.md).

## Quick example

```js
use { host } from "./host"
use { createRandom } from "@std/random"
use { clamp } from "@std/math"
use { createEffectClock } from "@gamekit/effects"

const random = createRandom()
const clock = createEffectClock()
let poison = 0

host.onFrame((dt) => {
    if (poison == 0 && random.chance(dt / 60)) poison = random.float(3, 8)
    poison = clamp(poison - dt, 0, 8)
    const active = poison > 0 ? [{ key: "poison", mode: "left", secs: poison }] : []
    if (clock.tick(dt, active) && active.length) engine.log(`poison: ${clock.seconds(active[0])} s left`)
})
```

About once a minute the player is poisoned for 3 to 8 seconds. The clock reports only when the whole seconds shown change, so the log gets one line a second, not one a frame.

## Documentation

The full guide is in [`docs/`](docs/index.md):

- [Getting started](docs/01-start.md): from nothing to a bundle the engine runs
- [Installation](docs/02-installation.md): `packages/`, links, spm, dependencies
- [The engine and GameHost](docs/03-host.md): the host file and the `GameHost`
- [Modules](docs/04-modules/index.md): every module's API, with examples
- [Building](docs/05-build.md): Slim's esbuild plugin, `embeddedOptions`, `buildStatus`, watch and dev builds
- [Testing](docs/06-testing.md): `slmc test` and scenarios in the running game
- [Recipes](docs/07-recipes/index.md): hot-reload state, save files, an engine package, inventory with crafting, effect timers
- [Things to know](docs/08-notes.md): global type names, checking packages, runtime checks

## Tests

The tests need std in `.packages/std`, the packages folder named in the kit's `slimconfig.json`:

```bash
spm i std
```

Then:

```bash
slmc test
```

The tests (`tests/gamekit.test.slim`) run in Node, without an engine.
