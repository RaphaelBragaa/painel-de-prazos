import React, { useEffect, useMemo, useState } from "react";
import { Plus, Printer, Star, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { styles } from "../styles";
import { formatDateBR, parseISODateLocal } from "../lib/dates";
import { acordoDaysLeft } from "../lib/acordos";

function compareAcordos(a, b) {
  if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
  if (a.dataLimite && b.dataLimite) return a.dataLimite.localeCompare(b.dataLimite);
  if (a.dataLimite || b.dataLimite) return a.dataLimite ? -1 : 1;
  return (a.criadoEm || "").localeCompare(b.criadoEm || "");
}

function prazoInfo(acordo, alertDays) {
  const diff = acordoDaysLeft(acordo);
  if (diff === null) return null;
  const data = formatDateBR(parseISODateLocal(acordo.dataLimite));
  if (diff < 0) return { text: `${data} · venceu há ${Math.abs(diff)}d`, color: "var(--danger)", weight: 700 };
  if (diff === 0) return { text: `${data} · vence hoje`, color: "var(--danger)", weight: 700 };
  if (diff <= alertDays) return { text: `${data} · ${diff}d restantes`, color: "var(--warn)", weight: 600 };
  return { text: `${data} · ${diff}d restantes`, color: "var(--ink)", weight: 400 };
}

export function AcordosBoard({
  acordos,
  config,
  processos,
  alertDays,
  printable,
  revisaoPendente,
  onOpenForm,
  onMove,
  onToggleDestaque,
  onConcluir,
  onUpdateConfig,
  onUpdateEtapaCor,
  onMarcarRevisado,
}) {
  const [objetivoDraft, setObjetivoDraft] = useState(config.objetivo);
  const [observacoesDraft, setObservacoesDraft] = useState(config.observacoes);
  const [dragOverEtapa, setDragOverEtapa] = useState(null);

  useEffect(() => setObjetivoDraft(config.objetivo), [config.objetivo]);
  useEffect(() => setObservacoesDraft(config.observacoes), [config.observacoes]);

  const porEtapa = useMemo(() => {
    const map = new Map(config.etapas.map((e) => [e.id, []]));
    acordos.forEach((a) => {
      const bucket = map.get(a.etapaId) || map.get(config.etapas[0].id);
      bucket.push(a);
    });
    map.forEach((list) => list.sort(compareAcordos));
    return map;
  }, [acordos, config.etapas]);

  const lastIndex = config.etapas.length - 1;

  function handleDrop(e, etapaId) {
    e.preventDefault();
    setDragOverEtapa(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onMove(id, etapaId);
  }

  return (
    <div className={printable ? "pp-printable" : undefined}>
      <div style={styles.boardHeader}>
        <div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 24 }}>Acordos</div>
          <div style={styles.subtitle}>{acordos.length} acordo(s) em andamento</div>
        </div>
        <label style={styles.objetivoBox}>
          <span style={styles.formLabel}>Objetivo</span>
          <input
            className="pp-input"
            style={{ background: "transparent" }}
            placeholder="Ex.: fechar 10 acordos até o fim do mês"
            value={objetivoDraft}
            onChange={(e) => setObjetivoDraft(e.target.value)}
            onBlur={() => objetivoDraft !== config.objetivo && onUpdateConfig({ objetivo: objetivoDraft })}
          />
        </label>
        <div className="pp-no-print" style={{ display: "flex", gap: 8 }}>
          <button className="pp-btn" onClick={() => window.print()}>
            <Printer size={15} /> Imprimir
          </button>
          <button className="pp-btn pp-btn-primary" onClick={() => onOpenForm(null)}>
            <Plus size={15} /> Novo acordo
          </button>
        </div>
      </div>

      {revisaoPendente && (
        <div className="pp-no-print" style={styles.warnBanner}>
          <AlertTriangle size={17} color="var(--warn)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, fontSize: 13.5 }}>
            Hora de revisar seus acordos — última revisão em {formatDateBR(config.ultimaRevisao)}.
          </div>
          <button className="pp-btn pp-btn-sm" onClick={onMarcarRevisado}>
            <CheckCircle2 size={13} /> Marcar como revisado
          </button>
        </div>
      )}

      <div className="pp-board">
        {config.etapas.map((etapa, index) => {
          const items = porEtapa.get(etapa.id) || [];
          return (
            <div
              key={etapa.id}
              className="pp-column"
              style={dragOverEtapa === etapa.id ? { outline: "2px dashed var(--ink)", outlineOffset: -2 } : undefined}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverEtapa !== etapa.id) setDragOverEtapa(etapa.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setDragOverEtapa(null);
              }}
              onDrop={(e) => handleDrop(e, etapa.id)}
            >
              <div style={styles.columnHeader}>
                <input
                  type="color"
                  className="pp-color pp-no-print"
                  value={etapa.cor}
                  title="Cor dos post-its desta etapa"
                  onChange={(e) => onUpdateEtapaCor(etapa.id, e.target.value)}
                />
                <span style={{ flex: 1 }}>
                  {index + 1}. {etapa.nome}
                </span>
                <span style={styles.columnCount}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 6 }}>
                {items.map((acordo) => {
                  const processo = processos.get(acordo.numero);
                  const prazo = prazoInfo(acordo, alertDays);
                  return (
                    <div
                      key={acordo.id}
                      className="pp-postit"
                      style={{ background: etapa.cor }}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", acordo.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => onOpenForm(acordo)}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                        <div style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 12, wordBreak: "break-all" }}>{acordo.numero}</div>
                        <button
                          className="star-btn"
                          title={acordo.destaque ? "Remover destaque" : "Destacar"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleDestaque(acordo.id);
                          }}
                        >
                          <Star size={15} fill={acordo.destaque ? "var(--accent)" : "none"} color={acordo.destaque ? "#8A6300" : "rgba(27,36,48,0.45)"} />
                        </button>
                      </div>
                      {processo && processo.autor !== "—" && (
                        <div style={{ fontSize: 11.5, color: "rgba(27,36,48,0.65)", marginTop: 2 }}>{processo.autor}</div>
                      )}
                      <div style={styles.postitMotivo}>{acordo.motivo}</div>
                      {prazo && (
                        <div style={{ fontSize: 11.5, marginTop: 8, color: prazo.color, fontWeight: prazo.weight }}>{prazo.text}</div>
                      )}
                      <div className="pp-no-print" style={styles.postitActions} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="pp-icon-btn"
                          title="Voltar para a etapa anterior"
                          disabled={index === 0}
                          onClick={() => onMove(acordo.id, config.etapas[index - 1].id)}
                        >
                          <ChevronLeft size={15} />
                        </button>
                        {index === lastIndex ? (
                          <button className="pp-btn pp-btn-sm" style={{ background: "rgba(255,255,255,0.7)" }} onClick={() => onConcluir(acordo)}>
                            <CheckCircle2 size={13} /> Concluir
                          </button>
                        ) : (
                          <button
                            className="pp-icon-btn"
                            title="Avançar para a próxima etapa"
                            onClick={() => onMove(acordo.id, config.etapas[index + 1].id)}
                          >
                            <ChevronRight size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.boardFooter}>
        <label style={{ ...styles.formField, flex: 1, minWidth: 240 }}>
          <span style={styles.formLabel}>Observações</span>
          <textarea
            className="pp-nota"
            value={observacoesDraft}
            onChange={(e) => setObservacoesDraft(e.target.value)}
            onBlur={() => observacoesDraft !== config.observacoes && onUpdateConfig({ observacoes: observacoesDraft })}
          />
        </label>
        <div style={styles.revisaoBox}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
            <RefreshCw size={14} /> Revisar periodicamente
          </div>
          <div className="pp-no-print" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginTop: 8 }}>
            A cada
            <input
              className="pp-input"
              type="number"
              min={0}
              max={90}
              style={{ width: 60 }}
              value={config.revisaoDias}
              onChange={(e) => onUpdateConfig({ revisaoDias: Number(e.target.value) || 0 })}
            />
            dias
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            {config.revisaoDias === 0
              ? "Lembrete desligado."
              : config.ultimaRevisao
                ? `Última revisão: ${formatDateBR(config.ultimaRevisao)}`
                : "O lembrete começa a contar a partir do primeiro acordo."}
          </div>
          {config.ultimaRevisao && (
            <button className="pp-btn pp-btn-sm pp-no-print" style={{ marginTop: 8 }} onClick={onMarcarRevisado}>
              <CheckCircle2 size={13} /> Revisei agora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
