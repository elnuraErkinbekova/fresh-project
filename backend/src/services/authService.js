const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const userModel = require("../models/userModel");
const tokenModel = require("../models/tokenModel");

const SALT_ROUNDS = 12;
const TOKEN_TTL_DAYS = 30;

const register = async ({ username, email, password }) => {
	const existingEmail = await userModel.findByEmail(email);
	if (existingEmail) {
		const err = new Error("Этот email уже зарегистрирован");
		err.status = 409;
		throw err;
	}

	const existingUsername = await userModel.findByUsername(username);
	if (existingUsername) {
		const err = new Error("Это имя пользователя уже занято");
		err.status = 409;
		throw err;
	}

	const hashed = await bcrypt.hash(password, SALT_ROUNDS);
	const user = await userModel.create({ username, email, password: hashed });
	return user;
};

const login = async ({ email, password }) => {
	const user = await userModel.findByEmail(email);
	if (!user) {
		const err = new Error("Неверный email или пароль");
		err.status = 401;
		throw err;
	}

	const match = await bcrypt.compare(password, user.password);
	if (!match) {
		const err = new Error("Неверный email или пароль");
		err.status = 401;
		throw err;
	}

	const token = nanoid(64);
	const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
	await tokenModel.create({ userId: user.id, token, expiresAt });

	return {
		token,
		user: { id: user.id, username: user.username, email: user.email },
	};
};

const logout = async (token) => {
	await tokenModel.deleteByToken(token);
};

module.exports = { register, login, logout };
