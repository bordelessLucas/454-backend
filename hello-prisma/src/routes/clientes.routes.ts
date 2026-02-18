import { Router } from "express";
import { ClienteController } from "../controllers/cliente.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", ClienteController.create);
router.get("/", ClienteController.findAll);
router.get("/:id", ClienteController.findById);
router.put("/:id", ClienteController.update);
router.delete("/:id", ClienteController.delete);

router.post("/:id/contatos", ClienteController.createContato);
router.put("/:id/contatos/:contatoId", ClienteController.updateContato);
router.delete("/:id/contatos/:contatoId", ClienteController.deleteContato);

export default router;
