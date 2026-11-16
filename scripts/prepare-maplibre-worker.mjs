import { copyFile, mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const packagePath = require.resolve("maplibre-gl/package.json");
const { version } = JSON.parse(await readFile(packagePath, "utf8"));
const destination = fileURLToPath(new URL(`../public/maplibre/${version}/`, import.meta.url));

// The worker imports the shared module by filename. Copy both from the installed
// package so upgrades stay in sync and each version has its own browser cache URL.
await mkdir(destination, { recursive: true });
await Promise.all(
  ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"].map((file) =>
    copyFile(join(dirname(packagePath), "dist", file), join(destination, file))
  )
);
