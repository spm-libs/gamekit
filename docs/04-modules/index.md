# Modules

Each module is one `.slim` file at the root of the repository, imported as `@gamekit/<file name>`:

```js
use { damp } from "@gamekit/math"
use { createKeeper, Keeper } from "@gamekit/keep"
use { GameHost } from "@gamekit/host"

func keeperFor(host: GameHost) -> Keeper {
    return createKeeper(host)
}

const half = damp(0, 1, 1, 0.5)
```

| Module | Exports | Page |
|---|---|---|
| `math` | `distance2`, `distance3`, `damp`, `moveTowards` | [math](01-math.md) |
| `format` | `formatVector` | [format](02-format.md) |
| `host` | `GameHost` | [The engine and GameHost](../03-host.md) |
| `keep` | `createKeeper`, `Keeper` | [keep](04-keep.md) |
| `commands` | `createCommands`, `CommandRegistry` | [commands](05-commands.md) |
| `scenario` | `scenarioContext`, `advanceSteps`, `Step`, `StepRun`, `StepState`, `ScenarioContext` | [scenario](06-scenario.md) |
| `inventory` | `createInventory`, `SlotStore`, `ItemRules`, `SlotStack`, `InventorySnapshot`, `SlotInventory` | [inventory](07-inventory.md) |
| `crafting` | `createCrafting`, `Ingredient`, `Recipe`, `CraftingStock`, `CraftResult`, `Crafting` | [crafting](08-crafting.md) |
| `effects` | `createEffectClock`, `TimedEffect`, `EffectClock` | [effects](09-effects.md) |
| `timers` | `createInterval`, `IntervalTimer` | [timers](10-timers.md) |

Only `keep` needs a [`GameHost`](../03-host.md); the other modules take what they need as parameters.

`commands` needs std in `packages/std`: see [Installation](../02-installation.md#the-standard-library).

The names of the exported types are global across a Slim project: don't give a type of your own one of these names. See [Things to know](../08-notes.md).
