const express = require("express");
const userController = require("../controllers/userController");
const checkAuth = require("../middlewares/checkAuth");
const validate = require("../middlewares/validate");
const {
	updateProfileSchema,
	updatePasswordSchema,
} = require("../validators/userValidator");

const router = express.Router();

router.use(checkAuth);

router.get("/profile", userController.getProfile);
router.put(
	"/profile",
	validate(updateProfileSchema),
	userController.updateProfile,
);
router.put(
	"/password",
	validate(updatePasswordSchema),
	userController.updatePassword,
);
router.delete("/account", userController.deleteAccount);

module.exports = router;
