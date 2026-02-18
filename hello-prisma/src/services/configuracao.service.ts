import { PrismaClient } from "@prisma/client";

export class ConfiguracaoService {
  constructor(private prisma: PrismaClient) {}

  async get() {
    return this.prisma.configuracao.findFirst();
  }

  async upsert(dataInicio: Date, dataFim: Date) {
    return this.prisma.configuracao.upsert({
      where: { id: 1 },
      create: { id: 1, dataInicio, dataFim },
      update: { dataInicio, dataFim },
    });
  }
}
