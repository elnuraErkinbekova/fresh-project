const { pool } = require("../config/db");

const findAll = async () => {
	const [rows] = await pool.query(
		`SELECT id, category, description, location, photo_url, created_at
     FROM reports
     ORDER BY created_at DESC`,
	);
	return rows;
};

const findById = async (id) => {
	const [rows] = await pool.query("SELECT * FROM reports WHERE id = ?", [id]);
	return rows[0] || null;
};

const findByUserId = async (userId) => {
	const [rows] = await pool.query(
		`SELECT id, category, description, location, photo_url, created_at
     FROM reports WHERE user_id = ? ORDER BY created_at DESC`,
		[userId],
	);
	return rows;
};

const create = async ({
	userId,
	category,
	description,
	location,
	photoUrl,
}) => {
	const [result] = await pool.query(
		"INSERT INTO reports (user_id, category, description, location, photo_url) VALUES (?, ?, ?, ?, ?)",
		[userId, category, description || null, location, photoUrl || null],
	);
	return {
		id: result.insertId,
		category,
		description: description || null,
		location,
		photo_url: photoUrl || null,
	};
};

const deleteById = async (id, userId) => {
	const [result] = await pool.query(
		"DELETE FROM reports WHERE id = ? AND user_id = ?",
		[id, userId],
	);
	return result.affectedRows > 0;
};

module.exports = { findAll, findById, findByUserId, create, deleteById };