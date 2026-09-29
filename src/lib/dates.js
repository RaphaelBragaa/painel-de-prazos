// Datas de prazo fatal vêm da planilha como texto "dd/mm/aaaa"; o parser é
// estrito de propósito para não interpretar formatos ambíguos (ex.: mm/dd) errado.
export function parseDeadlineDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) {
      const [, day, month, year] = m;
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
}

export function parseAnyDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateBR(value) {
  const date = parseAnyDate(value);
  return date ? date.toLocaleDateString("pt-BR") : "—";
}

export function daysUntil(value) {
  const date = parseAnyDate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

export function isoToBRDate(iso) {
  if (!iso) return null;
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function dateToISOInput(value) {
  const date = parseAnyDate(value);
  if (!date) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
