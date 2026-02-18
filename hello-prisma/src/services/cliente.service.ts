import { PrismaClient } from "@prisma/client";
import type {
  CreateClienteDTO,
  UpdateClienteDTO,
  ClienteFilters,
} from "../types/dtos.js";

export class ClienteService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateClienteDTO) {
    return this.prisma.cliente.create({
      data,
      include: {
        ramoAtividade: true,
      },
    });
  }

  async findAll(filters?: ClienteFilters) {
    const where: Record<string, unknown> = {};

    if (filters?.nomeFantasia) {
      where.nomeFantasia = {
        contains: filters.nomeFantasia,
        mode: "insensitive",
      };
    }

    if (filters?.cnpj) {
      where.cnpj = { contains: filters.cnpj };
    }

    if (filters?.ramoAtividadeId) {
      where.ramoAtividadeId = filters.ramoAtividadeId;
    }

    return this.prisma.cliente.findMany({
      where,
      include: {
        ramoAtividade: true,
        contatos: true,
      },
      orderBy: { nomeFantasia: "asc" },
    });
  }

  async findById(id: number) {
    return this.prisma.cliente.findUnique({
      where: { id },
      include: {
        ramoAtividade: true,
        contatos: true,
        contratos: true,
      },
    });
  }

  async update(id: number, data: UpdateClienteDTO) {
    return this.prisma.cliente.update({
      where: { id },
      data,
      include: {
        ramoAtividade: true,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.cliente.delete({
      where: { id },
    });
  }

  async createContato(
    clienteId: number,
    data: {
      nome: string;
      cargo?: string;
      telefone?: string;
      email?: string;
      principal?: boolean;
    },
  ) {
    return this.prisma.clienteContato.create({
      data: {
        ...data,
        clienteId,
      },
    });
  }

  async updateContato(
    id: number,
    data: {
      nome?: string;
      cargo?: string;
      telefone?: string;
      email?: string;
      principal?: boolean;
    },
  ) {
    return this.prisma.clienteContato.update({
      where: { id },
      data,
    });
  }

  async deleteContato(id: number) {
    return this.prisma.clienteContato.delete({
      where: { id },
    });
  }
}
