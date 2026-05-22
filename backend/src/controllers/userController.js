const userService = require("../services/userService");

const getProfile = async (req, res, next) => {
	try {
		const user = await userService.getProfile(req.user.id);
		res.json({ user });
	} catch (err) {
		next(err);
	}
};

const updateProfile = async (req, res, next) => {
	try {
		const user = await userService.updateProfile(req.user.id, req.body);
		res.json({ message: "Профиль обновлён", user });
	} catch (err) {
		next(err);
	}
};

const updatePassword = async (req, res, next) => {
	try {
		await userService.updatePassword(req.user.id, req.body);
		res.json({ message: "Пароль обновлён" });
	} catch (err) {
		next(err);
	}
};

const deleteAccount = async (req, res, next) => {
	try {
		await userService.deleteAccount(req.user.id);
		res.clearCookie("auth_token");
		res.json({ message: "Аккаунт удалён" });
	} catch (err) {
		next(err);
	}
};

module.exports = { getProfile, updateProfile, updatePassword, deleteAccount };
