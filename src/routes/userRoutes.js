const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers")

router.get("/frequencia" , userControllers.frequencia)

module.exports = router;
