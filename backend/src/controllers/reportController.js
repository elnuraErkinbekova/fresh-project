const reportService = require("../services/reportService");

const getAll = async (req, res, next) => {
	try {
		const reports = await reportService.getAll();
		res.json({ reports });
	} catch (err) {
		next(err);
	}
};

const getMyReports = async (req, res, next) => {
	try {
		const reports = await reportService.getMyReports(req.user.id);
		res.json({ reports });
	} catch (err) {
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		const report = await reportService.create(req.user.id, req.body, req.file);
		res.status(201).json({ message: "Репорт создан", report });
	} catch (err) {
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		await reportService.remove(req.params.id, req.user.id);
		res.json({ message: "Репорт удалён" });
	} catch (err) {
		next(err);
	}
};

module.exports = { getAll, getMyReports, create, remove };
