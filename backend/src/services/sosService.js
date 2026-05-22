const { nanoid } = require("nanoid");
const sosEventModel = require("../models/sosEventModel");
const contactModel = require("../models/contactModel");
const notifyService = require("./notifyService");

const trigger = async (userId, username, { lat, lng }) => {
	const sessionId = nanoid(16);
	await sosEventModel.create({ userId, sessionId, lat, lng });

	const contacts = await contactModel.findAllByUserId(userId);
	const trackUrl = `${process.env.CLIENT_URL}/track/${sessionId}`;

	await notifyService.sendSosAlerts({
		senderName: username,
		contacts,
		lat,
		lng,
		trackUrl,
	});

	return { sessionId };
};

const getTrackInfo = async (sessionId) => {
	const event = await sosEventModel.findBySessionId(sessionId);
	if (!event) {
		const err = new Error("SOS сессия не найдена");
		err.status = 404;
		throw err;
	}
	return event;
};

const resolve = async (sessionId, userId, username) => {
	const resolved = await sosEventModel.resolve(sessionId, userId);
	if (!resolved) {
		const err = new Error("SOS сессия не найдена или у вас нет прав");
		err.status = 404;
		throw err;
	}

	const contacts = await contactModel.findAllByUserId(userId);
	await notifyService.sendResolvedAlerts({ senderName: username, contacts });
};

module.exports = { trigger, getTrackInfo, resolve };
