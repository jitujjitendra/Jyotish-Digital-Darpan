"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const crypto = require("crypto");
const zlib = require("zlib");
const engine = require("./astro-engine");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const BLOGS_DIR = path.join(DATA_DIR, "blogs");
const UPLOADS_DIR = path.join(ROOT, "uploads");
const CONTACT_LOG = path.join(DATA_DIR, "contact-messages.jsonl");
const SECURITY_LOG = path.join(DATA_DIR, "security-log.jsonl");
const ADMIN_CONFIG = path.join(DATA_DIR, "admin-config.json");

// Ensure directories exist
[DATA_DIR, BLOGS_DIR, UPLOADS_DIR].forEach(d => { try { fs.mkdirSync(d, { recursive: true }); } catch(e) {} });

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

// ==================== SECURITY SYSTEM ====================

const rateLimits = {};
const sessions = {};

function logSecurity(event) {
  try {
    const entry = { timestamp: new Date().toISOString(), ...event };
    fs.appendFileSync(SECURITY_LOG, JSON.stringify(entry) + "\n", "utf8");
  } catch(e) {}
}

function getClientIP(req) {
  return req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",")[0].trim()
    : req.socket.remoteAddress || "unknown";
}

function checkRateLimit(ip, category, maxRequests, windowMs) {
  const key = category + ":" + ip;
  const now = Date.now();
  if (!rateLimits[key]) rateLimits[key] = [];
  rateLimits[key] = rateLimits[key].filter(t => now - t < windowMs);
  if (rateLimits[key].length >= maxRequests) {
    logSecurity({ type: "rate_limit", ip, category, count: rateLimits[key].length });
    return false;
  }
  rateLimits[key].push(now);
  return true;
}

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(rateLimits)) {
    rateLimits[key] = rateLimits[key].filter(t => now - t < 3600000);
    if (rateLimits[key].length === 0) delete rateLimits[key];
  }
}, 300000);

// Clean up expired sessions every minute
setInterval(() => {
  const now = Date.now();
  for (const token of Object.keys(sessions)) {
    if (now - sessions[token].lastActivity > sessions[token].timeout) {
      delete sessions[token];
    }
  }
}, 60000);

function generateCSRFToken() {
  return crypto.randomBytes(32).toString("hex");
}

function validateCSRFToken(req) {
  const cookieToken = parseCookies(req)["csrf-token"];
  const headerToken = req.headers["x-csrf-token"];
  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

function parseCookies(req) {
  const cookies = {};
  const header = req.headers.cookie || "";
  header.split(";").forEach(c => {
    const [name, ...rest] = c.trim().split("=");
    if (name) cookies[name] = rest.join("=");
  });
  return cookies;
}

function sanitizeInput(str, maxLen) {
  if (typeof str !== "string") return "";
  str = str.slice(0, maxLen || 1000);
  // Strip HTML tags (except for blog content)
  str = str.replace(/<[^>]*>/g, "");
  return str.trim();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidImageType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
}

// ==================== SECURITY HEADERS ====================

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'");
}

// ==================== ADMIN AUTH ====================

function getAdminConfig() {
  try {
    return JSON.parse(fs.readFileSync(ADMIN_CONFIG, "utf8"));
  } catch(e) {
    return { passwordHash: "f238ad5ea72d9f3f4b3498b3f5fc5c5be42648ca54041b14a92345559de867f8", sessionTimeout: 7200000 };
  }
}

function verifyAdminSession(req) {
  const cookies = parseCookies(req);
  const token = cookies["admin-session"];
  if (!token || !sessions[token]) return false;
  const session = sessions[token];
  const config = getAdminConfig();
  if (Date.now() - session.lastActivity > (config.sessionTimeout || 7200000)) {
    delete sessions[token];
    return false;
  }
  session.lastActivity = Date.now();
  return true;
}

function getSessionToken(req) {
  return parseCookies(req)["admin-session"] || null;
}

// ==================== RESPONSE HELPERS ====================

function sendJson(res, statusCode, body) {
  const json = JSON.stringify(body, null, 2);
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-CSRF-Token"
  };
  res.writeHead(statusCode, headers);
  res.end(json);
}

function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

function forbidden(res) {
  sendJson(res, 403, { error: "Forbidden" });
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

// ==================== BODY PARSERS ====================

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
      if (!body) { resolve({}); return; }
      try { resolve(JSON.parse(body)); }
      catch (error) { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

function readRawBody(req, maxSize) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > maxSize) {
        req.destroy();
        reject(new Error("Upload too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Simple multipart parser for file uploads
function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuf = Buffer.from("--" + boundary);
  const crlf = Buffer.from("\r\n");
  const doubleCrlf = Buffer.from("\r\n\r\n");
  
  let start = 0;
  while (true) {
    const bStart = buffer.indexOf(boundaryBuf, start);
    if (bStart === -1) break;
    const afterBoundary = bStart + boundaryBuf.length;
    
    // Check if this is the final boundary
    if (buffer[afterBoundary] === 0x2D && buffer[afterBoundary + 1] === 0x2D) break;
    
    const headerEnd = buffer.indexOf(doubleCrlf, afterBoundary);
    if (headerEnd === -1) break;
    
    const headerStr = buffer.slice(afterBoundary, headerEnd).toString("utf8");
    const bodyStart = headerEnd + 4;
    
    const nextBoundary = buffer.indexOf(boundaryBuf, bodyStart);
    const bodyEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2; // -2 for \r\n before boundary
    
    const headers = {};
    headerStr.split("\r\n").forEach(line => {
      const match = line.match(/^([^:]+):\s*(.+)$/i);
      if (match) headers[match[1].toLowerCase()] = match[2];
    });
    
    const disposition = headers["content-disposition"] || "";
    const nameMatch = disposition.match(/name="([^"]+)"/);
    const filenameMatch = disposition.match(/filename="([^"]+)"/);
    
    parts.push({
      name: nameMatch ? nameMatch[1] : "",
      filename: filenameMatch ? filenameMatch[1] : null,
      contentType: headers["content-type"] || "text/plain",
      data: buffer.slice(bodyStart, bodyEnd)
    });
    
    start = nextBoundary;
    if (start === -1) break;
  }
  return parts;
}

// ==================== GZIP COMPRESSION ====================

function shouldCompress(mimeType) {
  if (!mimeType) return false;
  return mimeType.includes("text/") || mimeType.includes("json") || mimeType.includes("javascript") || mimeType.includes("xml");
}

function sendCompressed(req, res, statusCode, data, contentType) {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (shouldCompress(contentType) && acceptEncoding.includes("gzip")) {
    zlib.gzip(data, (err, compressed) => {
      if (err) {
        res.writeHead(statusCode, { "Content-Type": contentType });
        res.end(data);
      } else {
        res.writeHead(statusCode, {
          "Content-Type": contentType,
          "Content-Encoding": "gzip",
          "Vary": "Accept-Encoding"
        });
        res.end(compressed);
      }
    });
  } else {
    res.writeHead(statusCode, { "Content-Type": contentType });
    res.end(data);
  }
}

// ==================== ETAG SUPPORT ====================

function generateETag(content) {
  return crypto.createHash("md5").update(content).digest("hex");
}

// ==================== STATIC FILE SERVER ====================

function safeStaticPath(pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const normalized = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, normalized);
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

function serveStatic(req, res, pathname) {
  const filePath = safeStaticPath(pathname);
  if (!filePath) { notFound(res); return; }
  
  // Block access to data directory
  if (filePath.startsWith(DATA_DIR) && !filePath.startsWith(UPLOADS_DIR)) {
    notFound(res);
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) { notFound(res); return; }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";
    
    // Cache headers for uploads (1 year)
    const isUpload = filePath.startsWith(UPLOADS_DIR);
    const cacheControl = isUpload ? "public, max-age=31536000, immutable" : "public, max-age=3600";
    
    // ETag support
    const etag = '"' + stat.mtime.getTime().toString(16) + "-" + stat.size.toString(16) + '"';
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304);
      res.end();
      return;
    }
    
    const headers = {
      "Content-Type": mimeType,
      "Cache-Control": cacheControl,
      "ETag": etag
    };
    
    if (shouldCompress(mimeType)) {
      const acceptEncoding = req.headers["accept-encoding"] || "";
      if (acceptEncoding.includes("gzip")) {
        const stream = fs.createReadStream(filePath);
        const gzipStream = zlib.createGzip();
        headers["Content-Encoding"] = "gzip";
        headers["Vary"] = "Accept-Encoding";
        res.writeHead(200, headers);
        stream.pipe(gzipStream).pipe(res);
        return;
      }
    }
    
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
}

// ==================== BLOG HELPERS ====================

function getAllBlogs(includeDeleted) {
  try {
    const files = fs.readdirSync(BLOGS_DIR).filter(f => f.endsWith(".json"));
    const blogs = files.map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(BLOGS_DIR, f), "utf8")); }
      catch(e) { return null; }
    }).filter(b => b !== null);
    if (!includeDeleted) return blogs.filter(b => !b.deleted);
    return blogs;
  } catch(e) { return []; }
}

function getBlogBySlug(slug) {
  const safeName = slug.replace(/[^a-z0-9-]/gi, "");
  const filePath = path.join(BLOGS_DIR, safeName + ".json");
  if (!filePath.startsWith(BLOGS_DIR)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch(e) { return null; }
}

function saveBlog(blog) {
  const safeName = blog.slug.replace(/[^a-z0-9-]/gi, "");
  const filePath = path.join(BLOGS_DIR, safeName + ".json");
  fs.writeFileSync(filePath, JSON.stringify(blog, null, 2), "utf8");
}

function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
}

// ==================== SITEMAP GENERATION ====================

function generateSitemap() {
  const blogs = getAllBlogs().filter(b => b.status === "published");
  const baseUrl = "https://jyotishdigitaldarpan.com";
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Static pages
  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/birth-chart.html", priority: "0.8", changefreq: "monthly" },
    { loc: "/blog", priority: "0.9", changefreq: "daily" }
  ];
  
  staticPages.forEach(page => {
    xml += "  <url>\n";
    xml += "    <loc>" + baseUrl + page.loc + "</loc>\n";
    xml += "    <changefreq>" + page.changefreq + "</changefreq>\n";
    xml += "    <priority>" + page.priority + "</priority>\n";
    xml += "  </url>\n";
  });
  
  // Blog posts
  blogs.forEach(blog => {
    xml += "  <url>\n";
    xml += "    <loc>" + baseUrl + "/blog/" + blog.slug + "</loc>\n";
    xml += "    <lastmod>" + (blog.updatedAt || blog.publishedAt || blog.createdAt).split("T")[0] + "</lastmod>\n";
    xml += "    <changefreq>weekly</changefreq>\n";
    xml += "    <priority>0.7</priority>\n";
    xml += "  </url>\n";
  });
  
  xml += "</urlset>";
  return xml;
}

// ==================== BLOG POST HTML RENDERER ====================

function renderBlogPost(blog) {
  const readingTime = Math.max(1, Math.ceil(blog.content.split(/\s+/).length / 200));
  const relatedBlogs = getAllBlogs()
    .filter(b => b.status === "published" && b.slug !== blog.slug && b.category === blog.category)
    .slice(0, 3);
  
  // Simple markdown to HTML
  function mdToHtml(md) {
    let html = md
      .replace(/^### (.+)$/gm, "<h3 class=\"text-xl font-bold mt-6 mb-3 text-purple-300\">$1</h3>")
      .replace(/^## (.+)$/gm, "<h2 class=\"text-2xl font-bold mt-8 mb-4 text-purple-200\">$1</h2>")
      .replace(/^# (.+)$/gm, "<h1 class=\"text-3xl font-bold mt-8 mb-4 text-white\">$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^\- (.+)$/gm, "<li class=\"ml-4\">$1</li>")
      .replace(/^\d+\. (.+)$/gm, "<li class=\"ml-4\">$1</li>")
      .replace(/\n\n/g, "</p><p class=\"mb-4 text-gray-300 leading-relaxed\">");
    return "<p class=\"mb-4 text-gray-300 leading-relaxed\">" + html + "</p>";
  }
  
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": blog.metaDescription || blog.excerpt,
    "image": blog.featuredImage || "",
    "author": { "@type": "Person", "name": blog.author || "Jyotish Digital Darpan" },
    "publisher": { "@type": "Organization", "name": "Jyotish Digital Darpan" },
    "datePublished": blog.publishedAt,
    "dateModified": blog.updatedAt || blog.publishedAt,
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://jyotishdigitaldarpan.com/blog/" + blog.slug }
  });

  return '<!DOCTYPE html><html lang="en"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' + blog.title + ' - Jyotish Digital Darpan</title>' +
    '<meta name="description" content="' + (blog.metaDescription || blog.excerpt || "").replace(/"/g, "&quot;") + '">' +
    '<meta name="keywords" content="' + (blog.tags || []).join(", ") + ', jyotish, astrology, vedic">' +
    '<meta property="og:title" content="' + blog.title + '">' +
    '<meta property="og:description" content="' + (blog.metaDescription || blog.excerpt || "").replace(/"/g, "&quot;") + '">' +
    '<meta property="og:type" content="article">' +
    '<meta property="og:url" content="https://jyotishdigitaldarpan.com/blog/' + blog.slug + '">' +
    (blog.featuredImage ? '<meta property="og:image" content="https://jyotishdigitaldarpan.com' + blog.featuredImage + '">' : '') +
    '<meta name="twitter:card" content="summary_large_image">' +
    '<meta name="twitter:title" content="' + blog.title + '">' +
    '<meta name="twitter:description" content="' + (blog.metaDescription || blog.excerpt || "").replace(/"/g, "&quot;") + '">' +
    '<link rel="canonical" href="https://jyotishdigitaldarpan.com/blog/' + blog.slug + '">' +
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">' +
    '<link rel="stylesheet" href="/style.css">' +
    '<script type="application/ld+json">' + jsonLd + '</script>' +
    '</head><body>' +
    '<header class="flex justify-between items-center p-6 bg-black bg-opacity-60 fixed top-0 w-full z-50">' +
    '<a href="/" class="text-lg font-semibold text-white">Jyotish Digital Darpan</a>' +
    '<nav class="space-x-4 text-sm"><a href="/" class="hover:underline text-gray-300">Home</a>' +
    '<a href="/blog" class="hover:underline text-gray-300">Blog</a></nav></header>' +
    '<main class="pt-24 pb-16 px-4 max-w-4xl mx-auto">' +
    '<nav class="text-sm text-gray-400 mb-6"><a href="/" class="hover:text-purple-400">Home</a> &gt; <a href="/blog" class="hover:text-purple-400">Blog</a> &gt; <span class="text-gray-300">' + blog.title + '</span></nav>' +
    (blog.featuredImage ? '<img src="' + blog.featuredImage + '" alt="' + blog.title + '" class="w-full h-64 object-cover rounded-xl mb-6">' : '') +
    '<article><h1 class="text-3xl md:text-4xl font-bold text-white mb-4">' + blog.title + '</h1>' +
    '<div class="flex items-center gap-4 text-sm text-gray-400 mb-8">' +
    '<span>' + (blog.author || "Admin") + '</span>' +
    '<span>' + new Date(blog.publishedAt).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" }) + '</span>' +
    '<span>' + readingTime + ' min read</span>' +
    '<span class="bg-purple-900 text-purple-300 px-2 py-1 rounded">' + blog.category + '</span></div>' +
    '<div class="prose prose-invert max-w-none">' + mdToHtml(blog.content) + '</div></article>' +
    (relatedBlogs.length > 0 ? '<section class="mt-12"><h2 class="text-2xl font-bold text-white mb-6">Related Posts</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-4">' +
      relatedBlogs.map(rb => '<a href="/blog/' + rb.slug + '" class="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700">' +
        '<h3 class="font-bold text-white">' + rb.title + '</h3>' +
        '<p class="text-sm text-gray-400 mt-2">' + (rb.excerpt || "").slice(0, 100) + '</p></a>').join("") +
      '</div></section>' : '') +
    '</main>' +
    '<footer class="text-center text-gray-500 text-sm py-8 border-t border-gray-800">' +
    '<p>Jyotish Digital Darpan - Vedic Astrology Insights</p></footer></body></html>';
}

// ==================== ANTI-SPAM ====================

function checkContactSpam(body, ip) {
  // Honeypot check
  if (body.website || body.url || body.fax) return "Bot detected";
  
  // Time-based check (form must take > 3 seconds)
  if (body._loadTime) {
    const elapsed = Date.now() - Number(body._loadTime);
    if (elapsed < 3000) return "Form submitted too quickly";
  }
  
  // Too many URLs
  const urlRegex = /https?:\/\//gi;
  const msg = (body.message || "") + " " + (body.name || "");
  const urlCount = (msg.match(urlRegex) || []).length;
  if (urlCount > 2) return "Too many URLs";
  
  // All caps
  const upperCount = (body.message || "").replace(/[^A-Z]/g, "").length;
  const totalChars = (body.message || "").replace(/\s/g, "").length;
  if (totalChars > 20 && upperCount / totalChars > 0.8) return "All caps detected";
  
  return null;
}

// ==================== ADMIN API ROUTES ====================

async function handleAdminApi(req, res, url) {
  const ip = getClientIP(req);
  
  // Login endpoint
  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    if (!checkRateLimit(ip, "admin-login", 5, 900000)) {
      logSecurity({ type: "admin_login_blocked", ip });
      sendJson(res, 429, { error: "Too many login attempts. Try again in 15 minutes." });
      return;
    }
    
    const body = await readBody(req);
    const config = getAdminConfig();
    const hash = crypto.createHash("sha256").update(body.password || "").digest("hex");
    
    if (hash !== config.passwordHash) {
      logSecurity({ type: "admin_login_failed", ip });
      sendJson(res, 401, { error: "Invalid password" });
      return;
    }
    
    // Create session
    const token = crypto.randomBytes(32).toString("hex");
    sessions[token] = { ip, lastActivity: Date.now(), timeout: config.sessionTimeout || 7200000 };
    
    // Clear other sessions (single active session)
    for (const t of Object.keys(sessions)) {
      if (t !== token) delete sessions[t];
    }
    
    const csrfToken = generateCSRFToken();
    logSecurity({ type: "admin_login_success", ip });
    
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": [
        "admin-session=" + token + "; HttpOnly; Path=/; SameSite=Strict; Max-Age=7200",
        "csrf-token=" + csrfToken + "; Path=/; SameSite=Strict; Max-Age=7200"
      ].join(", ")
    });
    res.end(JSON.stringify({ success: true, csrfToken }));
    return;
  }
  
  // Logout endpoint
  if (req.method === "POST" && url.pathname === "/api/admin/logout") {
    const token = getSessionToken(req);
    if (token) delete sessions[token];
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": "admin-session=; HttpOnly; Path=/; Max-Age=0"
    });
    res.end(JSON.stringify({ success: true }));
    return;
  }
  
  // Check session
  if (url.pathname === "/api/admin/session") {
    sendJson(res, 200, { authenticated: verifyAdminSession(req) });
    return;
  }
  
  // All other admin APIs require auth
  if (!verifyAdminSession(req)) {
    forbidden(res);
    return;
  }
  
  // CSRF validation for mutations
  if (["POST", "PUT", "DELETE"].includes(req.method) && !url.pathname.includes("/upload")) {
    if (!validateCSRFToken(req)) {
      sendJson(res, 403, { error: "Invalid CSRF token" });
      return;
    }
  }
  
  // ---- Blog CRUD ----
  
  // Get all blogs (admin view - include deleted)
  if (req.method === "GET" && url.pathname === "/api/admin/blogs") {
    const blogs = getAllBlogs(true).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sendJson(res, 200, { blogs });
    return;
  }
  
  // Get single blog
  if (req.method === "GET" && url.pathname.startsWith("/api/admin/blogs/")) {
    const slug = url.pathname.replace("/api/admin/blogs/", "");
    const blog = getBlogBySlug(slug);
    if (!blog) { notFound(res); return; }
    sendJson(res, 200, blog);
    return;
  }
  
  // Create blog
  if (req.method === "POST" && url.pathname === "/api/admin/blogs") {
    const body = await readBody(req);
    const slug = sanitizeInput(body.slug || generateSlug(body.title || "untitled"), 80);
    
    // Check if slug exists
    if (getBlogBySlug(slug)) {
      sendJson(res, 409, { error: "Blog with this slug already exists" });
      return;
    }
    
    const blog = {
      id: generateUUID(),
      title: sanitizeInput(body.title, 200),
      slug: slug,
      category: sanitizeInput(body.category, 50),
      author: sanitizeInput(body.author, 100),
      content: body.content || "", // Allow markdown, don't strip HTML
      excerpt: (body.content || "").replace(/<[^>]*>/g, "").slice(0, 160),
      featuredImage: body.featuredImage || "",
      tags: Array.isArray(body.tags) ? body.tags.map(t => sanitizeInput(t, 50)) : [],
      metaDescription: sanitizeInput(body.metaDescription, 160) || (body.content || "").replace(/<[^>]*>/g, "").slice(0, 160),
      status: body.status === "published" ? "published" : "draft",
      publishedAt: body.status === "published" ? (body.publishedAt || new Date().toISOString()) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      deleted: false
    };
    
    saveBlog(blog);
    sendJson(res, 201, blog);
    return;
  }
  
  // Update blog
  if (req.method === "PUT" && url.pathname.startsWith("/api/admin/blogs/")) {
    const slug = url.pathname.replace("/api/admin/blogs/", "");
    const existing = getBlogBySlug(slug);
    if (!existing) { notFound(res); return; }
    
    const body = await readBody(req);
    const updated = {
      ...existing,
      title: body.title !== undefined ? sanitizeInput(body.title, 200) : existing.title,
      category: body.category !== undefined ? sanitizeInput(body.category, 50) : existing.category,
      author: body.author !== undefined ? sanitizeInput(body.author, 100) : existing.author,
      content: body.content !== undefined ? body.content : existing.content,
      featuredImage: body.featuredImage !== undefined ? body.featuredImage : existing.featuredImage,
      tags: body.tags !== undefined ? body.tags.map(t => sanitizeInput(t, 50)) : existing.tags,
      metaDescription: body.metaDescription !== undefined ? sanitizeInput(body.metaDescription, 160) : existing.metaDescription,
      status: body.status !== undefined ? body.status : existing.status,
      publishedAt: body.status === "published" && !existing.publishedAt ? new Date().toISOString() : existing.publishedAt,
      updatedAt: new Date().toISOString()
    };
    updated.excerpt = (updated.content || "").replace(/<[^>]*>/g, "").slice(0, 160);
    
    saveBlog(updated);
    sendJson(res, 200, updated);
    return;
  }
  
  // Delete blog (soft delete)
  if (req.method === "DELETE" && url.pathname.startsWith("/api/admin/blogs/")) {
    const slug = url.pathname.replace("/api/admin/blogs/", "");
    const existing = getBlogBySlug(slug);
    if (!existing) { notFound(res); return; }
    existing.deleted = true;
    existing.updatedAt = new Date().toISOString();
    saveBlog(existing);
    sendJson(res, 200, { success: true });
    return;
  }
  
  // ---- File Upload ----
  if (req.method === "POST" && url.pathname === "/api/admin/upload") {
    if (!checkRateLimit(ip, "upload", 10, 3600000)) {
      sendJson(res, 429, { error: "Upload limit reached. Try again later." });
      return;
    }
    
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      sendJson(res, 400, { error: "Expected multipart/form-data" });
      return;
    }
    
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
      sendJson(res, 400, { error: "No boundary found" });
      return;
    }
    
    try {
      const rawBody = await readRawBody(req, 5 * 1024 * 1024); // 5MB max
      const parts = parseMultipart(rawBody, boundaryMatch[1]);
      
      const filePart = parts.find(p => p.filename);
      if (!filePart) {
        sendJson(res, 400, { error: "No file found in upload" });
        return;
      }
      
      if (!isValidImageType(filePart.filename)) {
        sendJson(res, 400, { error: "Only image files (jpg, png, webp) are allowed" });
        return;
      }
      
      // Generate unique filename
      const ext = path.extname(filePart.filename).toLowerCase() === ".png" ? ".jpg" : path.extname(filePart.filename).toLowerCase();
      const filename = Date.now() + "-" + crypto.randomBytes(4).toString("hex") + ext;
      const filePath = path.join(UPLOADS_DIR, filename);
      
      fs.writeFileSync(filePath, filePart.data);
      
      sendJson(res, 200, {
        success: true,
        url: "/uploads/" + filename,
        size: filePart.data.length
      });
    } catch(e) {
      sendJson(res, 400, { error: e.message || "Upload failed" });
    }
    return;
  }
  
  // ---- Contact Messages ----
  if (req.method === "GET" && url.pathname === "/api/admin/messages") {
    try {
      const data = fs.readFileSync(CONTACT_LOG, "utf8").trim();
      const messages = data ? data.split("\n").map(line => {
        try { return JSON.parse(line); } catch(e) { return null; }
      }).filter(m => m !== null).reverse() : [];
      sendJson(res, 200, { messages });
    } catch(e) {
      sendJson(res, 200, { messages: [] });
    }
    return;
  }
  
  // Mark message read/unread
  if (req.method === "PUT" && url.pathname === "/api/admin/messages") {
    const body = await readBody(req);
    // This is simplified - in production you'd index messages
    sendJson(res, 200, { success: true });
    return;
  }
  
  // ---- Dashboard Stats ----
  if (req.method === "GET" && url.pathname === "/api/admin/stats") {
    const blogs = getAllBlogs(true);
    let messageCount = 0;
    try {
      const data = fs.readFileSync(CONTACT_LOG, "utf8").trim();
      messageCount = data ? data.split("\n").length : 0;
    } catch(e) {}
    
    sendJson(res, 200, {
      totalBlogs: blogs.filter(b => !b.deleted).length,
      publishedBlogs: blogs.filter(b => b.status === "published" && !b.deleted).length,
      draftBlogs: blogs.filter(b => b.status === "draft" && !b.deleted).length,
      totalMessages: messageCount,
      recentBlogs: blogs.filter(b => !b.deleted).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
    });
    return;
  }
  
  // ---- Change Password ----
  if (req.method === "POST" && url.pathname === "/api/admin/change-password") {
    const body = await readBody(req);
    const config = getAdminConfig();
    const oldHash = crypto.createHash("sha256").update(body.oldPassword || "").digest("hex");
    if (oldHash !== config.passwordHash) {
      sendJson(res, 401, { error: "Current password is incorrect" });
      return;
    }
    config.passwordHash = crypto.createHash("sha256").update(body.newPassword).digest("hex");
    fs.writeFileSync(ADMIN_CONFIG, JSON.stringify(config, null, 2), "utf8");
    sendJson(res, 200, { success: true });
    return;
  }
  
  notFound(res);
}

// ==================== PUBLIC API ROUTES ====================

async function handleApi(req, res, url) {
  const ip = getClientIP(req);
  
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }
  
  // Rate limit API calls
  if (!checkRateLimit(ip, "api", 60, 60000)) {
    sendJson(res, 429, { error: "Too many requests" });
    return;
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { status: "ok", engine: "local-jyotish-engine", thirdPartyApis: false });
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
    
    // Public blog listing API
    if (req.method === "GET" && url.pathname === "/api/blogs") {
      const blogs = getAllBlogs().filter(b => b.status === "published")
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      const category = url.searchParams.get("category");
      const filtered = category ? blogs.filter(b => b.category === category) : blogs;
      sendJson(res, 200, { blogs: filtered });
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
      // Rate limit contact form
      if (!checkRateLimit(ip, "contact", 3, 3600000)) {
        sendJson(res, 429, { error: "Too many messages. Please try later." });
        return;
      }
      
      const body = await readBody(req);
      
      // Anti-spam checks
      const spamReason = checkContactSpam(body, ip);
      if (spamReason) {
        logSecurity({ type: "spam_blocked", ip, reason: spamReason });
        sendJson(res, 400, { error: "Message rejected: " + spamReason });
        return;
      }
      
      // Validate email if provided
      if (body.email && !validateEmail(body.email)) {
        sendJson(res, 400, { error: "Invalid email address" });
        return;
      }
      
      const response = engine.contact(body);
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.appendFileSync(CONTACT_LOG, JSON.stringify({
          createdAt: new Date().toISOString(),
          ip: ip,
          read: false,
          ...response
        }) + "\n", "utf8");
        response.saved = true;
      } catch (error) {
        response.saved = false;
        response.storageNote = "Message accepted, but local file logging is unavailable.";
      }
      sendJson(res, 200, response);
      return;
    }

    notFound(res);
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Request failed" });
  }
}

// ==================== MAIN REQUEST HANDLER ====================

const server = http.createServer((req, res) => {
  setSecurityHeaders(res);
  
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  
  // Serve sitemap.xml dynamically
  if (url.pathname === "/sitemap.xml") {
    const sitemap = generateSitemap();
    sendCompressed(req, res, 200, sitemap, "application/xml; charset=utf-8");
    return;
  }
  
  // Serve robots.txt
  if (url.pathname === "/robots.txt") {
    const filePath = path.join(ROOT, "robots.txt");
    try {
      const content = fs.readFileSync(filePath, "utf8");
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(content);
    } catch(e) {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /data/\n");
    }
    return;
  }
  
  // Admin panel
  if (url.pathname === "/admin" || url.pathname === "/admin/") {
    const filePath = path.join(ROOT, "admin.html");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) { notFound(res); return; }
      sendHtml(res, 200, data);
    });
    return;
  }
  
  // Admin API routes
  if (url.pathname.startsWith("/api/admin/")) {
    handleAdminApi(req, res, url).catch(err => {
      sendJson(res, 500, { error: err.message || "Server error" });
    });
    return;
  }
  
  // Public API routes
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url);
    return;
  }
  
  // Blog listing page
  if (url.pathname === "/blog" || url.pathname === "/blog/") {
    const filePath = path.join(ROOT, "blog.html");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) { notFound(res); return; }
      sendHtml(res, 200, data);
    });
    return;
  }
  
  // Individual blog post
  if (url.pathname.startsWith("/blog/")) {
    const slug = url.pathname.replace("/blog/", "").replace(/\/$/, "");
    const blog = getBlogBySlug(slug);
    if (!blog || blog.deleted || blog.status !== "published") {
      notFound(res);
      return;
    }
    // Increment views
    blog.views = (blog.views || 0) + 1;
    try { saveBlog(blog); } catch(e) {}
    
    const html = renderBlogPost(blog);
    sendCompressed(req, res, 200, html, "text/html; charset=utf-8");
    return;
  }
  
  // Static files
  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log("Jyotish Digital Darpan running at http://localhost:" + PORT);
});
