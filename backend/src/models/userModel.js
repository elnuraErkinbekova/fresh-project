const { pool } = require("../config/db");

const findByEmail = async (email) => {
	const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
		email,
	]);
	return rows[0] || null;
};

const findByUsername = async (username) => {
	const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
		username,
	]);
	return rows[0] || null;
};

const findById = async (id) => {
	const [rows] = await pool.query(
		"SELECT id, username, email, created_at FROM users WHERE id = ?",
		[id],
	);
	return rows[0] || null;
};

const findByIdWithPassword = async (id) => {
	const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
	return rows[0] || null;
};

const create = async ({ username, email, password }) => {
	const [result] = await pool.query(
		"INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
		[username, email, password],
	);
	return { id: result.insertId, username, email };
};

const updateById = async (id, { username, email }) => {
	await pool.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [
		username,
		email,
		id,
	]);
};

const updatePassword = async (id, hashedPassword) => {
	await pool.query("UPDATE users SET password = ? WHERE id = ?", [
		hashedPassword,
		id,
	]);
};

const deleteById = async (id) => {
	await pool.query("DELETE FROM users WHERE id = ?", [id]);
};

module.exports = {
	findByEmail,
	findByUsername,
	findById,
	findByIdWithPassword,
	create,
	updateById,
	updatePassword,
	deleteById,
};
