const sosService = require("../services/sosService");

const trigger = async (req, res, next) => {
	try {
		const { lat, lng } = req.body;
		const result = await sosService.trigger(req.user.id, req.user.username, {
			lat,
			lng,
		});
		res
			.status(201)
			.json({ message: "SOS запущен", sessionId: result.sessionId });
	} catch (err) {
		next(err);
	}
};

const getTrackInfo = async (req, res, next) => {
	try {
		const event = await sosService.getTrackInfo(req.params.sessionId);
		res.json({ event });
	} catch (err) {
		next(err);
	}
};

const resolve = async (req, res, next) => {
	try {
		await sosService.resolve(
			req.body.sessionId,
			req.user.id,
			req.user.username,
		);
		res.json({ message: "SOS завершён" });
	} catch (err) {
		next(err);
	}
};

module.exports = { trigger, getTrackInfo, resolve };
