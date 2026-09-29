import React from "react";
import { FileSpreadsheet, Upload, Plus } from "lucide-react";
import { styles } from "../styles";

export function EmptyState({ onImport, onCreateManual }) {
  return (
    <div style={styles.emptyImport}>
      <FileSpreadsheet size={30} color="var(--muted)" />
      <div style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 12, color: "var(--ink)" }}>
        Importe sua planilha de agenda ou cadastre um processo
      </div>
      <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 6, maxWidth: 420, textAlign: "center" }}>
        Envie o arquivo .xlsx exportado do sistema jurídico, ou cadastre manualmente os processos que você
        acompanha. Suas marcações de prioridade, status e anotações ficam salvas aqui mesmo, mesmo depois de
        reimportar uma planilha atualizada.
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button className="pp-btn pp-btn-primary" onClick={onImport}>
          <Upload size={15} /> Escolher arquivo
        </button>
        <button className="pp-btn" onClick={onCreateManual}>
          <Plus size={15} /> Cadastrar manualmente
        </button>
      </div>
    </div>
  );
}
