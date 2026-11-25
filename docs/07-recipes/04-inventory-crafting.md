# Inventory and crafting

An inventory over the engine's slots, recipes that use it as their stock, commands to drive both, and a keeper so that a hot-reload loses nothing.

`src/items.slim`:

```js
use { host } from "./host"
use { createKeeper } from "@gamekit/keep"
use { createInventory } from "@gamekit/inventory"
use { createCrafting, Recipe } from "@gamekit/crafting"
use { createCommands } from "@gamekit/commands"

const STONE = 1
const STICK = 2
const AXE = 9
const NAMES: Record<string, number> = { stone: STONE, stick: STICK, axe: AXE }

export const inventory = createInventory(
    { ids: () => engine.slots(), assign: (slot: number, item: number) => engine.setSlot(slot, item) },
    {
        maxStack: (item: number) => item == AXE ? 1 : 64,
        maxDurability: (item: number) => item == AXE ? 50 : 0,
        hasDurability: (item: number) => item == AXE,
    },
)

let known: string[] = []
const seen = (id: string) => known.includes(id)

const recipes: Recipe[] = [
    {
        id: "axe",
        inputs: [{ item: STONE, count: 2 }, { item: STICK, count: 1 }],
        outputs: [{ item: AXE, count: 1 }],
        discover: () => seen("axe") || inventory.countItem(STONE) > 0,
    },
    {
        id: "sharp-stone",
        inputs: [{ item: STONE, count: 1 }],
        tools: [{ item: AXE, count: 1 }],
        outputs: [{ item: STONE, count: 2 }],
        discover: () => seen("sharp-stone") || inventory.countItem(AXE) > 0,
    },
]

export const crafting = createCrafting(recipes, inventory)

const keeper = createKeeper(host)
engine.on("reloadBegin", () => { keeper.stash() })
keeper.keep("inventory", () => inventory.snapshot(), (saved) => { inventory.restore(saved) })
keeper.keep("recipes", () => crafting.discovered(), (saved) => { known = saved })

host.onFrame(() => {
    inventory.invalidate()
    crafting.refresh()
})

export const commands = createCommands()

commands.add("give|g", "/give <item> [count]", (args) => {
    const item = NAMES[args[0] ?? ""] ?? 0
    const left = inventory.giveCount(item, Number(args[1] ?? "1"))
    if (left > 0) engine.log(`${left} did not fit`)
})

commands.add("craft|c", "/craft <recipe>", (args) => {
    const recipe = crafting.visible().find((r) => r.id == args[0])
    if (!recipe) {
        engine.log(`no such recipe: ${args[0] ?? ""}`)
        return
    }
    const result = crafting.craft(recipe)
    if (result == "missing") engine.log("not enough to craft that")
    if (result == "full") engine.log("no room for what it makes")
})

commands.add("recipes", "/recipes - what can be crafted", () => {
    for (const recipe of crafting.visible()) engine.log(`${recipe.id}${crafting.canCraft(recipe) ? "" : " (missing something)"}`)
})
```

What it shows:

- **The engine keeps the ids, the kit the rest.** The `store` reads and writes the engine's slots; counts and durability live in the inventory. `invalidate()` at the start of a frame picks up what the engine changed by itself.
- **The inventory is the stock.** `createCrafting` takes it as it is: it has `countItem`, `take`, `give`, `snapshot` and `restore`.
- **A tool is needed but not spent.** `sharp-stone` needs the axe in the inventory and leaves it there.
- **A craft is all or nothing.** When the outputs don't fit, `craft` returns `"full"` and puts everything back.
- **Nothing is lost on a hot-reload.** The keeper keeps a `snapshot()` of the slots and the ids of the discovered recipes. A recipe's `discover()` checks the kept ids first, so a recipe found once stays found even if what found it is gone.

Use a tool by wearing it:

```js
use { inventory } from "./items"

func chop(slot: number) -> void {
    if (inventory.wear(slot)) engine.log("the axe broke")
}
```
