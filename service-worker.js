const VERSAO_CACHE = "fila-servicos-v1";
const ARQUIVOS_PRINCIPAIS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSAO_CACHE)
      .then((cache) => cache.addAll(ARQUIVOS_PRINCIPAIS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves
        .filter((chave) => chave !== VERSAO_CACHE)
        .map((chave) => caches.delete(chave))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    caches.match(evento.request)
      .then((resposta) => resposta || fetch(evento.request))
      .catch(() => evento.request.mode === "navigate" ? caches.match("./index.html") : undefined)
  );
});
