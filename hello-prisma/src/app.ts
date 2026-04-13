import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { loadOpenApiSpec } from "./docs/loadOpenApi.js";
import authRouter from "./routes/auth.routes.js";
import usersRouter from "./routes/users.routes.js";
import clientesRouter from "./routes/clientes.routes.js";
import relatoriosRouter from "./routes/relatorios.routes.js";
import checklistsRouter from "./routes/checklists.routes.js";
import setoresRouter from "./routes/setores.routes.js";
import ramosRouter from "./routes/ramos.routes.js";
import configuracoesRouter from "./routes/configuracoes.routes.js";

const app = express();

const corsOrigin = (
  process.env["CORS_ORIGIN"] ?? "http://localhost:5173"
).replace(/\/$/, "");

console.log(`[CORS] Configurado para: ${corsOrigin}`);
console.log(`[CORS] NODE_ENV: ${process.env["NODE_ENV"] ?? "not-set"}`);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

const openApiDocument = loadOpenApiSpec();

app.get("/openapi.json", (_req, res) => {
	res.setHeader("Content-Type", "application/json");
	res.json(openApiDocument);
});

app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(openApiDocument, {
		explorer: true,
		customCss: ".swagger-ui .topbar { display: none }",
	}),
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/clientes", clientesRouter);
app.use("/relatorios", relatoriosRouter);
app.use("/checklists", checklistsRouter);
app.use("/setores", setoresRouter);
app.use("/ramos", ramosRouter);
app.use("/configuracoes", configuracoesRouter);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : "Erro interno do servidor";
  console.error("[ERROR]", message);
  res.status(500).json({ error: message });
});

export default app;
