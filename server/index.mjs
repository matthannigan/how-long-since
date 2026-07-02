// Zero-dependency static server for the built PWA.
//
// "How Long Since" is a stateless static SPA — all user data lives in the
// browser's IndexedDB — so serving it needs nothing more than Node's built-ins.
// This mirrors galley's Node base (see the project's Docker docs) without pulling
// in a framework for a purely static payload.
//
// Responsibilities:
//   - GET /health -> 200 (drives the container HEALTHCHECK)
//   - serve dist/ with correct Content-Type and PWA-aware cache headers
//   - SPA fallback for client routes, without masking real asset 404s
//   - refuse path traversal and non-GET/HEAD methods

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT) || 3000;

// Content types for the file kinds this build actually emits. Getting JS right
// (text/javascript) matters — the app is served as ES modules.
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

// Two-bucket cache policy: content-hashed /assets/* can live forever; everything
// else (the shell, the service worker, the manifest) must revalidate so PWA
// updates always land. Never pin sw.js / index.html or users get stranded.
function cacheControl(pathname) {
  return pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache';
}

async function statFile(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile() ? info : null;
  } catch {
    return null;
  }
}

function send(req, res, filePath, info, pathname) {
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Content-Length': info.size,
    'Cache-Control': cacheControl(pathname),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
}

function fail(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('ok');
    return;
  }

  // Resolve to a file inside dist/, refusing any path that escapes it.
  const filePath = path.join(distDir, pathname === '/' ? '/index.html' : pathname);
  if (filePath !== distDir && !filePath.startsWith(distDir + path.sep)) {
    fail(res, 403, 'Forbidden');
    return;
  }

  const info = await statFile(filePath);
  if (info) {
    send(req, res, filePath, info, pathname);
    return;
  }

  // SPA fallback: an extensionless miss is a client route (/category, /time,
  // /settings, /tasks/<id>) -> serve the shell. A miss WITH an extension is a
  // real asset 404 (e.g. a renamed chunk) -> never hand back HTML for it.
  if (path.extname(pathname) === '') {
    const indexPath = path.join(distDir, 'index.html');
    const indexInfo = await statFile(indexPath);
    if (indexInfo) {
      send(req, res, indexPath, indexInfo, '/index.html');
      return;
    }
  }

  fail(res, 404, 'Not Found');
});

server.listen(port, () => {
  console.log(`How Long Since listening on http://localhost:${port}`);
});
