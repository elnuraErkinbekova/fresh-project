const express = require("express");
const contactController = require("../controllers/contactController");
const checkAuth = require("../middlewares/checkAuth");
const validate = require("../middlewares/validate");
const {
	createContactSchema,
	linkTelegramSchema,
} = require("../validators/contactValidator");

const router = express.Router();

router.get("/invite/:token", contactController.getInviteInfo);
router.post(
	"/telegram",
	validate(linkTelegramSchema),
	contactController.linkTelegram,
);

router.get("/", checkAuth, contactController.getContacts);
router.post(
	"/",
	checkAuth,
	validate(createContactSchema),
	contactController.addContact,
);
router.delete("/:id", checkAuth, contactController.removeContact);

module.exports = router;
