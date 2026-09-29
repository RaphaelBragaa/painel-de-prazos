import React from "react";
import { styles } from "../styles";

const TONES = {
  ink: { bg: "var(--surface)", color: "var(--ink)" },
  accent: { bg: "var(--accent-soft)", color: "#8A6300" },
  warn: { bg: "var(--warn-soft)", color: "var(--warn)" },
  danger: { bg: "var(--danger-soft)", color: "var(--danger)" },
};

export function StatCard({ label, value, tone, icon }) {
  const t = TONES[tone] || TONES.ink;
  return (
    <div style={{ ...styles.card, background: t.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: t.color, fontSize: 12, fontWeight: 600 }}>
        {icon} {label}
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 30, color: t.color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
