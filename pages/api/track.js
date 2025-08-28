// pages/api/track.js
import crypto from "crypto";
import fs from "fs";
import path from "path";

// ===== Config da .env =====
const ALLOW_LIST = (process.env.TRACK_ALLOW_LIST || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const DENY_LIST = (process.env.TRACK_DENY_LIST || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const HMAC_SECRET = process.env.TRACK_HMAC_SECRET || "";
const LOG_TO_FILE = process.env.TRACK_LOG_TO_FILE === "1";

// ===== Rate Limit =====
const BUCKET = new Map();
const WINDOW_MS = 10_000; // 10s
const MAX_HITS = 30;

function limited(ip) {
  const now = Date.now();
  const b = BUCKET.get(ip) || { count: 0, ts: now };
  if (now - b.ts > WINDOW_MS) {
    BUCKET.set(ip, { count: 1, ts: now });
    return false;
  }
  b.count++;
  BUCKET.set(ip, b);
  return b.count > MAX_HITS;
}

// ===== Helpers =====
function addHeaders(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
}

function safeURL(raw) {
  if (!raw) return null;
  const s = raw.trim();
  if (s.startsWith("/")) return s;
  if (/^(javascript|data|vbscript):/i.test(s)) return null;
  if (!/^https?:\/\//i.test(s)) return "https://" + s;
  return s;
}

function hostnameOf(u) {
  try {
    return new URL(u).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function inAllow(host) {
  if (!ALLOW_LIST.length) return true;
  return ALLOW_LIST.some((d) => host === d || host.endsWith("." + d));
}

function inDeny(host) {
  return DENY_LIST.some((d) => host === d || host.endsWith("." + d));
}

function log(entry) {
  console.log("TRACK:", entry);
  if (LOG_TO_FILE) {
    try {
      const dir = path.join(process.cwd(), "logs");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(path.join(dir, "track.log"), JSON.stringify(entry) + "\n", "utf8");
    } catch {
      // su Vercel non persistente → ignora
    }
  }
}

function sign(value) {
  return crypto.createHmac("sha256", HMAC_SECRET).update(value).digest("hex");
}
function verify(value, sig) {
  if (!HMAC_SECRET) return true;
  return sign(value) === sig;
}

export default async function handler(req, res) {
  addHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).end();

  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
  if (limited(ip)) return res.status(429).json({ error: "Too Many Requests" });

  const { url = "", b64 = "", sig = "" } = req.query;

  // 1. Decodifica
  let raw = url.toString().trim();
  if (!raw && b64) {
    try {
      raw = Buffer.from(b64, "base64").toString("utf8");
    } catch {}
  }
  if (!raw) return res.redirect(302, "/");

  // 2. Firma HMAC opzionale
  if (!verify(raw, sig)) return res.status(400).json({ error: "Invalid signature" });

  // 3. Normalizza
  const finalUrl = safeURL(raw);
  if (!finalUrl) return res.redirect(302, "/");

  // 4. Blocca loop
  if (finalUrl.startsWith("/api/track")) return res.status(400).json({ error: "Loop detected" });

  let destination = finalUrl;

  // 5. Interno
  if (finalUrl.startsWith("/")) {
    // lascia interno
  } else {
    const host = hostnameOf(finalUrl);
    if (inDeny(host)) return res.redirect(302, "/");
    if (!inAllow(host)) return res.redirect(302, "/");
  }

  // 6. Log
  log({
    time: new Date().toISOString(),
    ip,
    ua: req.headers["user-agent"] || "",
    ref: req.headers["referer"] || "",
    target: destination,
  });

  // 7. Redirect finale
  res.writeHead(302, { Location: destination });
  res.end();
}
