import { Router } from "express";
import { SetorController } from "../controllers/setor.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware);

// GETs liberados para qualquer role autenticado
router.get("/", SetorController.findAll);
router.get("/:id", SetorController.findById);

router.use(roleMiddleware("ADMIN"));

router.post("/", SetorController.create);
router.put("/:id", SetorController.update);
router.delete("/:id", SetorController.delete);

export default router;
