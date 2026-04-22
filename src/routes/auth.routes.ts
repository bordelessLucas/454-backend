import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { ConfiguracaoService } from "../services/configuracao.service.js";
import { prisma } from "../lib/prisma.js";
import { horarioMiddleware } from "../middlewares/horario.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();
const configuracaoService = new ConfiguracaoService(prisma);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await configuracaoService.get();
      await horarioMiddleware(req, res, next, config);
    } catch {
      next();
    }
  },
  AuthController.login,
);

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));
router.post("/reset-password", AuthController.resetPassword);

export default router;
