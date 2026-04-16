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

  const [baseDate] = dataVisita.split("T");
  if (!baseDate) {
    throw new Error("Data da visita invalida");
  }
  const dateTime = combinarDataHora(baseDate, horario);
  if (Number.isNaN(dateTime.getTime())) {
    throw new Error("Horario invalido (HH:mm)");
  }
  return dateTime;
}

function parseDateFilter(dateValue: string, endOfDay = false): Date {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Data inválida para filtro: ${dateValue}`);
  }

  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }

  return parsed;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const MODALIDADES_SERVICO = [
  "Sem contrato - remoto",
  "Sem contrato - local",
  "Contrato - local",
  "Contrato - remoto",
] as const;
type ModalidadeServico = (typeof MODALIDADES_SERVICO)[number];

type CreateRelatorioInput = CreateRelatorioDTO & { modalidade?: string };
type UpdateRelatorioInput = UpdateRelatorioDTO & { modalidade?: string };

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

function resolverModalidadeServico(data: {
  modalidadeServico?: string;
  modalidade?: string;
}): ModalidadeServico | undefined {
  if (
    data.modalidade !== undefined &&
    data.modalidadeServico !== undefined &&
    data.modalidade !== data.modalidadeServico
  ) {
    throw new Error("Campos modalidade e modalidadeServico divergentes");
  }

  const modalidade = data.modalidade ?? data.modalidadeServico;
  validarModalidadeServico(modalidade);

  return modalidade as ModalidadeServico | undefined;
}

function validarModalidadePorContrato(
  modalidade: ModalidadeServico,
  possuiContratoAtivo: boolean,
): void {
  if (modalidade.startsWith("Contrato -") && !possuiContratoAtivo) {
    throw new Error(
      "Modalidade inválida: cliente sem contrato ativo na data da visita",
    );
  }

  if (modalidade.startsWith("Sem contrato -") && possuiContratoAtivo) {
    throw new Error(
      "Modalidade inválida: cliente possui contrato ativo na data da visita",
    );
  }
}

type RelatorioPdfData = Prisma.RelatorioGetPayload<{
  include: {
    cliente: true;
    contato: true;
    criadoPor: {
      select: {
        id: true;
        nome: true;
        username: true;
      };
    };
    tecnicos: true;
    setores: {
      include: {
        setor: true;
      };
    };
    horarios: true;
    checklists: {
      include: {
        checklist: true;
      };
    };
  };
}>;

export class RelatorioService {
  constructor(private prisma: PrismaClient) {}

  async create(
    data: CreateRelatorioInput,
    criadoPorId: number,
    scopedUnidadeId: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const modalidadeServico = resolverModalidadeServico(data);
      if (!modalidadeServico) {
        throw new Error("Campo modalidade é obrigatório");
      }
      const dataVisita = new Date(data.dataVisita);
      if (Number.isNaN(dataVisita.getTime())) {
        throw new Error("Data da visita inválida");
      }

      const cliente = await tx.cliente.findFirst({
        where: { id: data.clienteId, unidadeId: scopedUnidadeId },
        select: { id: true },
      });

      if (!cliente) {
        throw new Error("Cliente não pertence à sua unidade");
      }

      const possuiContratoAtivo = await tx.contrato.findFirst({
        where: {
          clienteId: data.clienteId,
          ativo: true,
          dataInicio: { lte: dataVisita },
          OR: [{ dataFim: null }, { dataFim: { gte: dataVisita } }],
        },
        select: { id: true },
      });
      validarModalidadePorContrato(modalidadeServico, Boolean(possuiContratoAtivo));

      const relatorioData: Prisma.RelatorioUncheckedCreateInput = {
        clienteId: data.clienteId,
        criadoPorId,
        dataVisita,
        modalidadeServico,
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
        const setoresCriados = await tx.relatorioSetor.createMany({
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
        if (setoresCriados.count !== data.setores.length) {
          throw new Error("Falha ao salvar todos os vínculos de setores");
        }
      }

      // horários
      if (data.horarios && data.horarios.length > 0) {
        const horariosCriados = await tx.relatorioHorario.createMany({
          data: data.horarios.map(
            (horario): Prisma.RelatorioHorarioCreateManyInput => ({
              relatorioId: relatorio.id,
              horaChegada: parseHorario(data.dataVisita, horario.horaChegada),
              horaSaida: parseHorario(data.dataVisita, horario.horaSaida),
            }),
          ),
        });
        if (horariosCriados.count !== data.horarios.length) {
          throw new Error("Falha ao salvar todos os vínculos de horários");
        }
      }

      // checklists
      if (data.checklists && data.checklists.length > 0) {
        const checklistsCriados = await tx.relatorioChecklist.createMany({
          data: data.checklists.map(
            (check): Prisma.RelatorioChecklistCreateManyInput => ({
              relatorioId: relatorio.id,
              checklistId: check.checklistId,
            }),
          ),
        });
        if (checklistsCriados.count !== data.checklists.length) {
          throw new Error("Falha ao salvar todos os vínculos de checklists");
        }
      }

      const relatorioCompleto = await tx.relatorio.findUnique({
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
      if (!relatorioCompleto) {
        throw new Error("Falha ao carregar relatório após criação");
      }
      return relatorioCompleto;
    });
  }

  async findAll(filters: RelatorioFilters | undefined, scopedUnidadeId: number) {
    const where: Prisma.RelatorioWhereInput = {
      cliente: { unidadeId: scopedUnidadeId },
    };

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
        where.dataVisita.gte = parseDateFilter(filters.dataInicio);
      }

      if (filters.dataFim) {
        where.dataVisita.lte = parseDateFilter(filters.dataFim, true);
      }

      if (
        where.dataVisita.gte !== undefined &&
        where.dataVisita.lte !== undefined &&
        where.dataVisita.gte > where.dataVisita.lte
      ) {
        throw new Error("Filtro inválido: dataInicio não pode ser maior que dataFim");
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

  async findById(id: number, scopedUnidadeId: number) {
    return this.prisma.relatorio.findFirst({
      where: { id, cliente: { unidadeId: scopedUnidadeId } },
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

  async getPdfLayout(id: number, scopedUnidadeId: number) {
    const relatorio = await this.prisma.relatorio.findFirst({
      where: { id, cliente: { unidadeId: scopedUnidadeId } },
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

    if (!relatorio) {
      throw new Error("Relatório não encontrado");
    }

    await this.prisma.relatorio.update({
      where: { id: relatorio.id },
      data: { impresso: true },
    });

    return {
      fileName: `relatorio-${relatorio.id}.pdf`,
      html: this.buildPdfHtml(relatorio),
    };
  }

  private buildPdfHtml(relatorio: RelatorioPdfData): string {
    const tecnicos = relatorio.tecnicos
      .map((tecnico) => `<li>${escapeHtml(tecnico.nome)}</li>`)
      .join("");
    const setores = relatorio.setores
      .map(
        (setor) => `
          <tr>
            <td>${escapeHtml(setor.setor.nome)}</td>
            <td>${escapeHtml(setor.observacao ?? "-")}</td>
          </tr>
        `,
      )
      .join("");
    const horarios = relatorio.horarios
      .map(
        (horario) =>
          `${formatTime(horario.horaChegada)} - ${formatTime(horario.horaSaida)}`,
      )
      .join(" | ");
    const checklists = relatorio.checklists
      .sort((a, b) => a.checklist.indice - b.checklist.indice)
      .map((item) => `<li>${escapeHtml(item.checklist.nome)}</li>`)
      .join("");

    return `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Relatório ${relatorio.id}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 24px; }
      .header { border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 18px; }
      .header h1 { margin: 0; font-size: 20px; }
      .muted { color: #6b7280; font-size: 12px; }
      .card { border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
      .card h2 { margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #111827; }
      .row { margin: 2px 0; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; vertical-align: top; }
      th { background-color: #f3f4f6; }
      ul { margin: 6px 0 0 18px; padding: 0; }
      .footer { margin-top: 36px; }
      .assinaturas { display: flex; gap: 24px; margin-top: 24px; }
      .assinatura { flex: 1; font-size: 12px; text-align: center; }
      .linha { border-top: 1px solid #111827; margin-bottom: 6px; height: 22px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Relatório Técnico de Visita</h1>
      <div class="muted">Documento gerado em ${formatDateTime(new Date())}</div>
    </div>

    <div class="card">
      <h2>Dados gerais</h2>
      <div class="row"><strong>Relatório:</strong> #${relatorio.id}</div>
      <div class="row"><strong>Cliente:</strong> ${escapeHtml(relatorio.cliente.nomeFantasia)}</div>
      <div class="row"><strong>Contato:</strong> ${escapeHtml(relatorio.contato?.nome ?? "-")}</div>
      <div class="row"><strong>Data da visita:</strong> ${formatDate(relatorio.dataVisita)}</div>
      <div class="row"><strong>Modalidade:</strong> ${escapeHtml(relatorio.modalidadeServico ?? "-")}</div>
      <div class="row"><strong>Criado por:</strong> ${escapeHtml(relatorio.criadoPor.nome)}</div>
    </div>

    <div class="card">
      <h2>Técnicos e horários</h2>
      <div class="row"><strong>Técnicos:</strong></div>
      <ul>${tecnicos || "<li>-</li>"}</ul>
      <div class="row"><strong>Horários:</strong> ${escapeHtml(horarios || "-")}</div>
    </div>

    <div class="card">
      <h2>Setores avaliados</h2>
      <table>
        <thead>
          <tr>
            <th>Setor</th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
          ${setores || "<tr><td colspan='2'>Sem setores vinculados</td></tr>"}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>Checklist aplicado</h2>
      <ul>${checklists || "<li>Sem itens vinculados</li>"}</ul>
    </div>

    <div class="card">
      <h2>Observações</h2>
      <div class="row">${escapeHtml(relatorio.observacoes ?? "-")}</div>
    </div>

    <div class="footer">
      <div class="assinaturas">
        <div class="assinatura">
          <div class="linha"></div>
          Técnico responsável
        </div>
        <div class="assinatura">
          <div class="linha"></div>
          Responsável pelo cliente
        </div>
      </div>
    </div>
  </body>
</html>
    `.trim();
  }

  async update(id: number, data: UpdateRelatorioInput, scopedUnidadeId: number) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.relatorio.findFirst({
        where: { id, cliente: { unidadeId: scopedUnidadeId } },
        select: { id: true },
      });

      if (!existing) {
        throw new Error("Relatório não encontrado");
      }

      const updateData: Prisma.RelatorioUncheckedUpdateInput = {};

      if (data.clienteId !== undefined) {
        const targetCliente = await tx.cliente.findFirst({
          where: { id: data.clienteId, unidadeId: scopedUnidadeId },
          select: { id: true },
        });

        if (!targetCliente) {
          throw new Error("Cliente não pertence à sua unidade");
        }

        updateData.clienteId = data.clienteId;
      }

      if (data.contatoId !== undefined) {
        updateData.contatoId = data.contatoId;
      }

      if (data.dataVisita !== undefined) {
        updateData.dataVisita = new Date(data.dataVisita);
      }

      if (data.modalidade !== undefined || data.modalidadeServico !== undefined) {
        const modalidadeServico = resolverModalidadeServico(data);
        if (modalidadeServico !== undefined) {
          updateData.modalidadeServico = modalidadeServico;
        }
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

  async delete(id: number, scopedUnidadeId: number) {
    const deleted = await this.prisma.relatorio.deleteMany({
      where: { id, cliente: { unidadeId: scopedUnidadeId } },
    });

    if (deleted.count === 0) {
      throw new Error("Relatório não encontrado");
    }
  }
}
