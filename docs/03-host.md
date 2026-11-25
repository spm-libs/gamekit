# The engine and GameHost

Two files connect a game to its engine: a host file that gives the engine's globals a type, and a `GameHost` that hands the kit the few things it needs.

## Describe the engine

What the engine puts on `globalThis` gets a type in a host file, made of traits and `global` lines. The checker then knows every call into the engine in every file, and nothing of it goes into the output: the engine provides the values.

`types/engine.slim`:

```js
trait Engine {
    on: (event: string, handler: function) => void
    log: (message: string) => void
    reload: () => void
    slots: () => number[]
    setSlot: (slot: number, item: number) => void
}

global engine: Engine
```

The build passes this file to Slim as its `host` (see [Building](05-build.md)), so every file sees `engine` without a `use`. Grow it as the engine grows: a new global gets a trait and a `declare const` line.

`engine.on(name, handler)` takes any function: Slim has no `keyof`, so the handler's type can't follow from the event's name. One typed function per event fixes that; see [An engine package](07-recipes/03-engine-package.md).

## Connect the engine to the kit

`GameHost` is all the kit asks of an engine: a callback every frame, a log, and storage that outlives a hot-reload.

```js
use { GameHost } from "@gamekit/host"

func describe(host: GameHost) -> void {
    host.log("frames, a log and storage")
}
```

The trait, from `host.slim`:

| Field | Type | What it does |
|---|---|---|
| `onFrame` | `(handler: (dt: number) => void) => void` | Calls `handler` every frame with the seconds since the last one |
| `log` | `(message: string) => void` | Writes a line to the engine's log |
| `persistent` | `(name: string) => Record<string, any>` | An object stored under `name` that is still there after the scripts are evaluated again |

`persistent(name)` has to hand back the same object after a hot-reload. An engine that keeps its JavaScript context across reloads can use `globalThis` for that.

`src/host.slim`:

```js
use { GameHost } from "@gamekit/host"

export const host: GameHost = {
    onFrame: (handler: (dt: number) => void) => { engine.on("frame", handler) },
    log: (message: string) => { engine.log(message) },
    persistent: (name: string) => globalThis[`__${name}`] ?? (globalThis[`__${name}`] = {}),
}
```

The game imports it with `use { host } from "./host"` and passes it to what needs it: `createKeeper(host)`, or `host.persistent(...)` for a [scenario](06-testing.md#scenarios-in-the-running-game).

An engine that runs the scripts in a fresh context on every reload has to keep the objects on its side instead, and give them back by name.

## Next

- [Building](05-build.md): passing the host file to the build.
- [Keeping state over a hot-reload](07-recipes/01-hot-reload.md): what `persistent` is for.
