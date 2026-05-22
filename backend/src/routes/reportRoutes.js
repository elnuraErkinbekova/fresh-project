const express = require("express");
const reportController = require("../controllers/reportController");
const checkAuth = require("../middlewares/checkAuth");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");
const { createReportSchema } = require("../validators/reportValidator");

const router = express.Router();

router.get("/", reportController.getAll);
router.get('/my', checkAuth, reportController.getMyReports);

router.post(
	"/",
	checkAuth,
	upload.single("photo"),
	validate(createReportSchema),
	reportController.create,
);

router.delete("/:id", checkAuth, reportController.remove);

module.exports = router;
