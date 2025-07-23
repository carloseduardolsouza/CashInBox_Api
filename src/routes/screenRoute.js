const express = require("express");
const router = express.Router();

const screenController = require("../controllers/screenController")

router.get("/", screenController.home);

module.exports = router;