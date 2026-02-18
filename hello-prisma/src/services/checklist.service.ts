import { PrismaClient } from "@prisma/client";
import type { CreateChecklistDTO, UpdateChecklistDTO } from "../types/dtos.js";

export class ChecklistService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateChecklistDTO) {
    return this.prisma.checklist.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.checklist.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
  }

  async findById(id: number) {
    return this.prisma.checklist.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateChecklistDTO) {
    return this.prisma.checklist.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.checklist.delete({
      where: { id },
    });
  }
}
