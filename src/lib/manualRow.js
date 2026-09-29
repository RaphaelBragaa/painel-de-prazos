import { parseDeadlineDate, isoToBRDate, dateToISOInput } from "./dates";

export const EMPTY_MANUAL_FORM = {
  numero: "",
  estado: "",
  autor: "",
  reu: "",
  comarca: "",
  vara: "",
  grupo: "",
  acao: "",
  atribuido: "",
  materia: "",
  prazoFatalIso: "",
  texto: "",
};

export function rowToManualForm(row) {
  if (!row) return { ...EMPTY_MANUAL_FORM };
  return {
    numero: row.numero || "",
    estado: row.estado === "—" ? "" : row.estado || "",
    autor: row.autor === "—" ? "" : row.autor || "",
    reu: row.reu === "—" ? "" : row.reu || "",
    comarca: row.comarca === "—" ? "" : row.comarca || "",
    vara: row.vara === "—" ? "" : row.vara || "",
    grupo: row.grupo === "—" ? "" : row.grupo || "",
    acao: row.acao === "—" ? "" : row.acao || "",
    atribuido: row.atribuido === "—" ? "" : row.atribuido || "",
    materia: row.materia === "—" ? "" : row.materia || "",
    prazoFatalIso: dateToISOInput(row.prazoFatal || row.prazoFatalStr),
    texto: row.texto || "",
  };
}

export function buildManualRow(form, existing) {
  const prazoFatalStr = form.prazoFatalIso ? isoToBRDate(form.prazoFatalIso) : null;
  return {
    numero: form.numero.trim(),
    estado: form.estado.trim() || "—",
    comarca: form.comarca.trim() || "—",
    vara: form.vara.trim() || "—",
    grupo: form.grupo.trim() || "—",
    autor: form.autor.trim() || "—",
    reu: form.reu.trim() || "—",
    protocolo: existing?.protocolo || "—",
    integracao: existing?.integracao || "—",
    prazoFatalStr,
    prazoFatal: parseDeadlineDate(prazoFatalStr),
    texto: form.texto.trim(),
    acao: form.acao.trim() || "—",
    situacaoAndamento: existing?.situacaoAndamento || "—",
    situacaoTramitacao: existing?.situacaoTramitacao || "—",
    atribuido: form.atribuido.trim() || "—",
    agendaGrupo: existing?.agendaGrupo || "—",
    materia: form.materia.trim() || "—",
    origem: "manual",
  };
}
