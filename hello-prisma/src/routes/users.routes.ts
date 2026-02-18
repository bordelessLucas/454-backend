import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.post("/", AuthController.createUser);
router.get("/", AuthController.getUsers);
router.get("/:id", AuthController.getUserById);
router.put("/:id", AuthController.updateUser);
router.delete("/:id", AuthController.deleteUser);

export default router;
