import React, { useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { styles } from "../styles";

const FIELDS = [
  { key: "numero", label: "Número do processo *", placeholder: "0000000-00.0000.0.00.0000" },
  { key: "estado", label: "UF" },
  { key: "autor", label: "Autor / parte requerente" },
  { key: "reu", label: "Réu / parte contrária" },
  { key: "comarca", label: "Comarca" },
  { key: "vara", label: "Vara / órgão julgador" },
  { key: "grupo", label: "Grupo" },
  { key: "acao", label: "Ação" },
  { key: "atribuido", label: "Atribuído a" },
  { key: "materia", label: "Matéria" },
];

export function ProcessFormModal({ initialForm, isEditing, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.numero.trim()) {
      setError("Informe o número do processo.");
      return;
    }
    onSave(form);
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 20 }}>
            {isEditing ? "Editar processo" : "Cadastrar processo manualmente"}
          </div>
          <button className="pp-btn pp-btn-sm" onClick={onClose} type="button">
            <X size={13} /> Fechar
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            {FIELDS.map((field) => (
              <label key={field.key} style={styles.formField}>
                <span style={styles.formLabel}>{field.label}</span>
                <input
                  className="pp-input"
                  value={form[field.key]}
                  placeholder={field.placeholder || ""}
                  disabled={field.key === "numero" && isEditing}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              </label>
            ))}
            <label style={styles.formField}>
              <span style={styles.formLabel}>Prazo fatal</span>
              <input
                className="pp-input"
                type="date"
                value={form.prazoFatalIso}
                onChange={(e) => setField("prazoFatalIso", e.target.value)}
              />
            </label>
          </div>
          <label style={{ ...styles.formField, marginTop: 12 }}>
            <span style={styles.formLabel}>Providência / descrição</span>
            <textarea
              className="pp-nota"
              value={form.texto}
              placeholder="Ex.: contestar, apresentar recurso, comparecer à audiência…"
              onChange={(e) => setField("texto", e.target.value)}
            />
          </label>
          {error && (
            <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button type="submit" className="pp-btn pp-btn-primary">
              <Save size={15} /> {isEditing ? "Salvar alterações" : "Cadastrar processo"}
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
