# Effect timers on the HUD

Effects such as bleeding or flight show a number of seconds. Redrawing the HUD every frame is wasteful when the number changes once a second; an [effect clock](../04-modules/09-effects.md) says when it changed.

```js
use { host } from "./host"
use { createEffectClock, TimedEffect } from "@gamekit/effects"
use StringHelper from "@std/helpers/string"

let bleeding = 0
let flying = false

func activeEffects() -> TimedEffect[] {
    const list: TimedEffect[] = []
    if (bleeding > 0) list.push({ key: "bleeding", mode: "left", secs: bleeding })
    if (flying) list.push({ key: "flying", mode: "up", secs: 0 })
    return list
}

func clock(seconds: number) -> string {
    return `${StringHelper.pad(Math.floor(seconds / 60), 2)}:${StringHelper.pad(seconds % 60, 2)}`
}

const effects = createEffectClock()

host.onFrame((dt) => {
    bleeding = Math.max(0, bleeding - dt)
    const active = activeEffects()
    if (!effects.tick(dt, active)) return
    engine.log(active.map((effect) => `${effect.key} ${clock(effects.seconds(effect))}`).join("  "))
})

bleeding = 75
flying = true
```

- A `"left"` effect shows the `secs` the game passes, rounded up: the game counts it down.
- An `"up"` effect counts by itself from the frame it first appears in the list; when it leaves the list and comes back, it starts from 0.
- `tick` is called every frame with the whole list, and returns `true` only when a shown number changed or an effect came or went. Draw the HUD then.

`engine.log` stands for whatever draws the HUD in your engine.
