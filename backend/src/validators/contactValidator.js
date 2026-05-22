const Joi = require("joi");

const createContactSchema = Joi.object({
	name: Joi.string().min(2).max(100).required(),
	surname: Joi.string().min(2).max(100).required(),
	email: Joi.string().email().required(),
});

const linkTelegramSchema = Joi.object({
	inviteToken: Joi.string().required(),
	chatId: Joi.number().integer().required(),
});

module.exports = { createContactSchema, linkTelegramSchema };
