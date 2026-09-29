import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Bell,
  ClipboardList,
  AlarmClock,
  Download,
  UploadCloud,
  Upload,
  ListChecks,
  History,
  Search,
  Table2,
  CalendarDays,
  Star,
  AlertTriangle,
  CheckSquare,
  Square,
  CheckCircle2,
  X,
  ChevronUp,
  ChevronDown,
  Plus,
  Pencil,
} from "lucide-react";

import { styles, globalCss } from "./styles";
import { STATUS_OPTIONS, DEFAULT_SETTINGS } from "./constants";
import { loadItem, saveItem } from "./lib/storage";
import { downloadFile } from "./lib/download";
import { daysUntil, formatDateBR } from "./lib/dates";
import { mapImportedRow, rehydrateRows } from "./lib/importRow";
import { buildManualRow, rowToManualForm, EMPTY_MANUAL_FORM } from "./lib/manualRow";

import { StatCard } from "./components/StatCard";
import { DetailField } from "./components/DetailField";
import { EmptyState } from "./components/EmptyState";
import { AgendaView } from "./components/AgendaView";
import { HistoryView } from "./components/HistoryView";
import { DayListModal } from "./components/DayListModal";
import { ProcessFormModal } from "./components/ProcessFormModal";

export function App() {
  const [loading, setLoading] = useState(true);
  const [importedRows, setImportedRows] = useState([]);
  const [manualRows, setManualRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [concluded, setConcluded] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState("ativos");
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterAtribuido, setFilterAtribuido] = useState("todos");
  const [filterGrupo, setFilterGrupo] = useState("todos");
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [viewMode, setViewMode] = useState("tabela");
  const [showDayList, setShowDayList] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedNumero, setExpandedNumero] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [importInfo, setImportInfo] = useState(null);
  const [saveError, setSaveError] = useState(false);
  const [diffWarning, setDiffWarning] = useState(null);
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [formModal, setFormModal] = useState(null); // { editingRow: row|null }

  const importInputRef = useRef(null);
  const backupInputRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [rows, savedMeta, savedConcluded, savedSettings, savedImportInfo, savedManualRows] = await Promise.all([
        loadItem("imported-rows", []),
        loadItem("process-meta", {}),
        loadItem("concluded", []),
        loadItem("settings", DEFAULT_SETTINGS),
        loadItem("import-info", null),
        loadItem("manual-rows", []),
      ]);
      setImportedRows(rehydrateRows(rows));
      setMeta(savedMeta);
      setConcluded(savedConcluded);
      setSettings(savedSettings);
      setImportInfo(savedImportInfo);
      setManualRows(rehydrateRows(savedManualRows));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBellMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function getMeta(numero) {
    return meta[numero] || { urgente: false, status: "pendente", nota: "" };
  }

  async function updateMeta(numero, patch) {
    const next = { ...meta, [numero]: { ...getMeta(numero), ...patch } };
    setMeta(next);
    if (!(await saveItem("process-meta", next))) setSaveError(true);
  }

  async function updateManyMeta(numeros, patch) {
    const next = { ...meta };
    numeros.forEach((numero) => {
      next[numero] = { ...getMeta(numero), ...patch };
    });
    setMeta(next);
    if (!(await saveItem("process-meta", next))) setSaveError(true);
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const newRows = XLSX.utils
        .sheet_to_json(sheet, { defval: null, raw: false })
        .map(mapImportedRow)
        .filter(Boolean);

      const concludedNumeros = new Set(concluded.map((c) => c.numero));
      const previousActive = importedRows.filter((r) => !concludedNumeros.has(r.numero));
      const previousActiveNumeros = new Set(previousActive.map((r) => r.numero));
      const newNumeros = new Set(newRows.map((r) => r.numero));
      const novos = newRows.filter((r) => !previousActiveNumeros.has(r.numero) && !concludedNumeros.has(r.numero));
      const sumidos = previousActive.filter((r) => !newNumeros.has(r.numero));

      if (importedRows.length > 0 && (novos.length > 0 || sumidos.length > 0)) {
        setDiffWarning({ novos, sumidos });
      } else {
        setDiffWarning(null);
      }
      setImportedRows(newRows);

      const info = { fileName: file.name, importedAt: new Date().toISOString(), count: newRows.length };
      setImportInfo(info);
      await saveItem("imported-rows", newRows);
      await saveItem("import-info", info);
    } catch (err) {
      console.error(err);
      alert("Não foi possível ler essa planilha. Verifique se é o arquivo exportado do sistema (.xlsx).");
    } finally {
      e.target.value = "";
    }
  }

  async function handleComplete(row) {
    const entry = {
      numero: row.numero,
      estado: row.estado,
      autor: row.autor,
      texto: row.texto,
      prazoFatalStr: row.prazoFatalStr,
      concluidoEm: new Date().toISOString(),
      nota: getMeta(row.numero).nota || "",
    };
    const next = [entry, ...concluded];
    setConcluded(next);
    setExpandedNumero(null);
    await saveItem("concluded", next);
  }

  async function handleBulkComplete(numeros) {
    const byNumero = new Map(allRows.map((r) => [r.numero, r]));
    const entries = numeros
      .map((numero) => byNumero.get(numero))
      .filter(Boolean)
      .map((row) => ({
        numero: row.numero,
        estado: row.estado,
        autor: row.autor,
        texto: row.texto,
        prazoFatalStr: row.prazoFatalStr,
        concluidoEm: new Date().toISOString(),
        nota: getMeta(row.numero).nota || "",
      }));
    const next = [...entries, ...concluded];
    setConcluded(next);
    setSelected(new Set());
    await saveItem("concluded", next);
  }

  async function handleReopen(numero) {
    const next = concluded.filter((c) => c.numero !== numero);
    setConcluded(next);
    await saveItem("concluded", next);
  }

  async function handleSettingsChange(next) {
    setSettings(next);
    await saveItem("settings", next);
  }

  function handleBackup() {
    const payload = {
      exportedAt: new Date().toISOString(),
      rows: importedRows,
      manualRows,
      meta,
      concluded,
      settings,
      importInfo,
    };
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(`backup-painel-prazos-${date}.json`, JSON.stringify(payload, null, 2), "application/json");
  }

  async function handleRestoreFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!("rows" in data) || !("meta" in data) || !("concluded" in data)) {
        alert("Esse arquivo não parece ser um backup válido deste painel.");
        return;
      }
      if (
        !window.confirm(
          "Isso vai substituir os dados atuais do painel (processos importados, cadastrados manualmente, prioridades, notas e histórico) pelos do backup. Deseja continuar?",
        )
      ) {
        return;
      }
      const restoredRows = rehydrateRows(data.rows || []);
      const restoredManualRows = rehydrateRows(data.manualRows || []);
      setImportedRows(restoredRows);
      setManualRows(restoredManualRows);
      setMeta(data.meta || {});
      setConcluded(data.concluded || []);
      setSettings(data.settings || DEFAULT_SETTINGS);
      setImportInfo(data.importInfo || null);
      setDiffWarning(null);
      setSelected(new Set());
      await Promise.all([
        saveItem("imported-rows", restoredRows),
        saveItem("manual-rows", restoredManualRows),
        saveItem("process-meta", data.meta || {}),
        saveItem("concluded", data.concluded || []),
        saveItem("settings", data.settings || DEFAULT_SETTINGS),
        saveItem("import-info", data.importInfo || null),
      ]);
    } catch (err) {
      console.error(err);
      alert("Não consegui ler esse arquivo de backup.");
    } finally {
      e.target.value = "";
    }
  }

  async function handleSaveManualRow(form) {
    const existing = manualRows.find((r) => r.numero === form.numero.trim());
    const row = buildManualRow(form, existing);
    const withoutExisting = manualRows.filter((r) => r.numero !== row.numero);
    const next = [row, ...withoutExisting];
    setManualRows(next);
    setFormModal(null);
    if (!(await saveItem("manual-rows", next))) setSaveError(true);
  }

  async function handleDeleteManualRow(numero) {
    if (!window.confirm("Excluir este processo cadastrado manualmente?")) return;
    const next = manualRows.filter((r) => r.numero !== numero);
    setManualRows(next);
    setFormModal(null);
    setExpandedNumero(null);
    if (!(await saveItem("manual-rows", next))) setSaveError(true);
  }

  // Processos importados e cadastrados manualmente compõem uma única lista de
  // trabalho; em caso de mesmo número, o cadastro manual prevalece na exibição.
  const allRows = useMemo(() => {
    const byNumero = new Map();
    importedRows.forEach((row) => byNumero.set(row.numero, row));
    manualRows.forEach((row) => byNumero.set(row.numero, row));
    return Array.from(byNumero.values());
  }, [importedRows, manualRows]);

  const concludedNumeros = useMemo(() => new Set(concluded.map((c) => c.numero)), [concluded]);
  const estadoOptions = useMemo(() => Array.from(new Set(allRows.map((r) => r.estado).filter(Boolean))).sort(), [allRows]);
  const atribuidoOptions = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.atribuido).filter((v) => v && v !== "—"))).sort(),
    [allRows],
  );
  const grupoOptions = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.grupo).filter((v) => v && v !== "—"))).sort(),
    [allRows],
  );

  const activeRows = useMemo(() => allRows.filter((r) => !concludedNumeros.has(r.numero)), [allRows, concludedNumeros]);

  const filteredRows = useMemo(() => {
    let list = activeRows;
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.numero.toLowerCase().includes(term) ||
          (r.autor || "").toLowerCase().includes(term) ||
          (r.reu || "").toLowerCase().includes(term) ||
          (r.texto || "").toLowerCase().includes(term),
      );
    }
    if (filterEstado !== "todos") list = list.filter((r) => r.estado === filterEstado);
    if (filterStatus !== "todos") list = list.filter((r) => (getMeta(r.numero).status || "pendente") === filterStatus);
    if (filterAtribuido !== "todos") list = list.filter((r) => r.atribuido === filterAtribuido);
    if (filterGrupo !== "todos") list = list.filter((r) => r.grupo === filterGrupo);
    if (onlyUrgent) list = list.filter((r) => getMeta(r.numero).urgente);
    return [...list].sort((a, b) => {
      if (!a.prazoFatal && !b.prazoFatal) return 0;
      if (a.prazoFatal) return b.prazoFatal ? a.prazoFatal - b.prazoFatal : -1;
      return 1;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRows, search, filterEstado, filterStatus, filterAtribuido, filterGrupo, onlyUrgent, meta]);

  const agendaGroups = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const dateObj = row.prazoFatal;
      const key = dateObj ? dateObj.toISOString().slice(0, 10) : "sem-data";
      if (!map.has(key)) map.set(key, { key, dateObj, items: [] });
      map.get(key).items.push(row);
    });
    return Array.from(map.values()).sort((a, b) => {
      if (!a.dateObj && !b.dateObj) return 0;
      if (a.dateObj) return b.dateObj ? a.dateObj - b.dateObj : -1;
      return 1;
    });
  }, [filteredRows]);

  function agendaLabel(dateObj) {
    if (!dateObj) return "Sem data";
    const diff = daysUntil(dateObj);
    const formatted = formatDateBR(dateObj);
    if (diff === 0) return `Hoje · ${formatted}`;
    if (diff === 1) return `Amanhã · ${formatted}`;
    if (diff !== null && diff < 0) return `Venceu · ${formatted}`;
    return formatted;
  }

  const urgentSummary = useMemo(() => {
    const vencidos = [];
    const hoje = [];
    const urgentesExtra = [];
    const seen = new Set();
    activeRows.forEach((row) => {
      const diff = daysUntil(row.prazoFatal);
      if (diff !== null && diff < 0) {
        vencidos.push(row);
        seen.add(row.numero);
      } else if (diff === 0) {
        hoje.push(row);
        seen.add(row.numero);
      }
    });
    activeRows.forEach((row) => {
      if (getMeta(row.numero).urgente && !seen.has(row.numero)) urgentesExtra.push(row);
    });
    return { vencidos, hoje, urgentesExtra };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRows, meta]);

  const dayListText = useMemo(() => {
    const lines = [`LISTA DO DIA — ${new Date().toLocaleDateString("pt-BR")}`, ""];
    function section(title, rows) {
      if (rows.length === 0) return;
      lines.push(`${title} (${rows.length})`);
      rows.forEach((r) => lines.push(`- ${r.numero} — ${r.autor} — ${r.texto || "sem descrição"}`));
      lines.push("");
    }
    section("Prazos vencidos", urgentSummary.vencidos);
    section("Vencem hoje", urgentSummary.hoje);
    section("Marcados como urgentes", urgentSummary.urgentesExtra);
    if (urgentSummary.vencidos.length + urgentSummary.hoje.length + urgentSummary.urgentesExtra.length === 0) {
      lines.push("Nada urgente por enquanto.");
    }
    return lines.join("\n");
  }, [urgentSummary]);

  async function handleCopyDayList() {
    try {
      await navigator.clipboard.writeText(dayListText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Não foi possível copiar automaticamente. Selecione o texto manualmente.");
    }
  }

  const statsCards = useMemo(() => {
    const urgentes = activeRows.filter((r) => getMeta(r.numero).urgente).length;
    const vencidos = activeRows.filter((r) => {
      const diff = daysUntil(r.prazoFatal);
      return diff !== null && diff < 0;
    }).length;
    const vencendo = activeRows.filter((r) => {
      const diff = daysUntil(r.prazoFatal);
      return diff !== null && diff >= 0 && diff <= settings.alertDays;
    }).length;
    return { total: activeRows.length, urgentes, vencidos, vencendo };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRows, meta, settings.alertDays]);

  const bellStats = useMemo(() => {
    const hoje = activeRows.filter((r) => daysUntil(r.prazoFatal) === 0).length;
    const amanha = activeRows.filter((r) => daysUntil(r.prazoFatal) === 1).length;
    const vencidos = activeRows.filter((r) => {
      const diff = daysUntil(r.prazoFatal);
      return diff !== null && diff < 0;
    }).length;
    return { hoje, amanha, vencidos };
  }, [activeRows]);

  function urgencyStyle(row) {
    const diff = daysUntil(row.prazoFatal);
    if (diff === null) return { color: "var(--muted)", weight: 400 };
    if (diff < 0) return { color: "var(--danger)", weight: 700 };
    if (diff <= settings.alertDays) return { color: "var(--warn)", weight: 600 };
    return { color: "var(--ink)", weight: 400 };
  }

  function daysLabel(row) {
    const diff = daysUntil(row.prazoFatal);
    if (diff === null) return "sem data";
    if (diff < 0) return `venceu há ${Math.abs(diff)}d`;
    if (diff === 0) return "vence hoje";
    return `${diff}d restantes`;
  }

  function toggleSelected(numero) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(numero)) next.delete(numero);
      else next.add(numero);
      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelected((prev) => {
      const visible = filteredRows.map((r) => r.numero);
      const allSelected = visible.every((n) => prev.has(n)) && visible.length > 0;
      return allSelected ? new Set() : new Set(visible);
    });
  }

  const allVisibleSelected = filteredRows.length > 0 && filteredRows.every((r) => selected.has(r.numero));
  const bellTotal = bellStats.hoje + bellStats.amanha + bellStats.vencidos;

  function openCreateForm() {
    setFormModal({ editingRow: null });
  }

  function openEditForm(row) {
    setFormModal({ editingRow: row });
  }

  return (
    <div style={styles.app}>
      <style>{globalCss}</style>

      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Painel de Prazos</h1>
          <div style={styles.subtitle}>
            {importInfo
              ? `${importInfo.count} processos · importado de "${importInfo.fileName}" em ${new Date(importInfo.importedAt).toLocaleString("pt-BR")}`
              : "Nenhuma planilha importada ainda"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={styles.bellWrap} ref={bellRef}>
            <button className="pp-btn" onClick={() => setShowBellMenu((v) => !v)} title="Resumo do dia" style={{ position: "relative" }}>
              <Bell size={15} />
              {bellTotal > 0 && <span style={styles.bellBadge}>{bellTotal}</span>}
            </button>
            {showBellMenu && (
              <div style={styles.bellDropdown}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>Resumo do dia</div>
                {bellTotal === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>Nada urgente por enquanto.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {bellStats.vencidos > 0 && (
                      <div style={{ fontSize: 13, color: "var(--danger)" }}>
                        <strong>{bellStats.vencidos}</strong> prazo(s) já vencido(s)
                      </div>
                    )}
                    {bellStats.hoje > 0 && (
                      <div style={{ fontSize: 13, color: "var(--warn)" }}>
                        <strong>{bellStats.hoje}</strong> vence(m) hoje
                      </div>
                    )}
                    {bellStats.amanha > 0 && (
                      <div style={{ fontSize: 13, color: "var(--ink)" }}>
                        <strong>{bellStats.amanha}</strong> vence(m) amanhã
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="pp-btn" onClick={() => setShowDayList(true)} title="Ver lista do dia para copiar ou imprimir">
            <ClipboardList size={15} /> Lista do dia
          </button>
          <button className="pp-btn" onClick={() => setShowSettings((v) => !v)}>
            <AlarmClock size={15} /> Alerta: {settings.alertDays}d
          </button>
          <button className="pp-btn" onClick={handleBackup} title="Baixar backup de todos os seus dados">
            <Download size={15} /> Backup
          </button>
          <button className="pp-btn" onClick={() => backupInputRef.current?.click()} title="Restaurar a partir de um backup">
            <UploadCloud size={15} /> Restaurar
          </button>
          <input ref={backupInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleRestoreFile} />
          <button className="pp-btn" onClick={openCreateForm}>
            <Plus size={15} /> Novo processo
          </button>
          <button className="pp-btn pp-btn-primary" onClick={() => importInputRef.current?.click()}>
            <Upload size={15} /> Importar planilha
          </button>
          <input ref={importInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleImportFile} />
        </div>
      </div>

      {showSettings && (
        <div style={styles.settingsPanel}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Avisar quando faltarem</span>
          <input
            className="pp-input"
            type="number"
            min={0}
            max={60}
            style={{ width: 60 }}
            value={settings.alertDays}
            onChange={(e) => handleSettingsChange({ ...settings, alertDays: Number(e.target.value) || 0 })}
          />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>dias ou menos para o prazo fatal.</span>
          <button className="pp-btn" style={{ marginLeft: "auto" }} onClick={() => setShowSettings(false)}>
            <X size={14} /> Fechar
          </button>
        </div>
      )}

      {saveError && (
        <div style={styles.errorBanner}>
          Não consegui salvar suas últimas alterações. Tente novamente — se persistir, recarregue a página.
        </div>
      )}

      {diffWarning && (diffWarning.novos.length > 0 || diffWarning.sumidos.length > 0) && (
        <div style={styles.warnBanner}>
          <AlertTriangle size={17} color="var(--warn)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, fontSize: 13.5, color: "var(--ink)" }}>
            <div style={{ marginBottom: diffWarning.sumidos.length ? 6 : 0 }}>
              {diffWarning.novos.length > 0 && <span>{diffWarning.novos.length} processo(s) novo(s) nesta importação. </span>}
              {diffWarning.sumidos.length > 0 && (
                <span>
                  <strong>{diffWarning.sumidos.length} processo(s)</strong> que estavam ativos não aparecem mais na
                  planilha — confira se foram resolvidos no sistema ou se é um erro de exportação.
                </span>
              )}
            </div>
            {diffWarning.sumidos.length > 0 && (
              <ul style={styles.diffList}>
                {diffWarning.sumidos.slice(0, 8).map((r) => (
                  <li key={r.numero}>
                    <span style={{ fontFamily: "var(--mono)" }}>{r.numero}</span> — {r.autor}
                  </li>
                ))}
                {diffWarning.sumidos.length > 8 && <li>e mais {diffWarning.sumidos.length - 8}…</li>}
              </ul>
            )}
          </div>
          <button className="pp-btn pp-btn-sm" onClick={() => setDiffWarning(null)}>
            <X size={13} /> Ok
          </button>
        </div>
      )}

      <div style={styles.tabs}>
        <button className="pp-btn" style={activeTab === "ativos" ? styles.tabActive : {}} onClick={() => setActiveTab("ativos")}>
          <ListChecks size={14} /> Ativos ({statsCards.total})
        </button>
        <button className="pp-btn" style={activeTab === "historico" ? styles.tabActive : {}} onClick={() => setActiveTab("historico")}>
          <History size={14} /> Histórico ({concluded.length})
        </button>
      </div>

      {loading ? (
        <div style={styles.emptyState}>Carregando seus dados…</div>
      ) : activeTab === "ativos" ? (
        <>
          <div style={styles.cards}>
            <StatCard label="Processos ativos" value={statsCards.total} tone="ink" />
            <StatCard label="Marcados urgentes" value={statsCards.urgentes} tone="accent" icon={<Star size={14} />} />
            <StatCard label={`Vencendo em até ${settings.alertDays}d`} value={statsCards.vencendo} tone="warn" icon={<AlertTriangle size={14} />} />
            <StatCard label="Prazos vencidos" value={statsCards.vencidos} tone="danger" icon={<AlertTriangle size={14} />} />
          </div>

          <div style={styles.filters}>
            <div style={styles.searchBox}>
              <Search size={14} color="var(--muted)" />
              <input
                className="pp-input"
                style={{ border: "none", flex: 1 }}
                placeholder="Buscar por processo, parte ou texto…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="pp-select" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
              <option value="todos">Todos os estados</option>
              {estadoOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <select className="pp-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="todos">Todos os status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {atribuidoOptions.length > 0 && (
              <select className="pp-select" value={filterAtribuido} onChange={(e) => setFilterAtribuido(e.target.value)}>
                <option value="todos">Todos os atribuídos</option>
                {atribuidoOptions.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            )}
            {grupoOptions.length > 0 && (
              <select className="pp-select" value={filterGrupo} onChange={(e) => setFilterGrupo(e.target.value)}>
                <option value="todos">Todos os grupos</option>
                {grupoOptions.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            )}
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink)" }}>
              <input type="checkbox" checked={onlyUrgent} onChange={(e) => setOnlyUrgent(e.target.checked)} />
              Só urgentes
            </label>
            <div style={styles.viewToggle}>
              <button className="pp-btn pp-btn-sm" style={viewMode === "tabela" ? styles.tabActive : {}} onClick={() => setViewMode("tabela")}>
                <Table2 size={13} /> Tabela
              </button>
              <button className="pp-btn pp-btn-sm" style={viewMode === "agenda" ? styles.tabActive : {}} onClick={() => setViewMode("agenda")}>
                <CalendarDays size={13} /> Agenda
              </button>
            </div>
          </div>

          {selected.size > 0 && (
            <div style={styles.bulkToolbar}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} selecionado(s)</span>
              <button className="pp-btn pp-btn-sm" onClick={() => updateManyMeta(Array.from(selected), { urgente: true })}>
                <Star size={13} /> Marcar urgente
              </button>
              <button className="pp-btn pp-btn-sm" onClick={() => updateManyMeta(Array.from(selected), { urgente: false })}>
                Desmarcar urgente
              </button>
              <select
                className="pp-select pp-btn-sm"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) updateManyMeta(Array.from(selected), { status: e.target.value });
                  e.target.value = "";
                }}
              >
                <option value="" disabled>Mudar status para…</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button className="pp-btn pp-btn-sm pp-btn-primary" onClick={() => handleBulkComplete(Array.from(selected))}>
                <CheckCircle2 size={13} /> Marcar concluídos
              </button>
              <button className="pp-btn pp-btn-sm" style={{ marginLeft: "auto" }} onClick={() => setSelected(new Set())}>
                <X size={13} /> Cancelar seleção
              </button>
            </div>
          )}

          {allRows.length === 0 ? (
            <EmptyState onImport={() => importInputRef.current?.click()} onCreateManual={openCreateForm} />
          ) : filteredRows.length === 0 ? (
            <div style={styles.emptyState}>Nenhum processo corresponde a esses filtros.</div>
          ) : viewMode === "agenda" ? (
            <AgendaView
              groups={agendaGroups}
              agendaLabel={agendaLabel}
              getMeta={getMeta}
              updateMeta={updateMeta}
              urgencyStyle={urgencyStyle}
              daysLabel={daysLabel}
            />
          ) : (
            <div style={styles.tableWrap}>
              <table className="pp-table">
                <thead>
                  <tr>
                    <th>
                      <button className="check-btn" onClick={toggleSelectAllVisible} title="Selecionar todos os visíveis">
                        {allVisibleSelected ? <CheckSquare size={16} /> : <Square size={16} color="var(--muted)" />}
                      </button>
                    </th>
                    <th></th>
                    <th>Prazo fatal</th>
                    <th>Processo</th>
                    <th>UF</th>
                    <th>Parte (autor)</th>
                    <th>Providência</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const rowMeta = getMeta(row.numero);
                    const isExpanded = expandedNumero === row.numero;
                    const urgency = urgencyStyle(row);
                    const isSelected = selected.has(row.numero);
                    const isManual = row.origem === "manual";
                    return (
                      <React.Fragment key={row.numero}>
                        <tr
                          className="pp-row-clickable"
                          style={isSelected ? { background: "#F5F8FC" } : {}}
                          onClick={() => {
                            const next = isExpanded ? null : row.numero;
                            setExpandedNumero(next);
                            setNoteDraft((next && rowMeta.nota) || "");
                          }}
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <button className="check-btn" onClick={() => toggleSelected(row.numero)}>
                              {isSelected ? <CheckSquare size={16} /> : <Square size={16} color="var(--muted)" />}
                            </button>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button
                              className="star-btn"
                              title={rowMeta.urgente ? "Remover destaque de urgente" : "Marcar como urgente"}
                              onClick={() => updateMeta(row.numero, { urgente: !rowMeta.urgente })}
                            >
                              <Star size={17} fill={rowMeta.urgente ? "var(--accent)" : "none"} color={rowMeta.urgente ? "var(--accent)" : "var(--muted)"} />
                            </button>
                          </td>
                          <td>
                            <div style={{ color: urgency.color, fontWeight: urgency.weight }}>{formatDateBR(row.prazoFatal)}</div>
                            <div style={{ fontSize: 11.5, color: urgency.color }}>{daysLabel(row)}</div>
                          </td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}>
                            {row.numero}
                            {isManual && (
                              <span className="pp-badge" style={{ marginLeft: 6, background: "var(--info-soft)", color: "var(--info)" }}>
                                Manual
                              </span>
                            )}
                          </td>
                          <td>{row.estado}</td>
                          <td>{row.autor}</td>
                          <td style={{ maxWidth: 320 }}>
                            <div
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: isExpanded ? "unset" : 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {row.texto || "—"}
                            </div>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select
                              className="pp-select"
                              style={{ fontSize: 12.5, padding: "5px 8px" }}
                              value={rowMeta.status || "pendente"}
                              onChange={(e) => updateMeta(row.numero, { status: e.target.value })}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                          </td>
                          <td>{isExpanded ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}</td>
                        </tr>
                        {isExpanded && (
                          <tr key={row.numero + "-detail"}>
                            <td colSpan={9} style={{ background: "#FAFBFC" }}>
                              <div style={styles.detailGrid}>
                                <DetailField label="Réu" value={row.reu} />
                                <DetailField label="Comarca" value={row.comarca} />
                                <DetailField label="Vara" value={row.vara} />
                                <DetailField label="Protocolo jurídico (PJ)" value={row.protocolo} />
                                <DetailField label="Nº de integração" value={row.integracao} />
                                <DetailField label="Atribuído a" value={row.atribuido} />
                                <DetailField label="Ação" value={row.acao} />
                                <DetailField label="Agenda / grupo" value={row.agendaGrupo} />
                              </div>
                              <div style={{ marginTop: 12 }}>
                                <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4, fontWeight: 600 }}>
                                  Sua anotação (só você vê isso)
                                </div>
                                <textarea
                                  className="pp-nota"
                                  placeholder="Ex.: falei com o autor dia 12, aguardando confirmação…"
                                  value={noteDraft}
                                  onChange={(e) => setNoteDraft(e.target.value)}
                                  onBlur={() => updateMeta(row.numero, { nota: noteDraft })}
                                />
                              </div>
                              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                                <button className="pp-btn pp-btn-primary" onClick={() => handleComplete(row)}>
                                  <CheckCircle2 size={15} /> Marcar como concluído
                                </button>
                                {isManual && (
                                  <button className="pp-btn" onClick={() => openEditForm(row)}>
                                    <Pencil size={15} /> Editar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <HistoryView concluded={concluded} onReopen={handleReopen} />
      )}

      {showDayList && (
        <DayListModal text={dayListText} copied={copied} onCopy={handleCopyDayList} onClose={() => setShowDayList(false)} />
      )}

      {formModal && (
        <ProcessFormModal
          initialForm={formModal.editingRow ? rowToManualForm(formModal.editingRow) : EMPTY_MANUAL_FORM}
          isEditing={Boolean(formModal.editingRow)}
          onSave={handleSaveManualRow}
          onDelete={() => handleDeleteManualRow(formModal.editingRow.numero)}
          onClose={() => setFormModal(null)}
        />
      )}
    </div>
  );
}
