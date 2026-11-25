# scenario

Tests that run inside the real game: steps play out frame by frame, and a reload in the middle carries on where it was. The kit has the steps; starting a session, loading a map and reporting the result are the engine's. The whole flow, with a run that survives reloads, is in [Testing](../06-testing.md#scenarios-in-the-running-game).

```js
use { Step, StepRun, scenarioContext, advanceSteps } from "@gamekit/scenario"

const run: StepRun = { step: 0, elapsed: 0, failures: [], data: {} }
const steps: Step[] = []
const t = scenarioContext(run, steps)

let opened = false
t.step(() => { opened = true })
t.wait(0.5)
t.until(() => opened, "the door is open", 2)
t.step(() => { t.equal(opened, true, "door") })

let state = advanceSteps(steps, run, 0, () => {})
while (state == "running") state = advanceSteps(steps, run, 1 / 60, () => {})
```

## The run

`StepRun` is where the scenario is, kept between frames, and between reloads when it lives in [persistent storage](../03-host.md):

| Field | Type | What it is |
|---|---|---|
| `step` | `number` | The index of the step being played |
| `elapsed` | `number` | Seconds spent on a `wait` or `until` step so far |
| `failures` | `string[]` | What went wrong, one line each |
| `data` | `any` | What a test keeps across a reload: `t.data` is this object |

## scenarioContext

`scenarioContext(run: StepRun, steps: Step[], timeout = 10) -> ScenarioContext`

Gives the `t` a scenario body uses. Its step methods add to `steps`; its checks add to `run.failures`.

| Field | Kind | What it does |
|---|---|---|
| `step(run)` | step | Runs `run` on one frame, then goes on with the next step on the next frame |
| `wait(seconds)` | step | Waits that many seconds |
| `until(check, label, seconds?)` | step | Waits until `check()` is true; after `seconds` (the context's `timeout`, 10 unless told) it fails with `timed out: label` |
| `reload()` | step | Reloads the scripts; the run goes on with the step after it |
| `ok(value, label)` | check | Fails with `not true: label` when `value` is falsy |
| `equal(a, b, label)` | check | Fails with `label: got a, expected b` when the two differ as JSON |
| `near(a, b, within, label)` | check | Fails with `label: got a, expected b +- within` when they are further apart than `within` |
| `data` | | `run.data` |

`ok`, `equal` and `near` are not steps: they check when they are called and add to `run.failures`. Called in the body, they run while the steps are listed, before any `wait` or `until`, and again after every reload; to check at a point in the scenario, call them inside `t.step`. Anything a test must keep across a reload goes on `t.data`, not in a variable.

## advanceSteps

`advanceSteps(steps: Step[], run: StepRun, dt: number, reload: () => void, timeout = 10) -> StepState`

Call it once a frame with the frame's `dt`. It plays one `step` or `reload` step a frame, and counts `dt` towards a `wait` or `until`. It returns a `StepState`:

- `"running"`: there is more to play.
- `"done"`: every step was played. The test passed if `run.failures` is empty.
- `"timeout"`: an `until` ran out of time; the reason is in `run.failures`.

Stop calling it once it returns something other than `"running"`: after a timeout, every further call adds the same failure again.

A `reload` step moves `run.step` past itself and then calls `reload`, so the next run of the scripts starts from the step after it.

## Step

`Step` is one entry of the list: `run?`, `seconds?`, `until?`, `label?`, `reload?`. The context's methods make them; a list can also be written by hand.
