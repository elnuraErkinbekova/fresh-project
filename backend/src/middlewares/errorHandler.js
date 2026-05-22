const errorHandler = (err, req, res, next) => {
	console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

	if (err.code === "ER_DUP_ENTRY") {
		const message = err.sqlMessage || "";
		if (message.includes("username")) {
			return res.status(409).json({ error: "Это имя пользователя уже занято" });
		}
		if (message.includes("email")) {
			return res.status(409).json({ error: "Этот email уже зарегистрирован" });
		}
		return res.status(409).json({ error: "Запись уже существует" });
	}

	if (err.isJoi) {
		return res
			.status(400)
			.json({ error: "Ошибка валидации", details: err.message });
	}

	if (err.code === "LIMIT_FILE_SIZE") {
		return res
			.status(400)
			.json({ error: "Файл слишком большой. Максимальный размер — 5 МБ" });
	}

	const status = err.status || 500;
	const message = err.message || "Внутренняя ошибка сервера";
	res.status(status).json({ error: message });
};

module.exports = errorHandler;
