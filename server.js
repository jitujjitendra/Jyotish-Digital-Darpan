"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const engine = require("./astro-engine");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const CONTACT_LOG = path.join(DATA_DIR, "contact-messages.jsonl");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(body, null, 2));
}

function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function safeStaticPath(pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const normalized = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, normalized);
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

function serveStatic(req, res, pathname) {
  const filePath = safeStaticPath(pathname);
  if (!filePath) {
    notFound(res);
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      notFound(res);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        status: "ok",
        engine: "local-jyotish-engine",
        thirdPartyApis: false
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/horoscope/daily") {
      sendJson(res, 200, engine.dailyHoroscope({
        sign: url.searchParams.get("sign") || "Aries",
        date: url.searchParams.get("date") || undefined,
        place: url.searchParams.get("place") || "Delhi"
      }));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/panchang") {
      sendJson(res, 200, engine.panchang({
        date: url.searchParams.get("date") || undefined,
        place: url.searchParams.get("place") || "Delhi"
      }));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/blog") {
      sendJson(res, 200, engine.blog({ topic: url.searchParams.get("topic") || "Moon Signs" }));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/kundli") {
      const body = await readBody(req);
      sendJson(res, 200, engine.generateKundli(body));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/matchmaking") {
      const body = await readBody(req);
      sendJson(res, 200, engine.matchmaking(body));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/ask") {
      const body = await readBody(req);
      sendJson(res, 200, engine.askAstrologer(body));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/contact") {
      const body = await readBody(req);
      const response = engine.contact(body);
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.appendFileSync(CONTACT_LOG, JSON.stringify({
          createdAt: new Date().toISOString(),
          ...response
        }) + "\n", "utf8");
        response.saved = true;
      } catch (error) {
        response.saved = false;
        response.storageNote = "Message accepted, but local file logging is unavailable in the current sandbox.";
      }
      sendJson(res, 200, response);
      return;
    }

    notFound(res);
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Request failed" });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url);
    return;
  }
  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Jyotish Digital Darpan running at http://localhost:${PORT}`);
});
