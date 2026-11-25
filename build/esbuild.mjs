import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

function readStatus(statusFile) {
  try {
    return !!JSON.parse(readFileSync(statusFile, "utf8")).failed;
  } catch {
    return false;
  }
}

export function buildStatus(statusFile) {
  let lastFailed = readStatus(statusFile);
  return {
    name: "build-status",
    setup(build) {
      build.onEnd((result) => {
        const failed = result.errors.length > 0;
        if (!failed && !lastFailed) return;
        lastFailed = failed;
        mkdirSync(dirname(statusFile), { recursive: true });
        writeFileSync(statusFile, JSON.stringify({ failed, errors: result.errors.map((error) => error.text) }));
      });
    },
  };
}

export function embeddedOptions({ entryPoints, outdir, plugins, target = "es2020", sourcemap = true }) {
  return {
    entryPoints,
    outdir,
    bundle: true,
    format: "iife",
    target,
    platform: "neutral",
    mainFields: ["module", "main"],
    banner: { js: '"use strict";' },
    sourcemap,
    logLevel: "info",
    plugins,
  };
}
