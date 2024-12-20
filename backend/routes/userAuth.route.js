const express = require('express');

const router = express.Router();
const userAuthController = require('../controllers/userAuth.controller');

router.post('/', userAuthController.login);

module.exports = router;