import React from "react";
import { RotateCcw } from "lucide-react";
import { styles } from "../styles";
import { formatDateBR } from "../lib/dates";

export function HistoryView({ concluded, onReopen }) {
  if (concluded.length === 0) {
    return <div style={styles.emptyState}>Nenhum processo concluído ainda.</div>;
  }
  return (
    <div style={styles.tableWrap}>
      <table className="pp-table">
        <thead>
          <tr>
            <th>Concluído em</th>
            <th>Processo</th>
            <th>UF</th>
            <th>Parte</th>
            <th>Providência</th>
            <th>Anotação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {concluded.map((row) => (
            <tr key={row.numero + row.concluidoEm}>
              <td>{formatDateBR(row.concluidoEm)}</td>
              <td style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}>{row.numero}</td>
              <td>{row.estado}</td>
              <td>{row.autor}</td>
              <td style={{ maxWidth: 320 }}>{row.texto}</td>
              <td style={{ maxWidth: 220, color: "var(--muted)" }}>{row.nota || "—"}</td>
              <td>
                <button className="pp-btn pp-btn-sm" onClick={() => onReopen(row.numero)}>
                  <RotateCcw size={13} /> Reabrir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
