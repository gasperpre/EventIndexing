const express = require('express');
const erc20Controller = require('../controllers/Erc20.controller');
const router = express.Router();

router.get('/transfers/:token_name', erc20Controller.getErc20Transfers);

module.exports = router;