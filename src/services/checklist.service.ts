import { Prisma, PrismaClient } from "@prisma/client";
import type {
  ChecklistItemPayloadDTO,
  CreateChecklistDTO,
  ReorderChecklistItemDTO,
  UpdateChecklistDTO,
} from "../types/dtos.js";

function parseChecklistItens(itens?: ChecklistItemPayloadDTO[]) {
  if (itens === undefined) {
    return undefined;
  }

  if (!Array.isArray(itens)) {
    throw new Error("Campo itens inválido: deve ser uma lista");
  }

  const parsed = itens.map((item, index) => {
    if (typeof item.texto !== "string" || item.texto.trim() === "") {
      throw new Error(`Item ${index + 1}: texto é obrigatório`);
    }

    if (!Number.isInteger(item.ordem) || item.ordem < 0) {
      throw new Error(`Item ${index + 1}: ordem deve ser inteiro >= 0`);
    }

    return {
      texto: item.texto.trim(),
      ordem: item.ordem,
    };
  });

  const ordens = parsed.map((item) => item.ordem);
  const uniqueOrdens = new Set(ordens);
  if (uniqueOrdens.size !== ordens.length) {
    throw new Error("Itens com ordem duplicada não são permitidos");
  }

  return parsed;
}

export class ChecklistService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateChecklistDTO) {
    return this.prisma.$transaction(async (tx) => {
      let indice = data.indice;
      const itens = parseChecklistItens(data.itens);

      if (indice === undefined) {
        const ultimo = await tx.checklist.findFirst({
          orderBy: { indice: "desc" },
          select: { indice: true },
        });
        indice = (ultimo?.indice ?? -1) + 1;
      }

      return tx.checklist.create({
        data: {
          nome: data.nome,
          indice,
          ...(data.descricao !== undefined ? { descricao: data.descricao } : {}),
          ...(itens !== undefined
            ? {
                itens: {
                  create: itens.map((item) => ({
                    texto: item.texto,
                    ordem: item.ordem,
                  })),
                },
              }
            : {}),
        },
        include: {
          itens: {
            orderBy: { ordem: "asc" },
          },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.checklist.findMany({
      where: { ativo: true },
      include: {
        itens: {
          orderBy: { ordem: "asc" },
        },
      },
      orderBy: [{ indice: "asc" }, { nome: "asc" }],
    });
  }

  async findById(id: number) {
    return this.prisma.checklist.findUnique({
      where: { id },
      include: {
        itens: {
          orderBy: { ordem: "asc" },
        },
      },
    });
  }

  async update(id: number, data: UpdateChecklistDTO) {
    const itens = parseChecklistItens(data.itens);
    const updateData: Prisma.ChecklistUpdateInput = {};

    if (data.nome !== undefined) {
      updateData.nome = data.nome;
    }

    if (data.descricao !== undefined) {
      updateData.descricao = data.descricao;
    }

    if (data.indice !== undefined) {
      updateData.indice = data.indice;
    }

    if (data.ativo !== undefined) {
      updateData.ativo = data.ativo;
    }

    if (Object.keys(updateData).length === 0 && itens === undefined) {
      throw new Error(
        "Nenhum campo válido para atualização. Campos aceitos: nome, descricao, indice, ativo, itens.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const checklist = await tx.checklist.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!checklist) {
        throw new Error("Checklist não encontrado");
      }

      if (Object.keys(updateData).length > 0) {
        await tx.checklist.update({
          where: { id },
          data: updateData,
        });
      }

      if (itens !== undefined) {
        await tx.checklistItem.deleteMany({
          where: { checklistId: id },
        });

        if (itens.length > 0) {
          await tx.checklistItem.createMany({
            data: itens.map((item) => ({
              checklistId: id,
              texto: item.texto,
              ordem: item.ordem,
            })),
          });
        }
      }

      return tx.checklist.findUnique({
        where: { id },
        include: {
          itens: {
            orderBy: { ordem: "asc" },
          },
        },
      });
    });
  }

  async delete(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const checklist = await tx.checklist.findUnique({
        where: { id },
        select: { id: true, ativo: true },
      });

      if (!checklist) {
        throw new Error("Checklist não encontrado");
      }

      const possuiVinculoEmRelatorio = await tx.relatorioChecklist.count({
        where: { checklistId: id },
      });

      if (possuiVinculoEmRelatorio > 0) {
        // Evita violação de FK (RESTRICT) e preserva histórico dos relatórios.
        return tx.checklist.update({
          where: { id },
          data: { ativo: false },
        });
      }

      return tx.checklist.delete({
        where: { id },
      });
    });
  }

  async reorder(items: ReorderChecklistItemDTO[]) {
    if (items.length === 0) {
      throw new Error("Informe ao menos um item para reordenação");
    }

    const ids = items.map((item) => item.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      throw new Error("Lista de reordenação contém IDs duplicados");
    }

    const indices = items.map((item) => item.indice);
    const uniqueIndices = new Set(indices);
    if (uniqueIndices.size !== indices.length) {
      throw new Error("Lista de reordenação contém índices duplicados");
    }

    await this.prisma.$transaction(async (tx) => {
      const existentes = await tx.checklist.count({
        where: { id: { in: ids }, ativo: true },
      });

      if (existentes !== items.length) {
        throw new Error("Um ou mais itens não existem ou estão inativos");
      }

      for (const item of items) {
        await tx.checklist.update({
          where: { id: item.id },
          data: { indice: item.indice },
        });
      }
    });

    return this.findAll();
  }
}
