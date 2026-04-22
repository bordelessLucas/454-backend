import type { Request, Response } from "express";
import { SetorService } from "../services/setor.service.js";
import { prisma } from "../lib/prisma.js";

const setorService = new SetorService(prisma);

export class SetorController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const setor = await setorService.create(data);
      res.status(201).json(setor);
    } catch (error) {
      res
        .status(400)
        .json({
          error: error instanceof Error ? error.message : "Erro ao criar setor",
        });
    }
  }

  static async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const setores = await setorService.findAll();
      res.json(setores);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar setores" });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      const setor = await setorService.findById(id);

      if (!setor) {
        res.status(404).json({ error: "Setor não encontrado" });
        return;
      }

      res.json(setor);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar setor" });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      const data = req.body;
      const setor = await setorService.update(id, data);
      res.json(setor);
    } catch (error) {
      res
        .status(400)
        .json({
          error:
            error instanceof Error ? error.message : "Erro ao atualizar setor",
        });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      await setorService.delete(id);
      res.status(204).send();
    } catch (error) {
      res
        .status(400)
        .json({
          error:
            error instanceof Error ? error.message : "Erro ao deletar setor",
        });
    }
  }
}
