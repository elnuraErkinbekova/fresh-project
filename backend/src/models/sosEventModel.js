const { pool } = require("../config/db");

const create = async ({ userId, sessionId, lat, lng }) => {
	const [result] = await pool.query(
		"INSERT INTO sos_events (user_id, session_id, lat, lng) VALUES (?, ?, ?, ?)",
		[userId, sessionId, lat || null, lng || null],
	);
	return { id: result.insertId, sessionId };
};

const findBySessionId = async (sessionId) => {
	const [rows] = await pool.query(
		`SELECT se.*, u.username AS user_name
     FROM sos_events se
     JOIN users u ON u.id = se.user_id
     WHERE se.session_id = ?`,
		[sessionId],
	);
	return rows[0] || null;
};

const resolve = async (sessionId, userId) => {
	const [result] = await pool.query(
		"UPDATE sos_events SET status = 'resolved', resolved_at = NOW() WHERE session_id = ? AND user_id = ?",
		[sessionId, userId],
	);
	return result.affectedRows > 0;
};

module.exports = { create, findBySessionId, resolve };
