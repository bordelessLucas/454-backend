import type { Request, Response } from "express";
import { ConfiguracaoService } from "../services/configuracao.service.js";
import { prisma } from "../lib/prisma.js";

const configuracaoService = new ConfiguracaoService(prisma);

export class ConfiguracaoController {
  static async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const config = await configuracaoService.get();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  }

  static async upsert(req: Request, res: Response): Promise<void> {
    try {
      const { dataInicio, dataFim } = req.body as {
        dataInicio?: string;
        dataFim?: string;
      };

      if (!dataInicio || !dataFim) {
        res
          .status(400)
          .json({ error: "dataInicio e dataFim são obrigatórios" });
        return;
      }

      const config = await configuracaoService.upsert(
        new Date(dataInicio),
        new Date(dataFim),
      );
      res.json(config);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Erro ao salvar configuração",
      });
    }
  }
}
