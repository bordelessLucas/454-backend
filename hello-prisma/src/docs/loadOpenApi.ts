import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { parse } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadOpenApiSpec(): Record<string, unknown> {
	const path = join(__dirname, "openapi.yaml");
	const raw = readFileSync(path, "utf8");
	return parse(raw) as Record<string, unknown>;
}
