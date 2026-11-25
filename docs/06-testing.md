# Testing

Two kinds of tests suit a game on the kit: unit tests that run in Node, without an engine, and scenarios that play out in the running game.

## Unit tests with slmc test

The kit's own tests need std in `.packages/std`, the packages folder named in its `slimconfig.json`: `spm i std`.

Slim's test runner runs every `*.test.slim` file under the working folder:

```bash
slmc test
```

`slmc test tests/gamekit.test.slim` runs one file, `slmc test -f inventory` the tests whose names contain the text, and `--coverage` prints which lines of the tested files ran.

The kit's own tests are in `tests/gamekit.test.slim` and run this way in Node, with a fake `GameHost` where one is needed.

`tests/game.test.slim`:

```js
use { GameHost } from "../host"
use { createKeeper } from "../keep"
use { createInventory } from "../inventory"

func fakeHost(store: Record<string, any>, logs: string[]) -> GameHost {
    return {
        onFrame: (handler: (dt: number) => void) => { handler(0) },
        log: (message: string) => { logs.push(message) },
        persistent: (name: string) => store[name] || (store[name] = {}),
    }
}

test("a keeper hands state back after a reload", () => {
    const store: Record<string, any> = {}
    const before = createKeeper(fakeHost(store, []))
    before.keep("count", () => 3, (value) => {})
    before.stash()
    let loaded: any = null
    const after = createKeeper(fakeHost(store, []))
    after.keep("count", () => 0, (value) => { loaded = value })
    assertEqual(loaded, 3)
})

test("an inventory takes all or nothing", () => {
    const ids = [0, 0, 0]
    const inventory = createInventory(
        { ids: () => ids.slice(), assign: (slot: number, item: number) => { ids[slot] = item } },
        { maxStack: (item: number) => 10, maxDurability: (item: number) => 0, hasDurability: (item: number) => false },
    )
    inventory.give(1, 15)
    assertDeepEqual(ids, [1, 1, 0])
    assert(!inventory.take(1, 16))
    assertEqual(inventory.countItem(1), 15)
})
```

The file sits in the kit's `tests/` folder, so it imports the modules by relative path. In a game, a test file imports them as `@gamekit/...` like any other file. `test`, `assert`, `assertEqual`, `assertDeepEqual` and `assertThrows` are the test runner's own.

## Scenarios in the running game

Tests that run inside the real game: steps play out frame by frame, and a reload in the middle carries on where it was. The kit has the steps ([scenario](04-modules/06-scenario.md)); starting a session, loading a map and reporting the result are the engine's.

```js
use { host } from "./host"
use { Step, StepRun, ScenarioContext, scenarioContext, advanceSteps } from "@gamekit/scenario"

const run: StepRun = host.persistent("testRun") as StepRun
if (run.failures == undefined) {
    run.step = 0
    run.elapsed = 0
    run.failures = []
    run.data = {}
}

func body(t: ScenarioContext) -> void {
    t.step(() => { t.data.start = engine.slots().length })
    t.wait(0.5)
    t.until(() => engine.slots().length > 0, "the inventory is there", 5)
    t.step(() => { t.equal(engine.slots().length, 36, "slots") })
}

const steps: Step[] = []
body(scenarioContext(run, steps))

let finished = false
host.onFrame((dt) => {
    if (finished) return
    const state = advanceSteps(steps, run, dt, () => engine.reload())
    if (state == "running") return
    finished = true
    engine.log(run.failures.length ? `failed: ${run.failures.join("; ")}` : "passed")
})
```

`run` lives in persistent storage, so a `t.reload()` step reloads the scripts and the next run of this file starts from the step after it. The body runs again on every run of the file and lists the same steps; `advanceSteps` picks up at `run.step`.

`ok`, `equal` and `near` are not steps: they check when they are called and add to `run.failures`. Called in the body, they run while the steps are listed, before any `wait` or `until`, and again after every reload; to check at a point in the scenario, call them inside `t.step`. Anything a test must keep across that goes on `t.data`, not in a variable.

`advanceSteps` returns `"running"`, `"done"` or `"timeout"`, and puts the reasons for a failure in `run.failures`. Once it returns something else than `"running"`, stop calling it, as the `finished` flag does here.

To run the scenario again, clear the run: set `run.failures` to `undefined` (or drop the `testRun` object on the engine's side) and reload.

### A hot-reload in the middle

```js
use { host } from "./host"
use { createKeeper } from "@gamekit/keep"
use { Step, StepRun, scenarioContext, advanceSteps } from "@gamekit/scenario"

const keeper = createKeeper(host)
engine.on("reloadBegin", () => { keeper.stash() })

let coins = 0
keeper.keep("coins", () => coins, (saved) => { coins = saved })

const run: StepRun = host.persistent("reloadTest") as StepRun
if (run.failures == undefined) {
    run.step = 0
    run.elapsed = 0
    run.failures = []
    run.data = {}
}

const steps: Step[] = []
const t = scenarioContext(run, steps)
t.step(() => { coins = 7 })
t.reload()
t.step(() => { t.equal(coins, 7, "coins after a reload") })

host.onFrame((dt) => {
    if (run.step > steps.length) return
    const state = advanceSteps(steps, run, dt, () => engine.reload())
    if (state == "running") return
    run.step = steps.length + 1
    engine.log(run.failures.length ? `failed: ${run.failures.join("; ")}` : "passed")
})
```

Here the end is marked in the run itself (`run.step` past the last step), so a reload after the test does not report it again.
