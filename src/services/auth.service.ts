import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { LoginDTO, CreateUserDTO, UpdateUserDTO } from "../types/dtos.js";

const JWT_SECRET =
  process.env["JWT_SECRET"] ?? "your-secret-key-change-in-production";
const SALT_ROUNDS = 10;

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  private async resolveUnidadeIdFromCliente(
    clienteId: number | undefined,
  ): Promise<number | null> {
    if (clienteId === undefined) {
      return null;
    }

    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { unidadeId: true },
    });

    if (!cliente) {
      throw new Error("Cliente não encontrado");
    }

    return cliente.unidadeId;
  }

  async login(data: LoginDTO): Promise<{
    token: string;
    user: {
      id: number;
      username: string;
      nome: string;
      role: string;
      clienteId: number | null;
      unidadeId: number | null;
    };
  }> {
    const email =
      (typeof data.email === "string" ? data.email.trim() : "") ||
      (typeof data.username === "string" ? data.username.trim() : "");

    if (!email) {
      throw new Error("Email não fornecido");
    }

    if (data.password == null || String(data.password).trim() === "") {
      throw new Error("Senha não fornecida");
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: email }],
      },
    });

    if (!user || !user.ativo) {
      throw new Error("Credenciais inválidas");
    }

    const valid = await bcrypt.compare(String(data.password), user.password);

    if (!valid) {
      throw new Error("Credenciais inválidas");
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        clienteId: user.clienteId,
        unidadeId: user.unidadeId,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        role: user.role,
        clienteId: user.clienteId,
        unidadeId: user.unidadeId,
      },
    };
  }

  async createUser(data: CreateUserDTO) {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const userData: Prisma.UserUncheckedCreateInput = {
      username: data.username,
      password: hashedPassword,
      nome: data.nome,
      email: data.email,
      role: data.role,
    };

    if (data.clienteId !== undefined) {
      userData.clienteId = data.clienteId;
    }

    userData.unidadeId = await this.resolveUnidadeIdFromCliente(data.clienteId);

    return this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        role: true,
        clienteId: true,
        unidadeId: true,
        ativo: true,
        createdAt: true,
      },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        role: true,
        clienteId: true,
        unidadeId: true,
        ativo: true,
        createdAt: true,
      },
    });
  }
  async getUsersTecnico() {
    return this.prisma.user.findMany({
      where: { role: "TECNICO" },
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        role: true,
        clienteId: true,
        ativo: true,
        createdAt: true,
      },
    });
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        role: true,
        clienteId: true,
        unidadeId: true,
        ativo: true,
        createdAt: true,
      },
    });
  }

  async updateUser(id: number, data: UpdateUserDTO) {
    const updateData: Prisma.UserUncheckedUpdateInput = { ...data };

    if (data.clienteId !== undefined) {
      updateData.unidadeId = await this.resolveUnidadeIdFromCliente(data.clienteId);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        role: true,
        clienteId: true,
        unidadeId: true,
        ativo: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async resetPassword(username: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    return this.prisma.user.update({
      where: { username },
      data: { password: hashedPassword },
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        role: true,
        clienteId: true,
        unidadeId: true,
        ativo: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(id: number, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        role: true,
        clienteId: true,
        unidadeId: true,
        ativo: true,
        updatedAt: true,
      },
    });
  }
}
