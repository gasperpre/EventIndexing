const express = require('express');
const erc20Router = require('./erc20.routes');
const router = express.Router();

router.use('/erc20', erc20Router)

module.exports = router