import { daysUntil, parseISODateLocal } from "./dates";

export const DEFAULT_ETAPAS = [
  { id: "enviar-proposta", nome: "Enviar a proposta de acordo", cor: "#FFF3A3" },
  { id: "proposta-enviada", nome: "Proposta enviada para a parte autora", cor: "#FFD8A8" },
  { id: "retorno-juridico", nome: "Aguardando o retorno do Jurídico interno", cor: "#CDE3F7" },
  { id: "retorno-contraproposta", nome: "Aguardando o retorno da contraproposta", cor: "#C5E8E4" },
  { id: "elaborar-minuta", nome: "Elaborar minuta de acordo", cor: "#FFC9D6" },
  { id: "validacao-50k", nome: "Validação da minuta superior a 50k", cor: "#DCCDF2" },
  { id: "minuta-parte-autora", nome: "Aguardando a minuta assinada pela parte autora", cor: "#D6EDB5" },
  { id: "minuta-controladoria", nome: "Aguardando a minuta assinada pela controladoria", cor: "#F5E1C8" },
  { id: "pedido-homologacao", nome: "Pedido de homologação do acordo", cor: "#DDE4FF" },
  { id: "verificar-protocolos", nome: "Verificar protocolos", cor: "#F9D5F0" },
  { id: "comprovar-cumprimento", nome: "Comprovar cumprimento do acordo", cor: "#D9F2D0" },
];

export const DEFAULT_ACORDOS_CONFIG = {
  etapas: DEFAULT_ETAPAS,
  objetivo: "",
  observacoes: "",
  revisaoDias: 7,
  ultimaRevisao: null,
};

export function newAcordoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function acordoDaysLeft(acordo) {
  return daysUntil(parseISODateLocal(acordo.dataLimite));
}

export function isRevisaoPendente(config, totalAcordos) {
  if (!config.revisaoDias || totalAcordos === 0 || !config.ultimaRevisao) return false;
  return -daysUntil(config.ultimaRevisao) >= config.revisaoDias;
}
