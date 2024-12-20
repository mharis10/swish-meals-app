const express = require('express');
const authenticationMiddleware = require('../middlewares/authentication');
const authorizationMiddleware = require('../middlewares/authorization');

const router = express.Router();
const statsController = require('../controllers/stats.controller');

router.get('/weekly', [authenticationMiddleware, authorizationMiddleware], statsController.getWeeklyOrdersStats);
router.post('/weekly/email', [authenticationMiddleware, authorizationMiddleware], statsController.sendWeeklyStats);

module.exports = router;