# Installation

## Put the kit in `packages/`

Slim looks for packages in the `packages/` folder of the project, so `use { damp } from "@gamekit/math"` reads `packages/gamekit/math.slim`. Clone the repository there, or link a clone you keep elsewhere.

On Windows, in PowerShell, a directory junction:

```bash
New-Item -ItemType Junction -Path packages\gamekit -Target path\to\gamekit
```

On Linux or macOS, a symbolic link:

```bash
ln -s ~/code/gamekit packages/gamekit
```

The build follows the link: Slim's esbuild plugin walks into junctions and symlinked folders (see [Building](05-build.md)). A link is the way to share one copy of the kit between several games and to work on the kit while a game uses it.

To remove a junction, remove the link, not the folder it points to: `cmd /c rmdir packages\gamekit` on Windows, `rm packages/gamekit` elsewhere.

### With spm

Slim's package manager installs packages into the same folder. The kit is in the spm registry as `gamekit` (its source is [spm-libs/gamekit](https://github.com/spm-libs/gamekit)); this downloads it into `packages/gamekit` and records the commit in `spm.lock.json`. The kit needs std too:

```bash
spm i gamekit
spm i std
```

`spm i` with no name installs everything `spm.lock.json` lists, and `spm i gamekit --latest` takes the newest commit instead of the locked one.

### Another folder name

The folder comes from `slimconfig.json` in the project root: `packages` (or `names.packages`) names it, `packages/` unless told. Slim and the kit's build both read it.

```json
{
  "packages": "vendor"
}
```

## The standard library

`commands` and the examples in this guide use Slim's standard library, [std](https://github.com/spm-libs/std). It goes in `packages/std`, as the kit goes in `packages/gamekit`: install it with spm, or link a clone of it the way the kit is linked above.

```bash
spm i std
```

`@std/parse` and `@std` itself need Node, and `@std/helpers/request` needs `fetch`: they don't run in an engine that has neither.

## Install the compiler and esbuild

The kit needs `@slim-lang/core` in the project. The build uses Slim's esbuild plugin, `@slim-lang/core/esbuild`, and esbuild itself.

```bash
npm i -D @slim-lang/core esbuild
```

The build script is an ES module, so the project's `package.json` has `"type": "module"` (or the build is named `build.mjs`).

## Check it works

Any file that imports a module now compiles:

```js
use { damp } from "@gamekit/math"
use { clamp } from "@std/math"

const health = clamp(damp(0, 100, 2, 1), 0, 100)
```

Next: [describe the engine and connect it to the kit](03-host.md).
