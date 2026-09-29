import React, { useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { styles } from "../styles";

export function AcordoFormModal({ acordo, etapas, processos, onSave, onDelete, onClose }) {
  const isEditing = Boolean(acordo?.id);
  const [numero, setNumero] = useState(acordo?.numero || "");
  const [motivo, setMotivo] = useState(acordo?.motivo || "");
  const [etapaId, setEtapaId] = useState(acordo?.etapaId || etapas[0].id);
  const [dataLimite, setDataLimite] = useState(acordo?.dataLimite || "");
  const [error, setError] = useState("");

  const processo = processos.get(numero.trim());

  function handleSubmit(e) {
    e.preventDefault();
    const numeroTrim = numero.trim();
    if (!numeroTrim || !motivo.trim()) {
      setError("Informe o número do processo e o motivo do acordo.");
      return;
    }
    // Processos que saíram do painel depois de o acordo ser criado continuam válidos na edição.
    if (!processos.has(numeroTrim) && numeroTrim !== acordo?.numero) {
      setError("Processo não encontrado no painel. Importe a planilha ou cadastre o processo manualmente antes.");
      return;
    }
    onSave({
      ...(isEditing ? { id: acordo.id } : {}),
      numero: numeroTrim,
      motivo: motivo.trim(),
      etapaId,
      dataLimite: dataLimite || null,
    });
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 20 }}>{isEditing ? "Editar acordo" : "Novo acordo"}</div>
          <button className="pp-btn pp-btn-sm" onClick={onClose} type="button">
            <X size={13} /> Fechar
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={styles.formField}>
            <span style={styles.formLabel}>Número do processo *</span>
            <input
              className="pp-input"
              list="pp-processos-list"
              value={numero}
              placeholder="Digite para buscar entre os processos do painel"
              onChange={(e) => setNumero(e.target.value)}
            />
            <datalist id="pp-processos-list">
              {Array.from(processos.values()).map((p) => (
                <option key={p.numero} value={p.numero}>{p.autor}</option>
              ))}
            </datalist>
            {processo && (
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                {processo.autor} × {processo.reu}
              </span>
            )}
          </label>
          <label style={styles.formField}>
            <span style={styles.formLabel}>Motivo do acordo *</span>
            <textarea className="pp-nota" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </label>
          <div style={styles.formGrid}>
            <label style={styles.formField}>
              <span style={styles.formLabel}>Etapa</span>
              <select className="pp-select" value={etapaId} onChange={(e) => setEtapaId(e.target.value)}>
                {etapas.map((etapa) => (
                  <option key={etapa.id} value={etapa.id}>{etapa.nome}</option>
                ))}
              </select>
            </label>
            <label style={styles.formField}>
              <span style={styles.formLabel}>Prazo (opcional)</span>
              <input className="pp-input" type="date" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} />
            </label>
          </div>
          {error && <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" className="pp-btn pp-btn-primary">
              <Save size={15} /> {isEditing ? "Salvar alterações" : "Criar acordo"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="pp-btn"
                style={{ marginLeft: "auto", color: "var(--danger)", borderColor: "var(--danger-soft)" }}
                onClick={onDelete}
              >
                <Trash2 size={15} /> Excluir
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
