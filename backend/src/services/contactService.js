const { nanoid } = require("nanoid");
const contactModel = require("../models/contactModel");
const notifyService = require("./notifyService");

const getContacts = async (userId) => contactModel.findAllByUserId(userId);

const addContact = async (userId, { name, surname, email }) => {
	const inviteToken = nanoid(32);
	const contact = await contactModel.create({
		userId,
		name,
		surname,
		email,
		inviteToken,
	});
	await notifyService.sendInviteEmail({ contact, inviteToken });
	return contact;
};

const getInviteInfo = async (token) => {
	const contact = await contactModel.findByInviteToken(token);
	if (!contact) {
		const err = new Error("Ссылка недействительна или устарела");
		err.status = 404;
		throw err;
	}
	return {
		name: contact.name,
		surname: contact.surname,
		invite_status: contact.invite_status,
	};
};

const linkTelegram = async (inviteToken, chatId) => {
	const contact = await contactModel.findByInviteToken(inviteToken);
	if (!contact) {
		const err = new Error("Недействительный токен приглашения");
		err.status = 404;
		throw err;
	}
	await contactModel.updateTelegramChatId(inviteToken, chatId);
};

const removeContact = async (contactId, userId) => {
	const deleted = await contactModel.deleteById(contactId, userId);
	if (!deleted) {
		const err = new Error("Контакт не найден");
		err.status = 404;
		throw err;
	}
};

module.exports = {
	getContacts,
	addContact,
	getInviteInfo,
	linkTelegram,
	removeContact,
};
