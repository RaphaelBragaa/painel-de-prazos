import React from "react";
import { X, Copy, Printer } from "lucide-react";
import { styles } from "../styles";

export function DayListModal({ text, copied, onCopy, onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div className="pp-printable" style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 20 }}>Lista do dia</div>
          <button className="pp-btn pp-btn-sm pp-no-print" onClick={onClose}>
            <X size={13} /> Fechar
          </button>
        </div>
        <pre style={styles.listaDiaPre}>{text}</pre>
        <div className="pp-no-print" style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="pp-btn pp-btn-primary" onClick={onCopy}>
            <Copy size={14} /> {copied ? "Copiado!" : "Copiar"}
          </button>
          <button className="pp-btn" onClick={() => window.print()}>
            <Printer size={14} /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
