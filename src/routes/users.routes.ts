import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// ✅ Rota acessível por qualquer role autenticado
router.use(authMiddleware);
router.get("/tecnico", AuthController.getUsersTecnico);

// 🔒 Rotas exclusivas para ADMIN
router.use(roleMiddleware("ADMIN"));
router.post("/", AuthController.createUser);
router.get("/", AuthController.getUsers);
router.get("/:id", AuthController.getUserById);
router.put("/:id", AuthController.updateUser);
router.put("/:id/password", AuthController.changePassword);
router.delete("/:id", AuthController.deleteUser);

export default router;
