const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers")

router.get("/frequencia" , userControllers.frequencia)
router.get("/gerarBoleto" , userControllers.gerarBoleto)
router.get("/informacoesPlano" , userControllers.informacoesPlano)

module.exports = router;
