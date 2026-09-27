import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const TRACKER = "https://lopilol-visitor-ips.padapeis3mil.workers.dev/visit.js";
const OLD_TRACKER = /\s*<script\s+async\s+src="https:\/\/lopilol-visitor-ips\.padapeis3mil\.workers\.dev\/visit\.js\?page=[^"]*"><\/script>/g;
const EXCLUDED = new Set([".git", ".github", "_site", "node_modules", "scripts"]);

export function routeFor(relativePath) {
  const path = relativePath.split(sep).join("/");
  if (path === "index.html") return "/";
  if (path.endsWith("/index.html")) return `/${path.slice(0, -"index.html".length)}`;
  return `/${path}`;
}

export function buildSite(source, destination) {
  if (existsSync(destination)) throw new Error(`Destino já existe: ${destination}`);
  mkdirSync(destination, { recursive: true });

  function copyDirectory(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (directory === source && EXCLUDED.has(entry.name)) continue;
      if (entry.name.startsWith(".")) continue;
      const from = join(directory, entry.name);
      const to = join(destination, relative(source, from));
      if (entry.isDirectory()) {
        mkdirSync(to, { recursive: true });
        copyDirectory(from);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        const html = readFileSync(from, "utf8").replace(OLD_TRACKER, "");
        if (!/<\/body>/i.test(html)) throw new Error(`Página sem </body>: ${relative(source, from)}`);
        const page = encodeURIComponent(routeFor(relative(source, from)));
        const script = `  <script async src="${TRACKER}?page=${page}"></script>\n`;
        writeFileSync(to, html.replace(/<\/body>/i, `${script}</body>`), "utf8");
      } else if (entry.isFile()) {
        cpSync(from, to);
      }
    }
  }

  copyDirectory(source);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const source = process.cwd();
  buildSite(source, join(source, "_site"));
}
