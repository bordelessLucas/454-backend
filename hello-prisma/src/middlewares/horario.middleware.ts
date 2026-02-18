import type { Request, Response, NextFunction } from "express";

export const horarioMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
  config: { dataInicio: Date; dataFim: Date } | null,
): Promise<void> => {
  if (!config) {
    next();
    return;
  }

  const now = new Date();
  const inicio = new Date(now);
  inicio.setHours(
    config.dataInicio.getHours(),
    config.dataInicio.getMinutes(),
    0,
    0,
  );
  const fim = new Date(now);
  fim.setHours(config.dataFim.getHours(), config.dataFim.getMinutes(), 0, 0);

  if (now < inicio || now > fim) {
    res.status(403).json({
      error: "Login permitido apenas dentro do horario configurado",
    });
    return;
  }

  next();
};
