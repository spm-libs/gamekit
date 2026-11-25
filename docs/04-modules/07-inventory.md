# inventory

Slots with stacks and durability. The engine usually knows only which item is in which slot. The kit keeps counts and durability next to that, and reads and writes the ids through a `store`. Item `0` is an empty slot.

```js
use { createInventory } from "@gamekit/inventory"

const AXE = 9

const inventory = createInventory(
    { ids: () => engine.slots(), assign: (slot: number, item: number) => engine.setSlot(slot, item) },
    {
        maxStack: (item: number) => item == AXE ? 1 : 64,
        maxDurability: (item: number) => item == AXE ? 50 : 0,
        hasDurability: (item: number) => item == AXE,
    },
)

inventory.give(1, 10)
inventory.take(1, 3)
const broke = inventory.wear(0)
```

## createInventory

`createInventory(store: SlotStore, rules: ItemRules) -> SlotInventory`

`SlotStore` is the engine's side:

| Field | What it does |
|---|---|
| `ids() -> number[]` | The item id in every slot, `0` for an empty one |
| `assign(slot, item)` | Puts `item` in `slot` |

`ItemRules` says what the items are:

| Field | What it does |
|---|---|
| `maxStack(item) -> number` | How many fit in one slot; 0 or less: the item can't be placed at all |
| `maxDurability(item) -> number` | The durability of a new item |
| `hasDurability(item) -> bool` | Whether the item wears out |

## SlotInventory

| Field | What it does |
|---|---|
| `slots() -> number[]` | The ids, read from `store.ids()` and cached until the next write |
| `invalidate()` | Drops the cache: call it when the engine changed a slot itself, at the start of a frame for example |
| `count(slot) -> number` | How many items are in the slot: 0 for an empty one, at least 1 for a slot the engine filled |
| `durability(slot) -> number` | What is left of the item's durability; 0 for an item that doesn't wear |
| `set(slot, item, count, durability?)` | Puts a stack in the slot as it is; durability defaults to full |
| `countItem(item) -> number` | How many of an item there are over all slots |
| `giveCount(item, count) -> number` | Adds as many as fit and returns how many did not |
| `give(item, count = 1) -> bool` | `giveCount(item, count) == 0`: `true` when all of them fit |
| `take(item, count = 1) -> bool` | Removes all it is asked for, or nothing when there aren't enough |
| `takeOne(slot) -> number` | Takes one item from the slot and returns its id, `0` for an empty slot |
| `takeStack(slot) -> SlotStack` | Empties the slot and returns `{ item, count }` |
| `snapshot() -> InventorySnapshot` | Every slot's id, count and durability |
| `restore(snapshot)` | Puts every slot back as the snapshot has it |
| `wear(slot, amount = 1) -> bool` | Wears the item; `true` when it broke |

### Giving and taking

`giveCount` first tops up the stacks of that item that are already there, then fills empty slots, `maxStack` at a time. It returns how many did not fit: all of them for an item whose `maxStack` is 0 or less, and 0 for item `0` or a count of 0 or less. What fits stays, even when `give` returns `false`: to give all or nothing, take a `snapshot` first and `restore` it when `give` fails.

`take` removes all it is asked for or, when there aren't enough, nothing; it takes from the last slots first. `takeOne` and `takeStack` empty a slot. `snapshot` and `restore` undo a group of changes.

### Durability

A stack keeps its durability when items are added or taken. `wear(slot, amount)` returns `true` when the item broke: the stack loses one item, and the rest start at full durability. A negative `amount` repairs, up to the item's `maxDurability` and no further. On an item without durability `wear` does nothing and returns `false`.

### The cache

`slots()` is cached until the next write; call `invalidate()` when the engine changed a slot itself, at the start of a frame for example. Counts and durability live in the kit, not in the engine: to keep them over a hot-reload, keep a `snapshot()` with a [keeper](04-keep.md):

```js
use { host } from "./host"
use { createKeeper } from "@gamekit/keep"
use { createInventory } from "@gamekit/inventory"

const inventory = createInventory(
    { ids: () => engine.slots(), assign: (slot: number, item: number) => engine.setSlot(slot, item) },
    { maxStack: (item: number) => 64, maxDurability: (item: number) => 0, hasDurability: (item: number) => false },
)

const keeper = createKeeper(host)
engine.on("reloadBegin", () => { keeper.stash() })
keeper.keep("inventory", () => inventory.snapshot(), (saved) => { inventory.restore(saved) })

host.onFrame(() => { inventory.invalidate() })
```

The inventory can be the stock of a [crafting](08-crafting.md) table as it is.
