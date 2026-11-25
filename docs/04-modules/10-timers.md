# timers

Something done every few seconds from a frame callback: reading settings, redrawing a debug view.

```js
use { host } from "./host"
use { createInterval } from "@gamekit/timers"

const poll = createInterval(1, true)
let volume = 1

host.onFrame((dt) => {
    if (poll.tick(dt)) volume = engine.setting("volume")
})

func settingsClosed() -> void {
    poll.fire()
}
```

## createInterval

`createInterval(seconds: number, ready = false) -> IntervalTimer`

| Field | What it does |
|---|---|
| `tick(dt) -> bool` | Moves the timer on by `dt` seconds; `true` when `seconds` have gone by since it last fired, or when it was asked to fire |
| `fire()` | The next `tick` returns `true`, however little time went by |
| `reset()` | Starts the period over and forgets a `fire()` |

With `ready`, the first `tick` returns `true`: what the timer does happens on the first frame, then once a period.

A timer that fires starts its period over from that frame. It does not catch up: after a long pause, one `tick` returns `true` once, not once for every period missed. For something that must happen a set number of times, count the time yourself.

The period is fixed when the timer is made. For one that changes, such as a setting in minutes, count the time yourself or make a new timer when it changes.
