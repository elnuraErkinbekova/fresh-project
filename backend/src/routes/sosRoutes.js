const express = require("express");
const sosController = require("../controllers/sosController");
const checkAuth = require("../middlewares/checkAuth");

const router = express.Router();

router.post("/trigger", checkAuth, sosController.trigger);
router.post("/resolve", checkAuth, sosController.resolve);
router.get("/track/:sessionId", sosController.getTrackInfo);

module.exports = router;
