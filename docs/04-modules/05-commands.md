# commands

A command table for a console or a chat: several names per command, a usage line for help, and a `run` that takes the line as typed.

```js
use { createCommands } from "@gamekit/commands"

const commands = createCommands()
commands.add("give|g", "/give <item> [count]", (args) => {
    engine.log(`give ${args[0]} x${args[1] ?? "1"}`)
})

commands.run("give stone 2")
commands.run("G stone")
```

## createCommands

`createCommands() -> CommandRegistry`

| Field | What it does |
|---|---|
| `add(names, usage, run)` | Registers `run` under every name in `names`, separated by `\|` (`"give\|g"`), with one `usage` line |
| `run(line) -> bool` | Runs the command the line names; `false` when no command has that name |
| `names() -> string[]` | Every name, aliases included, sorted: for completion |
| `usages() -> string[]` | One usage line per command, in the order they were added: for a help screen |

`add(names: string, usage: string, run: (args: string[]) => void)`.

A name added again points to the new command. A command whose names were all taken by later ones is gone, with its usage line, so adding the same commands again after a hot-reload does not repeat their lines.

## How a line is read

`run` takes a line without the slash. It splits the line on whitespace: the first word is the name, the rest are `args`. Words in double or single quotes stay together, without the quotes: `give "oak log" 2` gives the args `["oak log", "2"]`, and `""` is an empty arg. A quote left open runs to the end of the line.

Names are matched in any case: `add` and `run` both lowercase them, so `"Give"` and `"GIVE"` find the same command. A name that no command has returns `false`, and so do names an object already has, such as `constructor` or `toString`.

`commands` needs std in `packages/std` (see [Installation](../02-installation.md#the-standard-library)).

A help command lists the usages:

```js
use { createCommands } from "@gamekit/commands"

const commands = createCommands()
commands.add("help|?", "/help - this list", () => {
    for (const line of commands.usages()) engine.log(line)
})
commands.add("time|t", "/time - the clock", () => { engine.log(`${Date.now()}`) })

func typed(line: string) -> void {
    const text = line.startsWith("/") ? line.slice(1) : line
    if (!commands.run(text)) engine.log(`unknown command: ${text}`)
}

typed("/help")
```
