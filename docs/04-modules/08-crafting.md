# crafting

Recipes with inputs, tools and outputs, discovery, and a craft that rolls back when the outputs don't fit.

```js
use { host } from "./host"
use { createInventory } from "@gamekit/inventory"
use { createCrafting, Recipe } from "@gamekit/crafting"

const STONE = 1
const STICK = 2
const AXE = 9

const inventory = createInventory(
    { ids: () => engine.slots(), assign: (slot: number, item: number) => engine.setSlot(slot, item) },
    { maxStack: (item: number) => 64, maxDurability: (item: number) => 0, hasDurability: (item: number) => false },
)

const recipes: Recipe[] = [
    {
        id: "axe",
        inputs: [{ item: STONE, count: 2 }, { item: STICK, count: 1 }],
        outputs: [{ item: AXE, count: 1 }],
        discover: () => inventory.countItem(STONE) > 0,
    },
]

const crafting = createCrafting(recipes, inventory)

host.onFrame(() => { crafting.refresh() })

const result = crafting.craft(recipes[0])
if (result == "full") engine.log("no room for the axe")
```

## Recipes

| Field of `Recipe` | Type | What it is |
|---|---|---|
| `id` | `string` | A name, unique among the recipes |
| `inputs` | `Ingredient[]` | Spent by a craft |
| `tools` | `Ingredient[]`, optional | Needed but not spent |
| `outputs` | `Ingredient[]` | Given by a craft |
| `discover` | `() => bool`, optional | When the recipe shows up; without it, it shows from the start |

An `Ingredient` is `{ item: number, count: number }`.

`tools` are needed but not spent; an item that is both an input and a tool has to be there for both: a recipe that spends 2 stone and needs 1 stone as a tool can only be made with 3.

## createCrafting

`createCrafting(recipes: Recipe[], stock: CraftingStock) -> Crafting`

| Field | What it does |
|---|---|
| `refresh()` | Calls `discover()` of the recipes not yet discovered |
| `visible() -> Recipe[]` | Refreshes, then returns the discovered recipes in list order |
| `canCraft(recipe) -> bool` | Whether the stock has every input and tool |
| `missing(recipe) -> Ingredient[]` | What is short, item by item: `[{ item: STICK, count: 1 }]` is one stick short; empty when it can be crafted |
| `maxCraftable(recipe) -> number` | How many times it can be crafted with what is in the stock; `Infinity` when it spends nothing |
| `craft(recipe) -> CraftResult` | Crafts once: `"crafted"`, `"missing"` or `"full"` |
| `discovered() -> string[]` | The ids of the discovered recipes |
| `discoverAll()` | Discovers every recipe at once, as a cheat or a creative mode |

A recipe shows up in `visible()` once its `discover()` was true, and stays. Recipes added to the list later, or put in place of others, are looked at too: the list is read again whenever it changed. Once every recipe in an unchanged list is discovered, `refresh()` does nothing, so calling it every frame is cheap.

`missing` and `maxCraftable` look at the inputs and tools only: whether the outputs fit is known only by crafting. They count an item that is both an input and a tool as `canCraft` does.

```js
for (const part of crafting.missing(recipes[0])) engine.log(`need ${part.count} more of ${part.item}`)
const most = crafting.maxCraftable(recipes[0])
```

`craft` returns:

- `"crafted"`: the inputs were taken and the outputs given.
- `"missing"`: not enough of something, and nothing changed.
- `"full"`: the outputs didn't fit, and nothing changed.

## The stock

A [slot inventory](07-inventory.md) can be the stock as it is; anything with `countItem`, `take`, `give`, `snapshot` and `restore` works too. That is `CraftingStock`:

| Field | What it does |
|---|---|
| `countItem(item) -> number` | How many of the item there are |
| `take(item, count) -> bool` | Takes them all, or nothing and returns `false` |
| `give(item, count) -> bool` | Gives them; `false` when they didn't all fit |
| `snapshot() -> any` | The state to go back to |
| `restore(snapshot)` | Goes back to it |

`craft` takes a snapshot before it changes anything and restores it when a `take` or a `give` fails, so a stock whose `give` fills what it can and returns `false` is rolled back as a whole.

The discovered recipes live in the crafting object and start over on a hot-reload. To keep them, keep `discovered()` with a [keeper](04-keep.md) and have each `discover()` check that list first. See [Inventory and crafting](../07-recipes/04-inventory-crafting.md).
