// utils/getClientIp.js
// Captura o IP do cliente priorizando endereços IPv4 privados (LAN), como 192.168.x.x.
// Se estiver atrás de proxy, usa X-Forwarded-For (primeiro IP confiável).
// Normaliza formas tipo "::ffff:192.168.0.12" e remove portas ":12345" se aparecerem.

function getClientIp(req) {
  // 1. Colete todos os candidatos possíveis.
  const candidates = [];

  // a) X-Forwarded-For pode ter uma lista "ip1, ip2, ip3"
  const xff = req.headers?.["x-forwarded-for"];
  if (xff) {
    xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((ip) => candidates.push(ip));
  }

  // b) Express ip (requer trust proxy pra ser confiável atrás de proxy)
  if (req.ip) candidates.push(req.ip);

  // c) Low-level fallbacks
  if (req.connection?.remoteAddress)
    candidates.push(req.connection.remoteAddress);
  if (req.socket?.remoteAddress) candidates.push(req.socket.remoteAddress);
  if (req.connection?.socket?.remoteAddress)
    candidates.push(req.connection.socket.remoteAddress);

  // 2. Limpe e normalize cada candidato.
  const cleaned = candidates
    .map((raw) => normalizeAddress(raw))
    .filter(Boolean); // remove null/undefined

  if (cleaned.length === 0) return "unknown";

  // 3. Tente achar primeiro IP privado v4 (LAN) — o que você pediu: "quero 192.168..."
  const privateV4 = cleaned.find(isPrivateIPv4);
  if (privateV4) return privateV4;

  // 4. Senão, devolve o primeiro IP limpo.
  return cleaned[0];
}

/**
 * Normaliza IP:
 * - Remove prefixos IPv6-mapped "::ffff:"
 * - Se vier no formato "[::ffff:192.168.0.5]:1234" ou "192.168.0.5:1234", tira porta
 * - Remove colchetes []
 * - Retorna string IPv4 ou IPv6 plain; se não reconhecer, retorna null
 */
function normalizeAddress(addr) {
  if (!addr || typeof addr !== "string") return null;
  let ip = addr.trim();

  // Remove colchetes usados em IPv6 "[::1]"
  if (ip.startsWith("[") && ip.endsWith("]")) {
    ip = ip.slice(1, -1);
  }

  // Se tiver porta "ip:port" e NÃO for IPv6 legítimo (com múltiplos ":")
  // Ex: "192.168.0.5:54321" -> corta na primeira ":"
  // Para IPv6 + porta "[::1]:3000" já removemos colchetes acima; nesse caso vai sobrar "::1]:3000"? já tratado.
  // Vamos usar regex mais direta:
  const hostPortMatch = ip.match(/^(.*?)(?::\d+)?$/);
  if (hostPortMatch) {
    ip = hostPortMatch[1];
  }

  // Remove prefixo IPv6-mapped
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  // Caso venha algo como "::ffff:192.168.0.5"
  // (já coberto acima, mas garantimos)
  if (ip.includes("::ffff:")) {
    ip = ip.split("::ffff:").pop();
  }

  // Último trim
  ip = ip.trim();

  // Confirme se é IPv4 ou IPv6 plausível
  if (isIPv4(ip) || isIPv6(ip)) return ip;

  return null;
}

// -------- Helpers de validação -------- //

function isIPv4(ip) {
  // 0-255.0-255.0-255.0-255
  const m = ip.match(
    /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/
  );
  return !!m;
}

function isIPv6(ip) {
  // Checagem simples (não exaustiva) pra não travar
  // Aceita formas encurtadas
  return /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":");
}

function isPrivateIPv4(ip) {
  if (!isIPv4(ip)) return false;
  const [a, b] = ip.split(".").map(Number);

  // 10.0.0.0/8
  if (a === 10) return true;

  // 172.16.0.0 – 172.31.255.255
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;

  // localhost 127.x.x.x — às vezes útil (decide se quer tratar como privado)
  // Se quiser incluir, descomenta:
  // if (a === 127) return true;

  return false;
}

module.exports = { getClientIp, normalizeAddress, isPrivateIPv4 };
