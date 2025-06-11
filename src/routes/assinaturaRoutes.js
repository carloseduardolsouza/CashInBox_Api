const express = require('express');
const router = express.Router();
const controller = require('../controllers/assinaturaController');

router.get('/', controller.getAllAssinaturas);
router.post('/', controller.createAssinatura);

module.exports = router;