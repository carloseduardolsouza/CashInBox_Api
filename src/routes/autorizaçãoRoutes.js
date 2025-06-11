const express = require('express');
const router = express.Router();
const controller = require('../controllers/autorização');

router.get('/autorizarTarefa', controller.autorizarTarefa);

module.exports = router;