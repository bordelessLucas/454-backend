import { Router } from "express";
import { RelatorioController } from "../controllers/relatorio.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", RelatorioController.create);
router.get("/", RelatorioController.findAll);
router.get("/:id/pdf-layout", RelatorioController.getPdfLayout);
router.get("/:id/pdf", RelatorioController.getPdfLayout);
router.get("/:id", RelatorioController.findById);
router.put("/:id", RelatorioController.update);
router.delete("/:id", RelatorioController.delete);

export default router;
