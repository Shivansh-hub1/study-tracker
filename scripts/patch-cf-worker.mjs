// Fixes vercel@66.6.0 override where "/_next/static/not-found.txt" (path: "") overwrites "/" in _worker.js/index.js.
// Also ensures _worker.js is excluded from Cloudflare Workers static assets upload.
import fs from "node:fs";
import path from "node:path";

export function patchWorkerSource(src) {
  const target = '"/":{type:"override",path:"/_next/static/not-found.txt"';
  const start = src.indexOf(target);
  if (start === -1) return { patched: false, code: src };

  const openBrace = src.indexOf("{", start);
  let depth = 0;
  let quote = null;
  let end = -1;

  for (let i = openBrace; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (ch === "\\") { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) { end = i; break; }
  }

  if (end === -1) throw new Error("Unbalanced braces while patching '/' route");

  const rscMatch = src.match(/"\/index\.rsc":\{type:"function",entrypoint:"([^"]+)"\}/);
  const entrypoint = rscMatch?.[1] || "__next-on-pages-dist__/functions/index.func.js";
  const replacement = `"/":{type:"function",entrypoint:${JSON.stringify(entrypoint)}}`;

  return {
    patched: true,
    code: src.slice(0, start) + replacement + src.slice(end + 1),
  };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("patch-cf-worker.mjs")) {
  const staticDir = path.resolve(".vercel/output/static");
  const workerPath = path.join(staticDir, "_worker.js/index.js");
  const orig = fs.readFileSync(workerPath, "utf8");
  const { patched, code } = patchWorkerSource(orig);
  if (patched) {
    fs.writeFileSync(workerPath, code);
  }
  console.log(`patch-cf-worker: patched / = ${patched}`);
  fs.writeFileSync(path.join(staticDir, ".assetsignore"), "_worker.js\n");
}
