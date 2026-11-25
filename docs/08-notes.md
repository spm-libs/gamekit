# Things to know

## Type names are global

Slim matches types by name across the whole project, so a type of your own (or of the engine's host file) named like one of the kit's takes its place. The kit exports these types; don't reuse their names:

`GameHost`, `Keeper`, `CommandRegistry`, `Step`, `StepRun`, `StepState`, `ScenarioContext`, `SlotStore`, `ItemRules`, `SlotStack`, `InventorySnapshot`, `SlotInventory`, `Ingredient`, `Recipe`, `CraftingStock`, `CraftResult`, `Crafting`, `TimedEffect`, `EffectClock` and `IntervalTimer`.

For example, a `trait Ingredient { name: string }` in a file that also uses `Recipe` makes the recipe's `inputs` expect a `name`.

## Check the packages too

Imports from a package are typed only after the package's files were compiled. Slim's esbuild plugin checks `packages/` with the rest of the project, and compiles what a file imports before the file (see [Building](05-build.md#the-plugin)). A list of your own in its `files` option has to keep `packages/` in it.

## Hot-reload state goes through keep or remember

Module variables start over every time the engine evaluates the scripts again. Keep what belongs in a save file with a [keeper](04-modules/04-keep.md), and what only has to outlive a reload with [`remember`](04-modules/04-keep.md#remember), not with globals (see [Keeping state over a hot-reload](07-recipes/01-hot-reload.md)).

## Runtime checks cost

A release build leaves out Slim's runtime type checks; they catch what comes from the engine untyped, but they cost a lot in code that runs every frame. Keep them for a `--dev` build and run the game's tests in that build too (see [Building](05-build.md#release-and-dev-builds)).

## The working folder

Slim finds `slimconfig.json` and `packages/` in the project folder. A build script gives it as the plugin's `root`; without it, the working directory is the project folder.
