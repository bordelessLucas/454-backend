import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL nao configurada");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      nome: "Administrador",
      email: "admin@example.com",
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", admin);

  // Criar usuário tecnico
  const hashedTecPassword = await bcrypt.hash("tecnico123", 10);
  const tecnico = await prisma.user.upsert({
    where: { username: "tecnico" },
    update: {},
    create: {
      username: "tecnico",
      password: hashedTecPassword,
      nome: "Tecnico",
      email: "tecnico@example.com",
      role: "TECNICO",
    },
  });

  console.log("Tecnico user created:", tecnico);

  // Criar configurações iniciais
  const inicio = new Date();
  inicio.setHours(8, 0, 0, 0);
  const fim = new Date();
  fim.setHours(18, 0, 0, 0);

  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: { dataInicio: inicio, dataFim: fim },
    create: { id: 1, dataInicio: inicio, dataFim: fim },
  });

  console.log("Configurações iniciais criadas");

  // Criar alguns ramos de atividade exemplo
  await prisma.ramoAtividade.upsert({
    where: { nome: "Tecnologia" },
    update: {},
    create: { nome: "Tecnologia" },
  });

  await prisma.ramoAtividade.upsert({
    where: { nome: "Serviços" },
    update: {},
    create: { nome: "Serviços" },
  });

  await prisma.ramoAtividade.upsert({
    where: { nome: "Indústria" },
    update: {},
    create: { nome: "Indústria" },
  });

  console.log("Ramos de atividade criados");

  // Criar alguns setores exemplo
  await prisma.setor.upsert({
    where: { nome: "TI" },
    update: {},
    create: { nome: "TI", descricao: "Tecnologia da Informação" },
  });

  await prisma.setor.upsert({
    where: { nome: "Administrativo" },
    update: {},
    create: { nome: "Administrativo", descricao: "Setor Administrativo" },
  });

  await prisma.setor.upsert({
    where: { nome: "Operacional" },
    update: {},
    create: { nome: "Operacional", descricao: "Setor Operacional" },
  });

  console.log("Setores criados");

  console.log("Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
