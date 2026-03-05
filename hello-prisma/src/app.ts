import express from "express";
import cors from "cors";
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

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/clientes", clientesRouter);
app.use("/relatorios", relatoriosRouter);
app.use("/checklists", checklistsRouter);
app.use("/setores", setoresRouter);
app.use("/ramos", ramosRouter);
app.use("/configuracoes", configuracoesRouter);

export default app;
