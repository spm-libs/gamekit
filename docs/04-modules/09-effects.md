# effects

Timed effects shown in whole seconds, counting down or up, with an update only when a shown number changes.

```js
use { host } from "./host"
use { createEffectClock } from "@gamekit/effects"

const clock = createEffectClock()

host.onFrame((dt) => {
    const active = [{ key: "bleeding", mode: "left", secs: 4.2 }, { key: "flying", mode: "up", secs: 0 }]
    if (!clock.tick(dt, active)) return
    engine.log(active.map((effect) => `${effect.key} ${clock.seconds(effect)}s`).join(", "))
})
```

## createEffectClock

`createEffectClock() -> EffectClock`

| Field | What it does |
|---|---|
| `tick(dt, active) -> bool` | Moves the clock on by `dt` seconds with the effects active now; `true` when a shown number changed |
| `seconds(effect) -> number` | The whole seconds to show for an effect |
| `snapshot() -> Record<string, number>` | How long each `"up"` effect has been running, by key: plain JSON |
| `restore(saved)` | Takes those times back, so the effects go on counting from them |

An effect is a `TimedEffect`:

| Field | Type | What it is |
|---|---|---|
| `key` | `string` | Which effect it is; effects are told apart by it |
| `mode` | `string` | `"left"`: a countdown, `"up"`: time since it started |
| `secs` | `number` | For `"left"`, the seconds left; not read for `"up"` |

`mode: "left"` shows the `secs` it is given, rounded up; `"up"` shows the whole seconds since the frame the effect first appeared. An `"up"` effect that leaves the list is forgotten, and starts from 0 when it comes back. Neither is ever below 0.

`tick` returns `true` only when a shown number changed (or an effect came or went), so the interface is updated about once a second instead of every frame. The first `tick` always returns `true`.

The clock keeps no effects of its own: the game decides what is active and passes the whole list every frame.

## Over a hot-reload

The only state the clock has is when each `"up"` effect started. Without `snapshot` and `restore` a reload starts those from 0. Keep it with a [keeper](04-keep.md):

```js
use { createEffectClock } from "@gamekit/effects"

const clock = createEffectClock()
session.keep("effect-clock", () => clock.snapshot(), (saved) => { clock.restore(saved) })
```

The first `tick` after `restore` returns `true`, so the interface is drawn again.
