import express from "express";
import usersRouter from "./routes/users.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/users", usersRouter);

export default app;
