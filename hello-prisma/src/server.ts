import "dotenv/config";
import app from "./app.js";

const port = Number(process.env["PORT"] ?? 3000);

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED_REJECTION]", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT_EXCEPTION]", error);
});

app.listen(port, () => {
  console.log(`API on http://localhost:${port}`);
});
