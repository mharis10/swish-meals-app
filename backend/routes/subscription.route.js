const express = require('express');
const bodyParser = require('body-parser');
const authenticationMiddleware = require('../middlewares/authentication');

const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');

router.post('/createCustomerPortalSession', authenticationMiddleware, subscriptionController.createCustomerPortalSession);
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

module.exports = router;