import type { Response } from "express";
import { RelatorioService } from "../services/relatorio.service.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateRelatorioDTO,
  UpdateRelatorioDTO,
  RelatorioFilters,
} from "../types/dtos.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

const relatorioService = new RelatorioService(prisma);

export class RelatorioController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scopedUnidadeId = req.user?.unidadeId;
      if (scopedUnidadeId == null) {
        res.status(403).json({ error: "Usuário sem unidade vinculada" });
        return;
      }

      const data: CreateRelatorioDTO = req.body;
      const criadoPorId = req.user?.id ?? 0;
      const relatorio = await relatorioService.create(
        data,
        criadoPorId,
        scopedUnidadeId,
      );
      res.status(201).json(relatorio);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro ao criar relatório",
      });
    }
  }

  static async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scopedUnidadeId = req.user?.unidadeId;
      if (scopedUnidadeId == null) {
        res.status(403).json({ error: "Usuário sem unidade vinculada" });
        return;
      }

      const filters: RelatorioFilters = {};

      const clienteId = req.query["clienteId"];
      if (typeof clienteId === "string" && !isNaN(Number(clienteId))) {
        filters.clienteId = Number(clienteId);
      }

      const criadoPorId = req.query["criadoPorId"];
      if (typeof criadoPorId === "string" && !isNaN(Number(criadoPorId))) {
        filters.criadoPorId = Number(criadoPorId);
      }

      const dataInicio = req.query["dataInicio"];
      if (typeof dataInicio === "string" && dataInicio.trim() !== "") {
        filters.dataInicio = dataInicio;
      }

      const dataFim = req.query["dataFim"];
      if (typeof dataFim === "string" && dataFim.trim() !== "") {
        filters.dataFim = dataFim;
      }

      const impresso = req.query["impresso"];
      if (impresso === "true") {
        filters.impresso = true;
      } else if (impresso === "false") {
        filters.impresso = false;
      }

      const relatorios = await relatorioService.findAll(filters, scopedUnidadeId);

      res.json(relatorios);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar relatórios" });
    }
  }

  static async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scopedUnidadeId = req.user?.unidadeId;
      if (scopedUnidadeId == null) {
        res.status(403).json({ error: "Usuário sem unidade vinculada" });
        return;
      }

      const id = parseInt(req.params["id"] ?? "0");
      const relatorio = await relatorioService.findById(id, scopedUnidadeId);

      if (!relatorio) {
        res.status(404).json({ error: "Relatório não encontrado" });
        return;
      }

      res.json(relatorio);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar relatório" });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scopedUnidadeId = req.user?.unidadeId;
      if (scopedUnidadeId == null) {
        res.status(403).json({ error: "Usuário sem unidade vinculada" });
        return;
      }

      const id = parseInt(req.params["id"] ?? "0");
      const data: UpdateRelatorioDTO = req.body;
      const relatorio = await relatorioService.update(id, data, scopedUnidadeId);
      res.json(relatorio);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar relatório",
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scopedUnidadeId = req.user?.unidadeId;
      if (scopedUnidadeId == null) {
        res.status(403).json({ error: "Usuário sem unidade vinculada" });
        return;
      }

      const id = parseInt(req.params["id"] ?? "0");
      await relatorioService.delete(id, scopedUnidadeId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro ao deletar relatório",
      });
    }
  }
}
