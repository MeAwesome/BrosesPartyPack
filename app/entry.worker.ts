/// <reference lib="WebWorker" />

export {};

declare let self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
	console.log("Service worker installed");

	event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
	console.log("Service worker activated");

	event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
	const proxyUrl = new URL(event.request.url);
	if (event.request.url.includes("discordsays.com")) {
		proxyUrl.pathname = "/.proxy" + proxyUrl.pathname;
		event.respondWith(fetch(proxyUrl));
		console.log("Service worker proxying", event.request.url, "to", proxyUrl.href);
	}
});
