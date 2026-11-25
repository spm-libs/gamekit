# Keeping state over a hot-reload

When the engine evaluates the scripts again, module variables start over. Two things outlive that: what a [keeper](../04-modules/04-keep.md) saved, and the objects `host.persistent(name)` hands back.

## With a keeper

Register each piece of state on one line, and stash everything when the engine is about to reload:

```js
use { host } from "./host"
use { createKeeper } from "@gamekit/keep"

const keeper = createKeeper(host)
engine.on("reloadBegin", () => { keeper.stash() })

let score = 0
let level = "intro"
let best: number[] = []

keeper.keep("score", () => score, (saved) => { score = saved })
keeper.keep("level", () => level, (saved) => { level = saved })
keeper.keep("best", () => best, (saved) => { best = saved })

host.onFrame((dt) => { score += dt })
```

On the first run there is nothing saved and the variables keep their starting values. After a reload, each `keep` line calls its `load` right away, before the code below it runs.

- Keep plain data: the values go through JSON (with `Infinity`, `-Infinity` and `NaN` kept as they are).
- A saver that returns `undefined` keeps nothing under its key.
- `keeper.forget()` drops everything, for a new session.

## With persistent storage

`host.persistent(name)` is one object that stays the same across reloads. It suits state that is changed all the time and never needs to go to a file, such as the progress of a [scenario](../06-testing.md#scenarios-in-the-running-game):

```js
use { host } from "./host"

const stats = host.persistent("stats")
if (stats.frames == undefined) stats.frames = 0

host.onFrame(() => { stats.frames++ })
```

Nothing is copied: the object itself survives, so it needs no saver. It holds whatever the engine keeps for it, functions included, but it does not go into a save file.

## What starts over

- Module variables, unless kept.
- Handlers registered with the engine: every run of the scripts registers them again, so an engine that keeps old handlers across a reload has to drop them itself.
- Objects the kit makes, such as an inventory's counts or a crafting table's discovered recipes: keep what they hold (see [Inventory and crafting](04-inventory-crafting.md)).
