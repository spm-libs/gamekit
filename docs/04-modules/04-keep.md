# keep

State that survives a hot-reload. Module variables start over every time the engine evaluates the scripts again; a keeper saves what you ask it to just before that, and hands it back when the same line runs again.

```js
use { host } from "./host"
use { createKeeper } from "@gamekit/keep"

const keeper = createKeeper(host)
engine.on("reloadBegin", () => { keeper.stash() })

let score = 0
let visited: string[] = []
keeper.keep("score", () => score, (saved) => { score = saved })
keeper.keep("visited", () => visited, (saved) => { visited = saved })
```

## createKeeper

`createKeeper(host: GameHost, name = "kept") -> Keeper`

The keeper stores what it saves in `host.persistent(name)`. Two keepers with different names don't touch each other's keys; two with the same name share one store.

| Field | What it does |
|---|---|
| `keep(key, save, load)` | Registers `save` to run before a reload and, if a value was saved under `key`, calls `load` with it right away |
| `stash()` | Saves everything into the persistent store: call it when the engine is about to reload |
| `collect() -> Record<string, any>` | Returns everything as plain JSON without storing it, for a save file |
| `forget()` | Drops everything in the store: a new session |

`keep(key: string, save: () => any, load: (value: any) => void)`. A saved value is handed to `load` once: it leaves the store when it is loaded, so `stash()` has to run again before the next reload.

## remember

`remember<T>(host: GameHost, name: string, init: () => T) -> T`

Gives back the same value every time the scripts are evaluated again: the first call makes it with `init`, later ones return what is stored under `name` in `host.persistent("remembered")`. It is for memory that only has to outlive a reload, such as a chat log or a test run, and never goes into a save file. An object it returns can be changed in place; keep numbers and strings in an object, since a variable that holds one starts over:

```js
use { remember } from "@gamekit/keep"

const chat = remember(host, "chat", () => ({ log: [] as Msg[], nextId: 1 }))
chat.log.push({ id: chat.nextId++, text })
```

The type comes from `init`. Use a keeper instead when the value belongs in a save file.

## What can be kept

Values go through JSON, except that `Infinity`, `-Infinity` and `NaN` come back as they were. `collect()` returns plain JSON, with those numbers written as `{ "$kept": "number", "value": "Infinity" }`, and an object of yours that has a `$kept` key wrapped as `{ "$kept": "object", "value": ... }`, so `JSON.stringify(keeper.collect())` is a save file and `keep` hands back what was saved. A save written without these marks loads as it is.

- A saver that returns `undefined` saves nothing under its key, and `stash()` removes what was stored under it.
- A saver that throws loses only its own key, and the keeper logs why with `host.log`: `could not keep "key": ...`.
- `stash()` touches only the keys that have a saver; other keys in the store stay.
- Keys such as `constructor` or `toString` are ordinary keys: nothing is read from an object's prototype.

What JSON can't hold (functions, class instances with methods, `Map`, `Set`) does not come back as it was: keep plain data and rebuild the rest in `load`.

## Save files

```js
use { host } from "./host"
use { createKeeper } from "@gamekit/keep"

const keeper = createKeeper(host)
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
```

Loading puts the saved values in the store and reloads the scripts: every `keep` line then hands back its value. The `loading` flag matters: `stash()` writes the current values over the store, so the reload that loads a save must not stash. See [Save files](../07-recipes/02-save-files.md) for the whole flow.
