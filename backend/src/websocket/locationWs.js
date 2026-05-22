const { WebSocketServer } = require("ws");

const sessions = new Map();

const setupWebSocket = (server) => {
	const wss = new WebSocketServer({ server, path: "/ws" });

	wss.on("connection", (ws) => {
		let role = null;
		let sessionId = null;

		ws.on("message", (raw) => {
			try {
				const msg = JSON.parse(raw);

				if (msg.type === "join") {
					role = msg.role;
					sessionId = msg.sessionId;

					if (!sessions.has(sessionId)) {
						sessions.set(sessionId, { sender: null, watchers: [] });
					}

					const session = sessions.get(sessionId);

					if (role === "sender") {
						session.sender = ws;
						console.log(`[WS] Sender joined session ${sessionId}`);
					} else if (role === "watcher") {
						session.watchers.push(ws);
						console.log(
							`[WS] Watcher joined session ${sessionId} (total: ${session.watchers.length})`,
						);
					}
				}

				if (msg.type === "location" && role === "sender" && sessionId) {
					const session = sessions.get(sessionId);
					if (!session) return;

					const payload = JSON.stringify({
						type: "location",
						lat: msg.lat,
						lng: msg.lng,
						timestamp: Date.now(),
					});

					session.watchers.forEach((watcher) => {
						if (watcher.readyState === watcher.OPEN) {
							watcher.send(payload);
						}
					});
				}

				if (msg.type === "resolved" && role === "sender" && sessionId) {
					const session = sessions.get(sessionId);
					if (!session) return;

					const payload = JSON.stringify({ type: "resolved" });
					session.watchers.forEach((watcher) => {
						if (watcher.readyState === watcher.OPEN) {
							watcher.send(payload);
						}
					});
					sessions.delete(sessionId);
				}
			} catch (err) {
				console.error("[WS] Failed to parse message:", err.message);
			}
		});

		ws.on("close", () => {
			if (!sessionId) return;
			const session = sessions.get(sessionId);
			if (!session) return;

			if (role === "sender") {
				session.sender = null;
				session.watchers.forEach((watcher) => {
					if (watcher.readyState === watcher.OPEN) {
						watcher.send(JSON.stringify({ type: "sender_disconnected" }));
					}
				});
			} else if (role === "watcher") {
				session.watchers = session.watchers.filter((w) => w !== ws);
			}

			if (!session.sender && session.watchers.length === 0) {
				sessions.delete(sessionId);
			}
		});

		ws.on("error", (err) => {
			console.error("[WS] Socket error:", err.message);
		});
	});

	console.log("WebSocket сервер готов на /ws");
};

module.exports = setupWebSocket;
