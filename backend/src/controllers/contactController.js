const contactService = require("../services/contactService");

const getContacts = async (req, res, next) => {
	try {
		const contacts = await contactService.getContacts(req.user.id);
		res.json({ contacts });
	} catch (err) {
		next(err);
	}
};

const addContact = async (req, res, next) => {
	try {
		const contact = await contactService.addContact(req.user.id, req.body);
		res
			.status(201)
			.json({ message: "Контакт добавлен. Приглашение отправлено.", contact });
	} catch (err) {
		next(err);
	}
};

const getInviteInfo = async (req, res, next) => {
	try {
		const info = await contactService.getInviteInfo(req.params.token);
		res.json(info);
	} catch (err) {
		next(err);
	}
};

// Called by the SOS Telegram bot: POST /api/contacts/telegram
// Body: { inviteToken, chatId }
const linkTelegram = async (req, res, next) => {
	try {
		const { inviteToken, chatId } = req.body;
		await contactService.linkTelegram(inviteToken, chatId);
		res.json({ message: "Telegram успешно подключён" });
	} catch (err) {
		next(err);
	}
};

const removeContact = async (req, res, next) => {
	try {
		await contactService.removeContact(req.params.id, req.user.id);
		res.json({ message: "Контакт удалён" });
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getContacts,
	addContact,
	getInviteInfo,
	linkTelegram,
	removeContact,
};
