import { copyFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src", "docs", "openapi.yaml");
const dest = join(root, "dist", "docs", "openapi.yaml");

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log("[copy-openapi] Copiado para dist/docs/openapi.yaml");
