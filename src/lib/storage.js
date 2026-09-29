// Mantém o mesmo prefixo/chaves de versões anteriores do painel para não
// perder dados já salvos no localStorage dos usuários.
const PREFIX = "painel-prazos:";

export function loadItem(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.error("Erro ao ler", key, err);
    return fallback;
  }
}

export function saveItem(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("Erro ao salvar", key, err);
    return false;
  }
}
