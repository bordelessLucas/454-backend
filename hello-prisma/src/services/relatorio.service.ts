import { PrismaClient, Prisma } from "@prisma/client";
import type {
  CreateRelatorioDTO,
  UpdateRelatorioDTO,
  RelatorioFilters,
} from "../types/dtos.js";

// Helper: Combina data e hora para criar um DateTime válido
function combinarDataHora(data: string, hora: string): Date {
  // data: "2026-02-18", hora: "09:00"
  // resultado: "2026-02-18T09:00:00"
  return new Date(`${data}T${hora}:00`);
}

function parseHorario(dataVisita: string, horario: string): Date {
  if (horario.includes("T")) {
    const dateTime = new Date(horario);
    if (Number.isNaN(dateTime.getTime())) {
      throw new Error("Horario invalido (ISO 8601)");
    }
    return dateTime;
  }

  const baseDate = dataVisita.split("T")[0];
  const dateTime = combinarDataHora(baseDate, horario);
  if (Number.isNaN(dateTime.getTime())) {
    throw new Error("Horario invalido (HH:mm)");
  }
  return dateTime;
}

const MODALIDADES_SERVICO = [
  "Sem contrato - remoto",
  "Sem contrato - local",
  "Contrato - local",
  "Contrato - remoto",
] as const;

function validarModalidadeServico(modalidade?: string): void {
  if (!modalidade) {
    return;
  }

  if (
    !MODALIDADES_SERVICO.includes(
      modalidade as (typeof MODALIDADES_SERVICO)[number],
    )
  ) {
    throw new Error("Modalidade de servico invalida");
  }
}

export class RelatorioService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateRelatorioDTO, criadoPorId: number) {
    return this.prisma.$transaction(async (tx) => {
      // ✅ construir objeto dinamicamente (sem undefined)
      validarModalidadeServico(data.modalidadeServico);

      const relatorioData: Prisma.RelatorioUncheckedCreateInput = {
        clienteId: data.clienteId,
        criadoPorId,
        dataVisita: new Date(data.dataVisita),
        modalidadeServico: data.modalidadeServico,
      };

      if (data.contatoId !== undefined) {
        relatorioData.contatoId = data.contatoId;
      }

      if (data.observacoes !== undefined) {
        relatorioData.observacoes = data.observacoes;
      }

      const relatorio = await tx.relatorio.create({
        data: relatorioData,
      });

      // técnicos
      if (data.tecnicos && data.tecnicos.length > 0) {
        await tx.relatorioTecnico.createMany({
          data: data.tecnicos.map(
            (nome): Prisma.RelatorioTecnicoCreateManyInput => ({
              relatorioId: relatorio.id,
              nome,
            }),
          ),
        });
      }

      // setores
      if (data.setores && data.setores.length > 0) {
        await tx.relatorioSetor.createMany({
          data: data.setores.map(
            (setor): Prisma.RelatorioSetorCreateManyInput => {
              const setorData: Prisma.RelatorioSetorCreateManyInput = {
                relatorioId: relatorio.id,
                setorId: setor.setorId,
              };

              if (setor.observacao !== undefined) {
                setorData.observacao = setor.observacao;
              }

              return setorData;
            },
          ),
        });
      }

      // horários
      if (data.horarios && data.horarios.length > 0) {
        await tx.relatorioHorario.createMany({
          data: data.horarios.map(
            (horario): Prisma.RelatorioHorarioCreateManyInput => ({
              relatorioId: relatorio.id,
              horaChegada: parseHorario(data.dataVisita, horario.horaChegada),
              horaSaida: parseHorario(data.dataVisita, horario.horaSaida),
            }),
          ),
        });
      }

      // checklists
      if (data.checklists && data.checklists.length > 0) {
        await tx.relatorioChecklist.createMany({
          data: data.checklists.map(
            (check): Prisma.RelatorioChecklistCreateManyInput => ({
              relatorioId: relatorio.id,
              checklistId: check.checklistId,
            }),
          ),
        });
      }

      return tx.relatorio.findUnique({
        where: { id: relatorio.id },
        include: {
          cliente: true,
          contato: true,
          criadoPor: {
            select: {
              id: true,
              nome: true,
              username: true,
            },
          },
          tecnicos: true,
          setores: {
            include: {
              setor: true,
            },
          },
          horarios: true,
          checklists: {
            include: {
              checklist: true,
            },
          },
        },
      });
    });
  }

  async findAll(filters?: RelatorioFilters) {
    const where: Prisma.RelatorioWhereInput = {};

    if (filters?.clienteId !== undefined) {
      where.clienteId = filters.clienteId;
    }

    if (filters?.criadoPorId !== undefined) {
      where.criadoPorId = filters.criadoPorId;
    }

    if (filters?.impresso !== undefined) {
      where.impresso = filters.impresso;
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.dataVisita = {};

      if (filters.dataInicio) {
        where.dataVisita.gte = new Date(filters.dataInicio);
      }

      if (filters.dataFim) {
        where.dataVisita.lte = new Date(filters.dataFim);
      }
    }

    return this.prisma.relatorio.findMany({
      where,
      include: {
        cliente: true,
        contato: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            username: true,
          },
        },
        tecnicos: true,
        setores: {
          include: {
            setor: true,
          },
        },
        horarios: true,
      },
      orderBy: {
        dataVisita: "desc",
      },
    });
  }

  async findById(id: number) {
    return this.prisma.relatorio.findUnique({
      where: { id },
      include: {
        cliente: true,
        contato: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            username: true,
          },
        },
        tecnicos: true,
        setores: {
          include: {
            setor: true,
          },
        },
        horarios: true,
        checklists: {
          include: {
            checklist: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateRelatorioDTO) {
    return this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.RelatorioUncheckedUpdateInput = {};

      if (data.clienteId !== undefined) {
        updateData.clienteId = data.clienteId;
      }

      if (data.contatoId !== undefined) {
        updateData.contatoId = data.contatoId;
      }

      if (data.dataVisita !== undefined) {
        updateData.dataVisita = new Date(data.dataVisita);
      }

      if (data.modalidadeServico !== undefined) {
        validarModalidadeServico(data.modalidadeServico);
        updateData.modalidadeServico = data.modalidadeServico;
      }

      if (data.observacoes !== undefined) {
        updateData.observacoes = data.observacoes;
      }

      if (data.impresso !== undefined) {
        updateData.impresso = data.impresso;
      }

      const updated = await tx.relatorio.update({
        where: { id },
        data: updateData,
      });

      // técnicos
      if (data.tecnicos !== undefined) {
        await tx.relatorioTecnico.deleteMany({
          where: { relatorioId: id },
        });

        if (data.tecnicos.length > 0) {
          await tx.relatorioTecnico.createMany({
            data: data.tecnicos.map(
              (nome): Prisma.RelatorioTecnicoCreateManyInput => ({
                relatorioId: id,
                nome,
              }),
            ),
          });
        }
      }

      // setores
      if (data.setores !== undefined) {
        await tx.relatorioSetor.deleteMany({
          where: { relatorioId: id },
        });

        if (data.setores.length > 0) {
          await tx.relatorioSetor.createMany({
            data: data.setores.map(
              (setor): Prisma.RelatorioSetorCreateManyInput => {
                const setorData: Prisma.RelatorioSetorCreateManyInput = {
                  relatorioId: id,
                  setorId: setor.setorId,
                };

                if (setor.observacao !== undefined) {
                  setorData.observacao = setor.observacao;
                }

                return setorData;
              },
            ),
          });
        }
      }

      // horários
      if (data.horarios !== undefined) {
        await tx.relatorioHorario.deleteMany({
          where: { relatorioId: id },
        });

        if (data.horarios.length > 0) {
          await tx.relatorioHorario.createMany({
            data: data.horarios.map(
              (horario): Prisma.RelatorioHorarioCreateManyInput => ({
                relatorioId: id,
                horaChegada: parseHorario(
                  updated.dataVisita.toISOString(),
                  horario.horaChegada,
                ),
                horaSaida: parseHorario(
                  updated.dataVisita.toISOString(),
                  horario.horaSaida,
                ),
              }),
            ),
          });
        }
      }

      // checklists
      if (data.checklists !== undefined) {
        await tx.relatorioChecklist.deleteMany({
          where: { relatorioId: id },
        });

        if (data.checklists.length > 0) {
          await tx.relatorioChecklist.createMany({
            data: data.checklists.map(
              (check): Prisma.RelatorioChecklistCreateManyInput => ({
                relatorioId: id,
                checklistId: check.checklistId,
              }),
            ),
          });
        }
      }

      return tx.relatorio.findUnique({
        where: { id },
        include: {
          cliente: true,
          contato: true,
          criadoPor: {
            select: {
              id: true,
              nome: true,
              username: true,
            },
          },
          tecnicos: true,
          setores: {
            include: {
              setor: true,
            },
          },
          horarios: true,
          checklists: {
            include: {
              checklist: true,
            },
          },
        },
      });
    });
  }

  async delete(id: number) {
    return this.prisma.relatorio.delete({
      where: { id },
    });
  }
}
