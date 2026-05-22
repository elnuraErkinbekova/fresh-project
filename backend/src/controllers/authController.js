const authService = require("../services/authService");

const COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: "strict",
	secure: process.env.NODE_ENV === "production",
	maxAge: 30 * 24 * 60 * 60 * 1000,
};

const register = async (req, res, next) => {
	try {
		const user = await authService.register(req.body);
		res.status(201).json({ message: "Регистрация прошла успешно", user });
	} catch (err) {
		next(err);
	}
};

const login = async (req, res, next) => {
	try {
		const { token, user } = await authService.login(req.body);
		res.cookie("auth_token", token, COOKIE_OPTIONS);
		res.json({ message: "Вход выполнен", user });
	} catch (err) {
		next(err);
	}
};

const logout = async (req, res, next) => {
	try {
		const token = req.cookies?.auth_token;
		if (token) await authService.logout(token);
		res.clearCookie("auth_token");
		res.json({ message: "Выход выполнен" });
	} catch (err) {
		next(err);
	}
};

const me = async (req, res) => {
	res.json({ user: req.user });
};

module.exports = { register, login, logout, me };
