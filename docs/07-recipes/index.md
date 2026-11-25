# Recipes

How to do common things in a game with the kit. Every recipe assumes the project from [Getting started](../01-start.md): the engine described in `types/engine.slim` and a `GameHost` in `src/host.slim`.

- [Keeping state over a hot-reload](01-hot-reload.md): `keep`, `persistent`, and what starts over.
- [Save files](02-save-files.md): writing what the keeper holds to a file, and loading it back.
- [An engine package](03-engine-package.md): typed functions for the engine's events, in a package of its own.
- [Inventory and crafting](04-inventory-crafting.md): an inventory over the engine's slots, recipes, and commands to drive them.
- [Effect timers on the HUD](05-effect-timers.md): countdowns that update once a second.
