import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "cloudflare:workers") {
      return {
        shortCircuit: true,
        url: "data:text/javascript,export const env = {};",
      };
    }
    return nextResolve(specifier, context);
  },
});

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function loadWorker(label) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${label}-${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

const env = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const context = {
  waitUntil() {},
  passThroughOnException() {},
};

test("renders development preview metadata", async () => {
  const worker = await loadWorker("metadata");

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    env,
    context,
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("renders every public navigation route", async () => {
  const worker = await loadWorker("routes");
  const routes = new Map([
    ["/escola", "A nossa escola"],
    ["/cursos", "Cursos e modalidades"],
    ["/noticias", "Notícias da escola"],
    ["/esportes-eventos", "Esportes &amp; Eventos"],
    ["/avisos", "Avisos e comunicados"],
    ["/biblioteca", "Biblioteca Duprat"],
    ["/equipe", "Nossa equipe escolar"],
    ["/contato", "Contato e localização"],
  ]);

  for (const [path, heading] of routes) {
    const response = await worker.fetch(
      new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
      env,
      context,
    );
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(heading, "i"), path);
  }
});

test("renders compact detail pages with global help tools", async () => {
  const worker = await loadWorker("details");
  const routes = new Map([
    ["/biblioteca/livro/dom-casmurro", ["Dom Casmurro", "Recomendações"]],
    ["/equipe/joelma", ["Joelma", "Principais responsabilidades"]],
    ["/avisos/reuniao-de-pais-e-responsaveis", ["Reunião de pais", "Informações do aviso"]],
  ]);

  for (const [path, expectedTexts] of routes) {
    const response = await worker.fetch(
      new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
      env,
      context,
    );
    assert.equal(response.status, 200, path);
    const html = await response.text();
    for (const expectedText of expectedTexts) assert.match(html, new RegExp(expectedText, "i"), `${path}: ${expectedText}`);
    assert.match(html, /DupratBot/i, `${path}: chatbot global`);
    assert.match(html, /Acessibilidade/i, `${path}: acessibilidade global`);
  }
});
