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

function formatDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) {
    return "00:00";
  }
  const totalMinutes = Math.round(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getPeriodo(hora: Date): string {
  const h = hora.getHours();
  if (h < 12) return "Manhã";
  if (h < 18) return "Tarde";
  return "Noite";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeTipTapHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function renderServicoHtml(content?: string | null): string {
  if (!content || content.trim() === "") {
    return "<p>-</p>";
  }

  const trimmed = content.trim();
  const hasHtml = /<[^>]+>/.test(trimmed);
  if (hasHtml) {
    return sanitizeTipTapHtml(trimmed);
  }

  return `<p>${escapeHtml(trimmed).replaceAll("\n", "<br />")}</p>`;
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
    const logoUrl = process.env["RELATORIO_LOGO_URL"] ?? "";
    const tecnicoDesignado =
      relatorio.tecnicos[0]?.nome ?? relatorio.criadoPor.nome ?? "-";
    const horariosRows = relatorio.horarios
      .slice()
      .sort((a, b) => a.horaChegada.getTime() - b.horaChegada.getTime())
      .map(
        (horario) => `
          <tr>
            <td>${getPeriodo(horario.horaChegada)}</td>
            <td>${formatTime(horario.horaChegada)}</td>
            <td>${formatTime(horario.horaSaida)}</td>
            <td>${formatDuration(horario.horaChegada, horario.horaSaida)}</td>
          </tr>
        `,
      )
      .join("");
    const totalHoras = relatorio.horarios.reduce((acc, horario) => {
      const diff = Math.max(
        0,
        horario.horaSaida.getTime() - horario.horaChegada.getTime(),
      );
      return acc + diff;
    }, 0);
    const totalHorasFormatado = formatDuration(new Date(0), new Date(totalHoras));

    return `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Relatório ${relatorio.id}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: "Segoe UI", Arial, Helvetica, sans-serif;
        color: #111827;
        margin: 0;
        padding: 28px;
        font-size: 12px;
      }
      .document { width: 100%; }
      .section {
        border-top: 1px solid #d1d5db;
        padding-top: 10px;
        margin-top: 10px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
        margin-bottom: 14px;
      }
      .logo-box {
        min-width: 180px;
        min-height: 62px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .logo-box img {
        max-width: 180px;
        max-height: 62px;
        object-fit: contain;
      }
      .logo-fallback {
        font-size: 22px;
        font-weight: 700;
        color: #b91c1c;
        letter-spacing: 0.5px;
      }
      .company {
        text-align: right;
        font-size: 11px;
        line-height: 1.4;
      }
      h1 {
        margin: 0;
        font-size: 18px;
        text-transform: uppercase;
      }
      .subtitle {
        margin-top: 4px;
        color: #4b5563;
      }
      .info-grid {
        margin-top: 10px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 20px;
      }
      .info-item {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 5px;
      }
      .label {
        color: #374151;
        font-weight: 600;
        margin-right: 4px;
      }
      .section-title {
        font-size: 13px;
        font-weight: 700;
        margin: 0 0 8px 0;
        text-transform: uppercase;
      }
      .rich-text {
        line-height: 1.5;
      }
      .rich-text p {
        margin: 0 0 6px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #d1d5db;
        padding: 6px 8px;
        text-align: left;
        vertical-align: top;
      }
      th {
        background: #f9fafb;
        font-weight: 700;
      }
      .table-footer {
        margin-top: 6px;
        text-align: right;
        font-weight: 600;
      }
      .legal {
        margin-top: 14px;
        font-size: 11px;
        color: #374151;
        line-height: 1.5;
      }
      .assinaturas {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-top: 16px;
      }
      .assinatura {
        text-align: center;
      }
      .linha {
        border-top: 1px solid #111827;
        margin: 22px 0 6px 0;
      }
      .assinatura-nome {
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="document">
      <div class="header">
        <div class="logo-box">
          ${
            logoUrl
              ? `<img src="${escapeHtml(logoUrl)}" alt="Logo Linq" />`
              : `<div class="logo-fallback">LINQ</div>`
          }
        </div>
        <div class="company">
          <div><strong>LINQ INFORMÁTICA</strong></div>
          <div>Rua Geraldo Pereira, 338 - Sala 704</div>
          <div>Alto da Bronze, Estrela/RS - CEP: 95.880-000</div>
          <div>Suporte: 51 3720-4462</div>
          <div>www.linq.com.br</div>
        </div>
      </div>

      <h1>Relatório de Atendimento Técnico</h1>
      <div class="subtitle">Relatório Nº ${relatorio.id} • Data: ${formatDate(relatorio.dataVisita)}</div>

      <div class="section">
        <div class="section-title">Informações do Cliente</div>
        <div class="info-grid">
          <div class="info-item"><span class="label">Cliente:</span>${escapeHtml(relatorio.cliente.nomeFantasia)}</div>
          <div class="info-item"><span class="label">Relatório N°:</span>${relatorio.id}</div>
          <div class="info-item"><span class="label">Data:</span>${formatDate(relatorio.dataVisita)}</div>
          <div class="info-item"><span class="label">Contato:</span>${escapeHtml(relatorio.contato?.nome ?? "-")}</div>
          <div class="info-item"><span class="label">Cidade:</span>${escapeHtml(`${relatorio.cliente.cidade}/${relatorio.cliente.estado}`)}</div>
          <div class="info-item"><span class="label">Modalidade:</span>${escapeHtml(relatorio.modalidadeServico ?? "-")}</div>
          <div class="info-item"><span class="label">Técnico Designado:</span>${escapeHtml(tecnicoDesignado)}</div>
          <div class="info-item"><span class="label">Emitido em:</span>${formatDateTime(new Date())}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Detalhamento dos Serviços</div>
        <div class="rich-text">
          ${renderServicoHtml(relatorio.observacoes)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Detalhamento de Horários</div>
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              horariosRows ||
              `<tr><td colspan="4">Sem horários informados</td></tr>`
            }
          </tbody>
        </table>
        <div class="table-footer">Total de horas: ${totalHorasFormatado}</div>
      </div>

      <div class="legal">
        A LINQ INFORMÁTICA EIRELI-ME, seus diretores, sócios e funcionários, ficam ISENTOS DE QUAISQUER RESPONSABILIDADES,
        sejam elas jurídicas, cíveis, penais ou criminais, referentes ao USO DE LICENÇAS DE SOFTWARE pela EMPRESA CONTRATANTE,
        na sua sede matriz e respectivas filiais.
      </div>

      <div class="assinaturas">
        <div class="assinatura">
          <div class="linha"></div>
          <div class="assinatura-nome">${escapeHtml(tecnicoDesignado)}</div>
          <div>Técnico Responsável</div>
          <div>LINQ INFORMÁTICA</div>
        </div>
        <div class="assinatura">
          <div class="linha"></div>
          <div class="assinatura-nome">${escapeHtml(relatorio.contato?.nome ?? "Responsável do Cliente")}</div>
          <div>Responsável pelo Cliente</div>
          <div>${escapeHtml(relatorio.cliente.nomeFantasia)}</div>
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
