const { pool } = require("../config/db");

const create = async ({ userId, token, expiresAt }) => {
	await pool.query(
		"INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
		[userId, token, expiresAt],
	);
};

const findByToken = async (token) => {
	const [rows] = await pool.query(
		`SELECT rt.*, u.id AS user_id, u.username, u.email
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token = ? AND rt.expires_at > NOW()`,
		[token],
	);
	return rows[0] || null;
};

const deleteByToken = async (token) => {
	await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
};

const deleteAllForUser = async (userId) => {
	await pool.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
};

module.exports = {
	create,
	findByToken,
	deleteByToken,
	deleteAllForUser,
};
