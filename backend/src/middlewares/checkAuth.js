const tokenModel = require("../models/tokenModel");

const checkAuth = async (req, res, next) => {
	try {
		const token = req.cookies?.auth_token;
		if (!token) {
			return res.status(401).json({ error: "Не авторизован" });
		}

		const record = await tokenModel.findByToken(token);
		if (!record) {
			res.clearCookie("auth_token");
			return res
				.status(401)
				.json({ error: "Сессия истекла. Пожалуйста, войдите снова." });
		}

		req.user = {
			id: record.user_id,
			username: record.username,
			email: record.email,
		};

		next();
	} catch (err) {
		next(err);
	}
};

module.exports = checkAuth;
