# format

Turning a position or a rotation into text for a HUD or a log.

```js
use { formatVector } from "@gamekit/format"

const where = formatVector([1.23456, 2, -0.5])
const rough = formatVector([1.23456, 2], 1)
```

| Function | Returns |
|---|---|
| `formatVector(values: number[], digits = 3) -> string` | `"[x, y, z]"` with each value rounded to `digits` places and trailing zeros dropped: `formatVector([1.23456, 2])` is `"[1.235, 2]"` |
