# gamekit

gamekit is a set of game building blocks for [Slim](https://github.com/cdmtn/slim-lang), for any engine that runs Slim scripts.

It is plain Slim source: put the repository in your project's `packages/` folder and import its modules as `@gamekit/<module>`. `commands` and the examples use Slim's standard library, [std](02-installation.md#the-standard-library).

| Module | What it has |
|---|---|
| [`math`](04-modules/01-math.md) | `distance2`, `distance3`, `damp`, `moveTowards` |
| [`format`](04-modules/02-format.md) | `formatVector` |
| [`host`](03-host.md) | `GameHost`: what the engine gives the kit: frames, a log, storage that outlives a reload |
| [`keep`](04-modules/04-keep.md) | `createKeeper(host)`: state that survives a hot-reload, and save files |
| [`commands`](04-modules/05-commands.md) | `createCommands()`: a command table, several names per command, `run("give stone 2")` |
| [`scenario`](04-modules/06-scenario.md) | `scenarioContext` and `advanceSteps`: tests that play out frame by frame: steps (`step`, `wait`, `until`, `reload`) and checks (`ok`, `equal`, `near`) |
| [`inventory`](04-modules/07-inventory.md) | `createInventory(store, rules)`: slots with stacks and durability; the engine keeps the item ids, the kit the rest |
| [`crafting`](04-modules/08-crafting.md) | `createCrafting(recipes, stock)`: recipes with inputs, tools and outputs, discovery, a craft that rolls back when the outputs don't fit |
| [`effects`](04-modules/09-effects.md) | `createEffectClock()`: timed effects shown in whole seconds, counting down or up |
| [`timers`](04-modules/10-timers.md) | `createInterval(seconds)`: something done every few seconds from a frame callback, or at once when asked |
| [`build/esbuild.mjs`](05-build.md) | Bundling Slim scripts for an engine with Slim's esbuild plugin: classic-script output and a build status file |

## A short example

```js
use { createCommands } from "@gamekit/commands"
use { createRandom, pick } from "@std/random"

const loot = createRandom(1234)
const commands = createCommands()

commands.add("loot|l", "/loot - roll for loot", (args) => {
    const color = pick(loot, ["red", "green", "blue"])
    engine.log(`${loot.int(1, 3)} sticks, a ${color} gem`)
})

commands.run("loot")
```

`engine` here is whatever object your engine gives scripts; [Getting started](01-start.md) shows how it gets a type.

## Where to go next

- [Getting started](01-start.md): from nothing to a bundle the engine runs.
- [Installation](02-installation.md): putting the kit in `packages/`.
- [The engine and GameHost](03-host.md): describing the engine to the checker and to the kit.
- [Modules](04-modules/index.md): every module, with its API and examples.
- [Building](05-build.md): Slim's esbuild plugin, `embeddedOptions` and `buildStatus`.
- [Testing](06-testing.md): unit tests with `slmc test`, scenarios inside the running game.
- [Recipes](07-recipes/index.md): hot-reload state, save files, an engine package, inventory with crafting, effect timers.
- [Things to know](08-notes.md): the pitfalls worth knowing up front.
