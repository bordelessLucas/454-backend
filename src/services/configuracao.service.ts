import { Prisma, PrismaClient } from "@prisma/client";

export class ConfiguracaoService {
  constructor(private prisma: PrismaClient) {}

  async get() {
    try {
      return await this.prisma.configuracao.findFirst();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2021"
      ) {
        return null;
      }

      throw error;
    }
  }

  async upsert(dataInicio: Date, dataFim: Date) {
    return this.prisma.configuracao.upsert({
      where: { id: 1 },
      create: { id: 1, dataInicio, dataFim },
      update: { dataInicio, dataFim },
    });
  }
}
