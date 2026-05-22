const reportModel = require("../models/reportModel");
const cloudinary = require("../config/cloudinary");

const getAll = async () => reportModel.findAll();

const getMyReports = async (userId) => reportModel.findByUserId(userId);

const create = async (userId, { category, description, location }, file) => {
	let photoUrl = null;

	if (file) {
		const result = await new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream(
				{ folder: "safety-app/reports" },
				(error, result) => {
					if (error) reject(error);
					else resolve(result);
				},
			);
			stream.end(file.buffer);
		});
		photoUrl = result.secure_url;
	}

	return reportModel.create({
		userId,
		category,
		description,
		location,
		photoUrl,
	});
};

const remove = async (reportId, userId) => {
	const deleted = await reportModel.deleteById(reportId, userId);
	if (!deleted) {
		const err = new Error(
			"Репорт не найден или у вас нет прав на его удаление",
		);
		err.status = 404;
		throw err;
	}
};

module.exports = { getAll, getMyReports, create, remove };