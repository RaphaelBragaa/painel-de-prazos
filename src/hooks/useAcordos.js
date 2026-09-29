import { useState } from "react";
import { loadItem, saveItem } from "../lib/storage";
import { DEFAULT_ACORDOS_CONFIG, newAcordoId } from "../lib/acordos";

export function useAcordos(onSaveError) {
  const [acordos, setAcordos] = useState(() => loadItem("acordos", []));
  const [config, setConfig] = useState(() => ({ ...DEFAULT_ACORDOS_CONFIG, ...loadItem("acordos-config", {}) }));

  function persistAcordos(next) {
    setAcordos(next);
    if (!saveItem("acordos", next)) onSaveError();
  }

  function persistConfig(next) {
    setConfig(next);
    if (!saveItem("acordos-config", next)) onSaveError();
  }

  function saveAcordo(data) {
    if (data.id) {
      persistAcordos(acordos.map((a) => (a.id === data.id ? { ...a, ...data } : a)));
      return;
    }
    const now = new Date().toISOString();
    persistAcordos([...acordos, { ...data, id: newAcordoId(), destaque: false, criadoEm: now }]);
    // O ciclo de revisão começa a contar a partir do primeiro acordo do quadro.
    if (!config.ultimaRevisao) persistConfig({ ...config, ultimaRevisao: now });
  }

  function moveAcordo(id, etapaId) {
    persistAcordos(acordos.map((a) => (a.id === id ? { ...a, etapaId } : a)));
  }

  function toggleDestaque(id) {
    persistAcordos(acordos.map((a) => (a.id === id ? { ...a, destaque: !a.destaque } : a)));
  }

  function removeAcordo(id) {
    persistAcordos(acordos.filter((a) => a.id !== id));
  }

  function updateConfig(patch) {
    persistConfig({ ...config, ...patch });
  }

  function updateEtapaCor(etapaId, cor) {
    persistConfig({ ...config, etapas: config.etapas.map((e) => (e.id === etapaId ? { ...e, cor } : e)) });
  }

  function marcarRevisado() {
    persistConfig({ ...config, ultimaRevisao: new Date().toISOString() });
  }

  function replaceAll(nextAcordos, nextConfig) {
    persistAcordos(nextAcordos);
    persistConfig({ ...DEFAULT_ACORDOS_CONFIG, ...nextConfig });
  }

  return {
    acordos,
    config,
    saveAcordo,
    moveAcordo,
    toggleDestaque,
    removeAcordo,
    updateConfig,
    updateEtapaCor,
    marcarRevisado,
    replaceAll,
  };
}
