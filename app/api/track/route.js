import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// ====================== CONFIG ======================
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

const BUCKET = new Map();
const WINDOW_MS = 10_000;
const MAX_HITS = 50;

// ====================== RATE LIMIT ======================
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

// ====================== HELPERS ======================
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

function sign(value) {
  return crypto.createHmac("sha256", HMAC_SECRET).update(value).digest("hex");
}
function verify(value, sig) {
  if (!HMAC_SECRET) return true;
  return sign(value) === sig;
}

function anonUser(ip, ua) {
  return crypto.createHash("sha256").update(ip + ua).digest("hex").slice(0, 16);
}

async function log(entry) {
  console.log("TRACK:", entry);
  if (LOG_TO_FILE) {
    try {
      const dir = path.join(process.cwd(), "logs");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.appendFile(path.join(dir, "track.log"), JSON.stringify(entry) + "\n", () => {});
    } catch {
      // su Vercel ignorato
    }
  }
}

// ====================== HANDLER (App Router) ======================
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const url = searchParams.get("url") || "";
  const b64 = searchParams.get("b64") || "";
  const sig = searchParams.get("sig") || "";
  const tab = searchParams.get("tab") || "generic";
  const title = searchParams.get("title") || "";
  const lang = searchParams.get("lang") || "it";

  // 1. Decode
  let raw = url.toString().trim();
  if (!raw && b64) {
    try {
      raw = Buffer.from(b64, "base64").toString("utf8");
    } catch {}
  }

  // Invalid → redirect home
  if (!raw || raw === "#" || raw.toLowerCase() === "null") {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // 2. Verify HMAC
  if (!verify(raw, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Normalize
  const finalUrl = safeURL(raw);
  if (!finalUrl || finalUrl === "#" || finalUrl === "https://") {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // 4. Prevent loops
  if (finalUrl.startsWith("/api/track")) {
    return NextResponse.json({ error: "Loop detected" }, { status: 400 });
  }

  // 5. Check allow/deny
  if (!finalUrl.startsWith("/")) {
    const host = hostnameOf(finalUrl);
    if (inDeny(host)) return NextResponse.redirect(new URL("/", req.url), 302);
    if (!inAllow(host)) return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // 6. Build log entry
  const ua = req.headers.get("user-agent") || "";
  const entry = {
    time: new Date().toISOString(),
    ip,
    ua,
    user: anonUser(ip, ua),
    ref: req.headers.get("referer") || "",
    target: finalUrl,
    tab,
    title,
    lang,
  };

  // 7. Async log
  log(entry);

  // 8. Redirect finale
  try {
    return NextResponse.redirect(finalUrl, 302);
  } catch {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
