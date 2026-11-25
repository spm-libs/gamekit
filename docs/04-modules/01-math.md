# math

Numeric helpers for a game world: distances, and values that follow a target from frame to frame.

```js
use { distance2, distance3, damp, moveTowards } from "@gamekit/math"

const flat = distance2(0, 0, 3, 4)
const full = distance3(0, 0, 0, 3, 4, 0)

let fog = 0
let height = 0
func frame(dt: number, fogTarget: number) -> void {
    fog = damp(fog, fogTarget, 8, dt)
    height = moveTowards(height, 10, 2 * dt)
}
```

| Function | Returns |
|---|---|
| `distance2(ax, az, bx, bz)` | The distance between two points on the ground plane (x and z) |
| `distance3(ax, ay, az, bx, by, bz)` | The distance between two points in space |
| `damp(current, target, tau, dt)` | `current` moved toward `target` over `dt` seconds, exponentially: after `tau` seconds about 63% of the way is gone, after `3 * tau` about 95%; `target` when `tau` is 0 or less |
| `moveTowards(current, target, step)` | `current` moved toward `target` by at most `step`, never past it |

All parameters and results are `number`.

## damp

`damp` is for a value that follows another every frame: a fog density, a camera, a volume. It gives the same result whatever the frame rate: ten frames of 0.1 s land where a hundred of 0.01 s do.

`moveTowards` moves at a steady speed instead: give it `speed * dt` as the step.
