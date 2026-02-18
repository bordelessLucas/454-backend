import { PrismaClient } from "@prisma/client";

export class SetorService {
  constructor(private prisma: PrismaClient) {}

  async create(data: { nome: string; descricao?: string }) {
    return this.prisma.setor.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.setor.findMany({
      orderBy: { nome: "asc" },
    });
  }

  async findById(id: number) {
    return this.prisma.setor.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: { nome?: string; descricao?: string }) {
    return this.prisma.setor.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.setor.delete({
      where: { id },
    });
  }
}
