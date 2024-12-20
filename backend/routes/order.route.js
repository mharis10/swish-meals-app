const express = require('express');
const authenticationMiddleware = require('../middlewares/authentication');
const authorizationMiddleware = require('../middlewares/authorization');

const router = express.Router();
const orderController = require('../controllers/order.controller');

//ADMIN
router.get('/all', [authenticationMiddleware,authorizationMiddleware], orderController.getAllOrders);
router.get('/active', authenticationMiddleware, orderController.getMyActiveOrder);
router.post('/', authenticationMiddleware, orderController.createOrder);
router.get('/myorders', authenticationMiddleware, orderController.getMyOrders);
router.get('/:id', authenticationMiddleware, orderController.getOrderById);
router.put('/:id', authenticationMiddleware, orderController.updateMyOrder);

module.exports = router;