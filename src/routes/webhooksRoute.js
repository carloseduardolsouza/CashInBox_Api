const express = require("express");
const router = express.Router();
const webhooksControllers = require("../controllers/webhooksControllers");

router.post("/", webhooksControllers.webhooks);

module.exports = router;
