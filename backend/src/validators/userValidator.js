const Joi = require("joi");

const updateProfileSchema = Joi.object({
	username: Joi.string().min(2).max(100).required(),
	email: Joi.string().email().required(),
});

const updatePasswordSchema = Joi.object({
	currentPassword: Joi.string().required(),
	newPassword: Joi.string().min(6).max(72).required(),
});

module.exports = { updateProfileSchema, updatePasswordSchema };
