// serve.ts — tiny dev server for the Gobble & Gone game folder.
// Node standard library only. Serves game/ on http://localhost:8080
// (or --port N). Nothing is served outside game/, nothing is logged
// beyond the startup line. Run: `node serve.ts`
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
};

function portFromArgs() {
  const i = process.argv.indexOf('--port');
  const n = i === -1 ? NaN : Number(process.argv[i + 1]);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : 8080;
}

const port = portFromArgs();

createServer((req, res) => {
  const raw = new URL(req.url || '/', 'http://localhost').pathname;
  let path = decodeURIComponent(raw);
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(join(root, path));
  const inside = file === root || file.startsWith(root + sep);
  if (!inside || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(inside ? 404 : 403);
    res.end(inside ? 'not found' : 'forbidden');
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
    'content-length': statSync(file).size,
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => {
  console.log(`Gobble & Gone is on http://localhost:${port}`);
});
