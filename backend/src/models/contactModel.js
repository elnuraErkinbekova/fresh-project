const { pool } = require("../config/db");

const findAllByUserId = async (userId) => {
	const [rows] = await pool.query(
		`SELECT id, name, surname, email, telegram_chat_id, invite_status, created_at
     FROM contacts WHERE user_id = ?`,
		[userId],
	);
	return rows;
};

const findById = async (id) => {
	const [rows] = await pool.query("SELECT * FROM contacts WHERE id = ?", [id]);
	return rows[0] || null;
};

const findByInviteToken = async (token) => {
	const [rows] = await pool.query(
		"SELECT * FROM contacts WHERE invite_token = ?",
		[token],
	);
	return rows[0] || null;
};

const create = async ({ userId, name, surname, email, inviteToken }) => {
	const [result] = await pool.query(
		"INSERT INTO contacts (user_id, name, surname, email, invite_token) VALUES (?, ?, ?, ?, ?)",
		[userId, name, surname, email, inviteToken],
	);
	return {
		id: result.insertId,
		name,
		surname,
		email,
		invite_status: "pending",
	};
};

const updateTelegramChatId = async (inviteToken, chatId) => {
	await pool.query(
		"UPDATE contacts SET telegram_chat_id = ?, invite_status = 'accepted' WHERE invite_token = ?",
		[chatId, inviteToken],
	);
};

const deleteById = async (id, userId) => {
	const [result] = await pool.query(
		"DELETE FROM contacts WHERE id = ? AND user_id = ?",
		[id, userId],
	);
	return result.affectedRows > 0;
};

module.exports = {
	findAllByUserId,
	findById,
	findByInviteToken,
	create,
	updateTelegramChatId,
	deleteById,
};
