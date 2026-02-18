import { Router } from "express";
import { SetorController } from "../controllers/setor.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.post("/", SetorController.create);
router.get("/", SetorController.findAll);
router.get("/:id", SetorController.findById);
router.put("/:id", SetorController.update);
router.delete("/:id", SetorController.delete);

export default router;
