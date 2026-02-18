import { Router } from "express";
import { ConfiguracaoController } from "../controllers/configuracao.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", ConfiguracaoController.findAll);

router.use(roleMiddleware("ADMIN"));
router.put("/", ConfiguracaoController.upsert);

export default router;
