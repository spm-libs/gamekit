# An engine package

Keep what belongs to one engine in a package of its own next to the kit: the host file, the [`GameHost`](../03-host.md), and typed functions for the engine's events.

```
packages/
  gamekit/       this repository
  myengine/
    host.slim    the engine's globals: traits and global lines
    events.slim  one function per event
    gamehost.slim  the engine as a GameHost
```

## Typed events

Slim has no `keyof`, so `engine.on(name, handler)` can't know the handler's type from the name; one function per event can:

```js
trait DamageEvent {
    target: int
    amount: number
}

export func onFrame(handler: (dt: number) => void) -> void { engine.on("frame", handler) }
export func onDamage(handler: (e: DamageEvent) => void) -> void { engine.on("damage", handler) }
```

Then `onDamage((e) => ...)` knows `e.amount` is a number, and a typo in a field name is a compile error.

## The GameHost

`gamehost.slim` builds the `GameHost` once, for every game on that engine:

```js
use { GameHost } from "@gamekit/host"

export const host: GameHost = {
    onFrame: (handler: (dt: number) => void) => { engine.on("frame", handler) },
    log: (message: string) => { engine.log(message) },
    persistent: (name: string) => globalThis[`__${name}`] ?? (globalThis[`__${name}`] = {}),
}
```

A game then imports `@myengine/gamehost` and `@myengine/events` instead of writing its own, and the build passes `packages/myengine/host.slim` as the host file.

## Names

Types are matched by name across the whole project. Give the traits that type an engine's globals names that can't clash with a game's or a library's own, such as an `Api` ending (`WorldApi`, `PlayerApi`), and never reuse the kit's type names (see [Things to know](../08-notes.md)).
