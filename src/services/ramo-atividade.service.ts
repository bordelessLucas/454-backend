import { PrismaClient } from "@prisma/client";

export class RamoAtividadeService {
  constructor(private prisma: PrismaClient) {}

  async create(data: { nome: string }) {
    return this.prisma.ramoAtividade.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.ramoAtividade.findMany({
      orderBy: { nome: "asc" },
    });
  }

  async findById(id: number) {
    return this.prisma.ramoAtividade.findUnique({
      where: { id },
      include: {
        clientes: true,
      },
    });
  }

  async update(id: number, data: { nome?: string }) {
    return this.prisma.ramoAtividade.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.ramoAtividade.delete({
      where: { id },
    });
  }
}
