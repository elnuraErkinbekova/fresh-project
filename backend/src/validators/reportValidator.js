const Joi = require("joi");

const VALID_CATEGORIES = [
	"harassment",
	"suspicious_person",
	"dangerous_area",
	"other",
];

const createReportSchema = Joi.object({
	category: Joi.string()
		.valid(...VALID_CATEGORIES)
		.required(),
	description: Joi.when("category", {
		is: "other",
		then: Joi.string().min(1).required(),
		otherwise: Joi.string().min(1).optional().allow("", null),
	}),
	location: Joi.string().min(1).max(255).required(),
});

module.exports = { createReportSchema };
