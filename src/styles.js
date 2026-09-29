export const globalCss = `
  :root {
    --bg: #F4F5F7;
    --surface: #FFFFFF;
    --ink: #1B2430;
    --muted: #6B7280;
    --line: #DDE1E6;
    --accent: #E8B400;
    --accent-soft: #FCF0C6;
    --danger: #B3261E;
    --danger-soft: #FBEAE8;
    --warn: #B4650A;
    --warn-soft: #FBEEDA;
    --ok: #2F6F4E;
    --ok-soft: #E7F2EC;
    --info: #2A5C8A;
    --info-soft: #E8F0F7;
    --serif: Georgia, 'Iowan Old Style', 'Times New Roman', serif;
    --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  }
  * { box-sizing: border-box; }
  .pp-btn {
    display:inline-flex; align-items:center; gap:6px;
    border:1px solid var(--line); background:var(--surface); color:var(--ink);
    padding:8px 14px; border-radius:6px; font-size:13px; font-family:var(--sans);
    cursor:pointer; transition: border-color .15s ease, background .15s ease;
  }
  .pp-btn:hover { border-color: var(--ink); }
  .pp-btn-primary { background:var(--ink); color:#fff; border-color:var(--ink); }
  .pp-btn-primary:hover { background:#000; }
  .pp-btn-sm { padding:5px 10px; font-size:12.5px; }
  .pp-input, .pp-select {
    border:1px solid var(--line); border-radius:6px; padding:7px 10px;
    font-size:13px; font-family:var(--sans); background:var(--surface); color:var(--ink);
  }
  .pp-input:focus, .pp-select:focus { outline:2px solid var(--ink); outline-offset:1px; }
  table.pp-table { border-collapse:collapse; width:100%; }
  table.pp-table th {
    text-align:left; font-family:var(--sans); font-size:11px; font-weight:600;
    color:var(--muted); padding:10px 12px; border-bottom:1px solid var(--line);
    white-space:nowrap;
  }
  table.pp-table td {
    padding:12px; border-bottom:1px solid var(--line); font-family:var(--sans);
    font-size:13.5px; vertical-align:top;
  }
  table.pp-table tr:hover td { background:#FAFBFC; }
  .pp-row-clickable { cursor:pointer; }
  .star-btn, .check-btn { background:none; border:none; cursor:pointer; padding:2px; display:flex; }
  .pp-badge {
    display:inline-flex; align-items:center; gap:5px; padding:3px 9px;
    border-radius:100px; font-size:12px; font-family:var(--sans); font-weight:600;
  }
  textarea.pp-nota {
    width:100%; min-height:60px; border:1px solid var(--line); border-radius:6px;
    padding:8px; font-family:var(--sans); font-size:13px; resize:vertical;
  }
  ::placeholder { color: #9AA1AB; }
  @media print {
    body * { visibility: hidden; }
    .pp-printable, .pp-printable * { visibility: visible; }
    .pp-printable { position: absolute; top: 0; left: 0; width: 100%; box-shadow: none; border: none; }
    .pp-no-print { display: none !important; }
  }
`;

export const styles = {
  app: {
    minHeight: "100vh",
    background: "var(--bg, #F4F5F7)",
    fontFamily: "var(--sans)",
    padding: "28px 32px 60px",
    color: "var(--ink, #1B2430)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    flexWrap: "wrap",
    gap: 12,
  },
  h1: { fontFamily: "var(--serif)", fontSize: 30, margin: 0, fontWeight: 400, letterSpacing: 0.2 },
  subtitle: { fontSize: 13, color: "var(--muted)", marginTop: 4 },
  bellWrap: { position: "relative" },
  bellBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    background: "var(--danger)",
    color: "#fff",
    fontSize: 10.5,
    fontWeight: 700,
    borderRadius: 100,
    minWidth: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 3px",
  },
  bellDropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: "#fff",
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: "12px 14px",
    minWidth: 220,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    zIndex: 20,
  },
  settingsPanel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 16,
  },
  errorBanner: {
    background: "var(--danger-soft)",
    color: "var(--danger)",
    padding: "8px 14px",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 14,
  },
  infoBanner: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "var(--info-soft)",
    border: "1px solid #C6DBEC",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 14,
  },
  warnBanner: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "var(--warn-soft)",
    border: "1px solid #EAD2AE",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 14,
  },
  diffList: { margin: "6px 0 0", paddingLeft: 18, fontSize: 12.5, color: "var(--muted)" },
  tabs: { display: "flex", gap: 8, marginBottom: 20 },
  tabActive: { borderColor: "var(--ink)", background: "#EFEFEF" },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
    marginBottom: 20,
  },
  card: { border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" },
  filters: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
  viewToggle: { display: "flex", gap: 4, marginLeft: "auto" },
  agendaGroup: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" },
  agendaGroupHeader: {
    padding: "10px 16px",
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--muted)",
    borderBottom: "1px solid var(--line)",
    background: "#FAFBFC",
  },
  agendaItem: { display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--line)" },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(20,22,26,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 20,
  },
  modalCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 22,
    maxWidth: 520,
    width: "100%",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
  },
  listaDiaPre: {
    whiteSpace: "pre-wrap",
    fontFamily: "var(--sans)",
    fontSize: 13,
    background: "#FAFBFC",
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: 14,
    margin: 0,
    lineHeight: 1.5,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid var(--line)",
    borderRadius: 6,
    padding: "0 10px",
    background: "#fff",
    minWidth: 260,
    flex: 1,
  },
  bulkToolbar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 14,
    flexWrap: "wrap",
  },
  tableWrap: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, padding: "14px 4px" },
  emptyState: { padding: "60px 20px", textAlign: "center", color: "var(--muted)", fontSize: 14 },
  emptyImport: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "70px 20px",
    background: "var(--surface)",
    border: "1px dashed var(--line)",
    borderRadius: 10,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },
  formField: { display: "flex", flexDirection: "column", gap: 4 },
  formLabel: { fontSize: 11.5, color: "var(--muted)", fontWeight: 600 },
};
