import { PrismaClient } from "@prisma/client";
import type {
  CreateClienteDTO,
  UpdateClienteDTO,
  ClienteFilters,
} from "../types/dtos.js";

export class ClienteService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateClienteDTO) {
    const { contato, contrato, ...clienteData } = data;

    return this.prisma.$transaction(async (tx) => {
      // Criar cliente
      const cliente = await tx.cliente.create({
        data: clienteData,
        include: {
          ramoAtividade: true,
        },
      });

      // Criar contato associado
      await tx.clienteContato.create({
        data: {
          clienteId: cliente.id,
          ...contato,
        },
      });

      // Criar contrato associado
      await tx.contrato.create({
        data: {
          clienteId: cliente.id,
          ...contrato,
        },
      });

      // Retornar cliente com as relações
      return tx.cliente.findUnique({
        where: { id: cliente.id },
        include: {
          ramoAtividade: true,
          contatos: true,
          contratos: true,
        },
      });
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
        contratos: true,
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
    const { contato, contrato, ...clienteData } = data;

    return this.prisma.$transaction(async (tx) => {
      // Atualizar cliente
      const cliente = await tx.cliente.update({
        where: { id },
        data: clienteData,
      });

      // Atualizar contato se fornecido
      if (contato) {
        const contatoExistente = await tx.clienteContato.findFirst({
          where: { clienteId: id },
        });

        if (contatoExistente) {
          await tx.clienteContato.update({
            where: { id: contatoExistente.id },
            data: contato,
          });
        }
      }

      // Atualizar contrato se fornecido
      if (contrato) {
        const contratoExistente = await tx.contrato.findFirst({
          where: { clienteId: id },
        });

        if (contratoExistente) {
          await tx.contrato.update({
            where: { id: contratoExistente.id },
            data: contrato,
          });
        }
      }

      // Retornar cliente com as relações
      return tx.cliente.findUnique({
        where: { id },
        include: {
          ramoAtividade: true,
          contatos: true,
          contratos: true,
        },
      });
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
