import React from "react";
import { Star } from "lucide-react";
import { styles } from "../styles";

export function AgendaView({ groups, agendaLabel, getMeta, updateMeta, urgencyStyle, daysLabel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {groups.map((group) => (
        <div key={group.key} style={styles.agendaGroup}>
          <div style={styles.agendaGroupHeader}>{agendaLabel(group.dateObj)}</div>
          <div>
            {group.items.map((row) => {
              const meta = getMeta(row.numero);
              const urgency = urgencyStyle(row);
              return (
                <div key={row.numero} style={styles.agendaItem}>
                  <button
                    className="star-btn"
                    title={meta.urgente ? "Remover destaque de urgente" : "Marcar como urgente"}
                    onClick={() => updateMeta(row.numero, { urgente: !meta.urgente })}
                  >
                    <Star size={16} fill={meta.urgente ? "var(--accent)" : "none"} color={meta.urgente ? "var(--accent)" : "var(--muted)"} />
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}>{row.numero}</span> — {row.autor}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{row.texto || "—"}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: urgency.color, whiteSpace: "nowrap" }}>{daysLabel(row)}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
