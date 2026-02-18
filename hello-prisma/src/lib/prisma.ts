import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (two levels up from src/lib/)
config({ path: resolve(__dirname, "../../.env") });

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
	throw new Error("DATABASE_URL nao configurada");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

export { prisma };
