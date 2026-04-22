import type { NextFunction, Request, Response } from "express";
import { ChecklistService } from "../services/checklist.service.js";
import type {
  CreateChecklistDTO,
  ReorderChecklistDTO,
  UpdateChecklistDTO,
} from "../types/dtos.js";
import { prisma } from "../lib/prisma.js";

const checklistService = new ChecklistService(prisma);

export class ChecklistController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateChecklistDTO;

      if (!data.nome) {
        res.status(400).json({ error: "nome é obrigatório" });
        return;
      }

      const checklist = await checklistService.create(data);
      res.status(201).json(checklist);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro ao criar checklist",
      });
    }
  }

  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const checklists = await checklistService.findAll();
      res.json(checklists);
    } catch (error) {
      next(error);
    }
  }

  static async findById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      const checklist = await checklistService.findById(id);

      if (!checklist) {
        res.status(404).json({ error: "Checklist não encontrado" });
        return;
      }

      res.json(checklist);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      const data = req.body as UpdateChecklistDTO;
      const checklist = await checklistService.update(id, data);
      res.json(checklist);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar checklist",
      });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      await checklistService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro ao deletar checklist",
      });
    }
  }

  static async reorder(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as ReorderChecklistDTO;
      const items = payload.items;

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          error:
            "Body inválido. Envie { items: [{ id: number, indice: number }] }",
        });
        return;
      }

      const hasInvalid = items.some(
        (item) =>
          typeof item.id !== "number" ||
          !Number.isInteger(item.id) ||
          typeof item.indice !== "number" ||
          !Number.isInteger(item.indice) ||
          item.indice < 0,
      );

      if (hasInvalid) {
        res.status(400).json({
          error: "Cada item deve conter id e indice inteiros válidos",
        });
        return;
      }

      const checklists = await checklistService.reorder(items);
      res.json(checklists);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Erro ao reordenar checklists",
      });
    }
  }
}
