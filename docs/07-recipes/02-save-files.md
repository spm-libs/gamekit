# Save files

A [keeper](../04-modules/04-keep.md) that keeps a game over hot-reloads can write the same state to a file. `collect()` returns everything as plain JSON, so `JSON.stringify(keeper.collect())` is a save file.

`src/saves.slim`:

```js
use { host } from "./host"
use { createKeeper } from "@gamekit/keep"

export const keeper = createKeeper(host)

let loading = false
engine.on("reloadBegin", () => { if (!loading) keeper.stash() })

export func saveText() -> string {
    return JSON.stringify(keeper.collect())
}

export func loadText(text: string) -> void {
    loading = true
    keeper.forget()
    Object.assign(host.persistent("kept"), JSON.parse(text))
    engine.reload()
}

export func newGame() -> void {
    loading = true
    keeper.forget()
    engine.reload()
}
```

The rest of the game keeps its state through the same keeper:

```js
use { keeper } from "./saves"

let gold = 0
keeper.keep("gold", () => gold, (saved) => { gold = saved })
```

How it works:

- **Saving** calls every saver and returns the result. `Infinity`, `-Infinity` and `NaN`, and objects of yours that have a `$kept` key, are written with marks (`{ "$kept": "number", "value": "Infinity" }`), so they come back as they were.
- **Loading** empties the store, puts the saved values in it (the store is `host.persistent("kept")`, or the name given to `createKeeper`) and reloads the scripts. Each `keep` line then hands its value back as after a hot-reload. A save written without the marks loads as it is.
- **The flag** stops `stash()` on that one reload: `stash()` would write the current values over the ones just loaded.
- **A new game** is the same without the values.

Where the text goes (a file, local storage, a server) is the engine's: pass `saveText()` to it and `loadText` what it reads back.

A key that is in the save but has no `keep` line any more stays in the store unused; a `keep` line that has nothing in the save keeps its starting value.
