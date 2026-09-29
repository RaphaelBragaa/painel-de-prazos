import { parseDeadlineDate } from "./dates";

// Nomes de coluna como exportados pelo sistema jurídico de origem.
const COLUMNS = {
  numero: ["PRO.Número do processo"],
  estado: ["PRO.JUI.Estado"],
  comarca: ["PRO.JUI.Descrição"],
  vara: ["PRO.OJ número e sigla"],
  grupo: ["GRU.Descrição"],
  autor: ["AUT.Nome"],
  reu: ["REU.Nome"],
  protocolo: ["PJ - Protocolo Jurídico"],
  integracao: ["PRO.Número de integração"],
  prazoFatalStr: ["ATP.Data final prazo"],
  texto: ["ATP.Texto"],
  acao: ["PRO.ACO.Descrição"],
  situacaoAndamento: ["TRA.TMT.Descrição da situação"],
  situacaoTramitacao: ["TRA.STT.Descrição da situação"],
  atribuido: ["TRA.PAT.Nome"],
  agendaGrupo: ["ATP.PES.Nome"],
  materia: ["MATERIA"],
};

function firstNonEmpty(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return row[key];
    }
  }
  return null;
}

export function mapImportedRow(rawRow) {
  const numero = firstNonEmpty(rawRow, COLUMNS.numero);
  if (!numero) return null;
  const prazoFatalStr = firstNonEmpty(rawRow, COLUMNS.prazoFatalStr);
  return {
    numero: String(numero).trim(),
    estado: firstNonEmpty(rawRow, COLUMNS.estado) || "—",
    comarca: firstNonEmpty(rawRow, COLUMNS.comarca) || "—",
    vara: firstNonEmpty(rawRow, COLUMNS.vara) || "—",
    grupo: firstNonEmpty(rawRow, COLUMNS.grupo) || "—",
    autor: firstNonEmpty(rawRow, COLUMNS.autor) || "—",
    reu: firstNonEmpty(rawRow, COLUMNS.reu) || "—",
    protocolo: firstNonEmpty(rawRow, COLUMNS.protocolo) || "—",
    integracao: firstNonEmpty(rawRow, COLUMNS.integracao) || "—",
    prazoFatalStr,
    prazoFatal: parseDeadlineDate(prazoFatalStr),
    texto: firstNonEmpty(rawRow, COLUMNS.texto) || "",
    acao: firstNonEmpty(rawRow, COLUMNS.acao) || "—",
    situacaoAndamento: firstNonEmpty(rawRow, COLUMNS.situacaoAndamento) || "—",
    situacaoTramitacao: firstNonEmpty(rawRow, COLUMNS.situacaoTramitacao) || "—",
    atribuido: firstNonEmpty(rawRow, COLUMNS.atribuido) || "—",
    agendaGrupo: firstNonEmpty(rawRow, COLUMNS.agendaGrupo) || "—",
    materia: firstNonEmpty(rawRow, COLUMNS.materia) || "—",
  };
}

// Recalcula prazoFatal (objeto Date) a partir de prazoFatalStr ao carregar
// dados salvos, já que Date não sobrevive a JSON.stringify/parse.
export function rehydrateRows(rows) {
  return Array.isArray(rows)
    ? rows.map((row) => ({
        ...row,
        prazoFatal: parseDeadlineDate(row.prazoFatalStr || row.prazoFatal),
      }))
    : [];
}
