import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDirectory, "../dist/client");
const basePath = "/clipboard-router-releases";

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const host = argument("host", "127.0.0.1");
const port = Number.parseInt(argument("port", "4173"), 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("Preview port must be an integer from 1 to 65535.");
}

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

async function existingFile(pathname) {
  const requested = resolve(root, `.${pathname}`);
  if (requested !== root && !requested.startsWith(`${root}${sep}`)) return null;
  try {
    return (await stat(requested)).isFile() ? requested : null;
  } catch {
    return null;
  }
}

await stat(resolve(root, "index.html")).catch(() => {
  throw new Error("Production preview is missing. Run `npm run build` first.");
});

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${host}:${port}`);
    const decodedPath = decodeURIComponent(url.pathname);
    const pathname = decodedPath === basePath || decodedPath.startsWith(`${basePath}/`)
      ? decodedPath.slice(basePath.length) || "/"
      : decodedPath;
    const file = (await existingFile(pathname)) ?? resolve(root, "index.html");
    const body = await readFile(file);
    response.writeHead(200, {
      "Cache-Control": file.endsWith("index.html") ? "no-store" : "public, max-age=3600",
      "Content-Length": body.byteLength,
      "Content-Type": contentTypes.get(extname(file).toLowerCase()) ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Preview server error");
  }
});

server.listen(port, host, () => {
  console.log(`Local production preview: http://${host}:${port}/`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
