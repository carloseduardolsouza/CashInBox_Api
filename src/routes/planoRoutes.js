const express = require('express');
const router = express.Router();
const controller = require('../controllers/planoController');

router.get('/', controller.getAllPlanos);
router.post('/', controller.createPlano);

module.exports = router;