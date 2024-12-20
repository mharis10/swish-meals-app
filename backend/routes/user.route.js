const express = require('express');
const authenticationMiddleware = require('../middlewares/authentication');
const authorizationMiddleware = require('../middlewares/authorization');


const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/', userController.registerUser);
router.get('/me', authenticationMiddleware, userController.getMyUser);
router.put('/me', authenticationMiddleware, userController.updateMyUser);
router.get('/all', [authenticationMiddleware, authorizationMiddleware], userController.getAllUsers);


module.exports = router;