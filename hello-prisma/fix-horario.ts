import { prisma } from "./src/lib/prisma.js";

async function fixHorario() {
  try {
    // Buscar configuração atual
    const config = await prisma.configuracao.findFirst();

    console.log("Configuração atual:", config);

    // Atualizar para permitir acesso 24/7
    const dataInicio = new Date();
    dataInicio.setHours(0, 0, 0, 0); // 00:00

    const dataFim = new Date();
    dataFim.setHours(23, 59, 59, 999); // 23:59

    if (config) {
      const updated = await prisma.configuracao.update({
        where: { id: config.id },
        data: {
          dataInicio,
          dataFim,
        },
      });
      console.log("✅ Horário atualizado para 00:00 - 23:59 (24/7):", updated);
    } else {
      const created = await prisma.configuracao.create({
        data: {
          dataInicio,
          dataFim,
        },
      });
      console.log(
        "✅ Configuração criada com horário 00:00 - 23:59 (24/7):",
        created,
      );
    }
  } catch (error) {
    console.error("❌ Erro ao atualizar horário:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixHorario();
