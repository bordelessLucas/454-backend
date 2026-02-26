import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { prisma } from "../lib/prisma.js";
import type { LoginDTO, CreateUserDTO, UpdateUserDTO } from "../types/dtos.js";

const authService = new AuthService(prisma);

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginDTO = req.body;
      const result = await authService.login(data);
      res.json(result);
    } catch (error) {
      res.status(401).json({
        error: error instanceof Error ? error.message : "Erro ao fazer login",
      });
    }
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateUserDTO = req.body;
      const user = await authService.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Erro ao criar usuário",
      });
    }
  }

  static async getUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await authService.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  }

  static async getUsersTecnico(_req: Request, res: Response): Promise<void> {
    try {
      const users = await authService.getUsersTecnico();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar técnicos" });
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      const user = await authService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      const data: UpdateUserDTO = req.body;
      const user = await authService.updateUser(id, data);
      res.json(user);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro ao atualizar usuário",
      });
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      await authService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro ao deletar usuário",
      });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { username, newPassword } = req.body;

      if (!username || !newPassword) {
        res.status(400).json({
          error: "Username e nova senha são obrigatórios",
        });
        return;
      }

      const user = await authService.resetPassword(username, newPassword);
      res.json({
        message: "Senha resetada com sucesso",
        user,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Erro ao resetar senha",
      });
    }
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params["id"] ?? "0");
      const { newPassword } = req.body;

      if (!newPassword) {
        res.status(400).json({
          error: "Nova senha é obrigatória",
        });
        return;
      }

      const user = await authService.changePassword(id, newPassword);
      res.json({
        message: "Senha alterada com sucesso",
        user,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Erro ao alterar senha",
      });
    }
  }
}
