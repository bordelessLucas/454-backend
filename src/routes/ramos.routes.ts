import { Router } from "express";
import { RamoAtividadeController } from "../controllers/ramo-atividade.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware);

// GETs liberados para qualquer role autenticado
router.get("/", RamoAtividadeController.findAll);
router.get("/:id", RamoAtividadeController.findById);

router.use(roleMiddleware("ADMIN"));

router.post("/", RamoAtividadeController.create);
router.put("/:id", RamoAtividadeController.update);
router.delete("/:id", RamoAtividadeController.delete);

export default router;
