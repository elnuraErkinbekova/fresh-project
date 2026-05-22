const express = require("express");
const authController = require("../controllers/authController");
const checkAuth = require("../middlewares/checkAuth");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validators/authValidator");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", checkAuth, authController.me);

module.exports = router;
