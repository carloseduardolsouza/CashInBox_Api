const express = require('express');
const router = express.Router();
const controller = require('../controllers/pagamentoController');

router.get('/', controller.getAllPagamentos);
router.post('/', controller.createPagamento);

module.exports = router;