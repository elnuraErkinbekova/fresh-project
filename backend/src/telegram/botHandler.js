const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const BACKEND_URL =
	process.env.BACKEND_INTERNAL_URL ||
	`http://localhost:${process.env.PORT || 3001}`;

const sendMessage = async (chatId, text) => {
	await fetch(`${TELEGRAM_API}/sendMessage`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ chat_id: chatId, text }),
	});
};

const handleUpdate = async (update) => {
	const message = update.message;
	if (!message || !message.text) return;

	const chatId = message.chat.id;
	const text = message.text.trim();

	if (text.startsWith("/start")) {
		const parts = text.split(" ");
		const inviteToken = parts[1];

		if (!inviteToken) {
			await sendMessage(
				chatId,
				"Привет! Этот бот отправляет экстренные уведомления от ваших близких. " +
					"Для подключения используйте ссылку из письма.",
			);
			return;
		}

		const response = await fetch(`${BACKEND_URL}/api/contacts/telegram`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ inviteToken, chatId }),
		});

		if (response.ok) {
			await sendMessage(
				chatId,
				"✅ Вы успешно подключены!\n\n" +
					"Теперь вы будете получать экстренные уведомления через Telegram, " +
					"если человек который вас добавил нажмёт кнопку SOS.",
			);
		} else if (response.status === 404) {
			await sendMessage(chatId, "Ссылка недействительна или устарела.");
		} else {
			await sendMessage(chatId, "Произошла ошибка. Попробуйте ещё раз позже.");
		}
		return;
	}

	await sendMessage(
		chatId,
		"Этот бот предназначен только для получения экстренных SOS уведомлений. " +
			"Для вопросов о безопасности используйте AI помощника на сайте.",
	);
};

const startPolling = async () => {
	if (!process.env.TELEGRAM_BOT_TOKEN) {
		console.warn("TELEGRAM_BOT_TOKEN не задан, SOS бот не запущен");
		return;
	}

	let offset = 0;
	console.log("Telegram SOS бот запущен");

	const poll = async () => {
		try {
			const res = await fetch(
				`${TELEGRAM_API}/getUpdates?timeout=30&offset=${offset}`,
			);
			const data = await res.json();

			if (data.ok && data.result.length > 0) {
				for (const update of data.result) {
					offset = update.update_id + 1;
					await handleUpdate(update).catch((err) => {
						console.error("Ошибка обработки сообщения:", err.message);
					});
				}
			}
		} catch (err) {
			console.error("Ошибка polling:", err.message);
		}
		setTimeout(poll, 1000);
	};

	poll();
};

module.exports = { startPolling };
