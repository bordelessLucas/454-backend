import type { Request, Response } from "express";
import { RamoAtividadeService } from "../services/ramo-atividade.service.js";
import { prisma } from "../lib/prisma.js";

const ramoService = new RamoAtividadeService(prisma);

export class RamoAtividadeController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const ramo = await ramoService.create(data);
      res.status(201).json(ramo);
    } catch (error) {
      res
        .status(400)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Erro ao criar ramo de atividade",
        });
    }
  }

  static async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const ramos = await ramoService.findAll();
      res.json(ramos);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar ramos de atividade" });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      const ramo = await ramoService.findById(id);

      if (!ramo) {
        res.status(404).json({ error: "Ramo de atividade não encontrado" });
        return;
      }

      res.json(ramo);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar ramo de atividade" });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      const data = req.body;
      const ramo = await ramoService.update(id, data);
      res.json(ramo);
    } catch (error) {
      res
        .status(400)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Erro ao atualizar ramo de atividade",
        });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      await ramoService.delete(id);
      res.status(204).send();
    } catch (error) {
      res
        .status(400)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Erro ao deletar ramo de atividade",
        });
    }
  }
}
