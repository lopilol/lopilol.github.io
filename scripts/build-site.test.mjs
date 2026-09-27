import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { test } from "node:test";
import { buildSite, routeFor } from "./build-site.mjs";

test("build injects tracking into current and future routes once", () => {
  const root = mkdtempSync(join(tmpdir(), "lopilol-site-"));
  const source = join(root, "source");
  const output = join(root, "output");
  try {
    mkdirSync(join(source, "subahibi"), { recursive: true });
    mkdirSync(join(source, "chaos-head"), { recursive: true });
    writeFileSync(join(source, "index.html"), "<html><body>Home</body></html>");
    writeFileSync(join(source, "subahibi", "index.html"), "<html><body>Subahibi<script async src=\"https://lopilol-visitor-ips.padapeis3mil.workers.dev/visit.js?page=subahibi\"></script></body></html>");
    writeFileSync(join(source, "chaos-head", "index.html"), "<html><body>Outra VN</body></html>");
    buildSite(source, output);
    for (const [relativePath, page] of [["index.html", "%2F"], ["subahibi/index.html", "%2Fsubahibi%2F"], ["chaos-head/index.html", "%2Fchaos-head%2F"]]) {
      const html = readFileSync(join(output, relativePath), "utf8");
      assert.equal(html.match(/lopilol-visitor-ips/g)?.length, 1);
      assert.match(html, new RegExp(`visit\\.js\\?page=${page}`));
    }
    assert.equal(routeFor("arquivo.html"), "/arquivo.html");
  } finally {
    if (!root.startsWith(`${tmpdir()}${sep}`)) throw new Error("Destino temporário inesperado");
    rmSync(root, { recursive: true, force: true });
  }
});
