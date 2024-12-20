const express = require('express');
const multer = require('multer');

const authenticationMiddleware = require('../middlewares/authentication');
const authorizationMiddleware = require('../middlewares/authorization');

const router = express.Router();
const mealController = require('../controllers/meal.controller');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new Error('Only .jpg, .jpeg, and .png files are allowed!'),
        false
      );
    }
    cb(null, true);
  },
  limits: { fileSize: process.env.IMAGE_SIZE_LIMIT * 1024 * 1024 },
});

router.get('/', mealController.getAllMeals);
router.get('/:id', mealController.getMealById);

router.post(
  '/',
  [authenticationMiddleware, authorizationMiddleware],
  upload.single('image'),
  mealController.addMeal
);
router.put(
  '/:id',
  [authenticationMiddleware, authorizationMiddleware],
  mealController.updateMeal
);
router.delete(
  '/:id',
  [authenticationMiddleware, authorizationMiddleware],
  mealController.deleteMeal
);

module.exports = router;
