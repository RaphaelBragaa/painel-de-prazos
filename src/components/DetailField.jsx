import React from "react";

export function DetailField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600, letterSpacing: 0.2 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--ink)", marginTop: 2 }}>{value || "—"}</div>
    </div>
  );
}
