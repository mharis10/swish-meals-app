const httpStatus = require('http-status-codes').StatusCodes;
const fs = require('fs');
const path = require('path');
const { Meal, validateMeal } = require('../models/meal.model');
const { sequelize } = require('../startup/db');

const mealController = {
  getAllMeals: async (req, res) => {
    const meals = await Meal.findAll();

    if (!meals) {
      console.warn('Meals not found');
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: 'Meals not found' });
    }

    res.status(httpStatus.OK).json(meals);
  },

  addMeal: async (req, res) => {
    const { code, protein, price } = req.body;

    const { error } = validateMeal(req.body);
    if (error) {
      console.warn('Invalid meal data:', error.details[0].message);

      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: error.details[0].message });
    }

    const transaction = await sequelize.transaction();

    try {
      const newMeal = await Meal.create(
        {
          code,
          protein,
          price,
          image: '',
        },
        { transaction }
      );

      const mealImagePath = await handleImageUploads(req.file, newMeal.id);
      if (mealImagePath) {
        newMeal.image = mealImagePath;
        await newMeal.save({ transaction });
      }

      await transaction.commit();

      res.status(httpStatus.CREATED).json({
        message: 'Meal added successfully',
        meal: newMeal,
      });
    } catch (error) {
      await transaction.rollback();

      console.error('Error adding meal:', error);

      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Error adding meal' });
    }
  },

  getMealById: async (req, res) => {
    const mealId = req.params.id;

    try {
      const meal = await Meal.findByPk(mealId);

      if (!meal) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'Meal not found' });
      }

      res.status(httpStatus.OK).json({
        meal: meal,
      });
    } catch (error) {
      console.error('Error fetching meal:', error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Error fetching meal' });
    }
  },

  updateMeal: async (req, res) => {
    const mealId = req.params.id;
    const { code, protein, price } = req.body;

    try {
      let meal = await Meal.findByPk(mealId);

      if (!meal) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'Meal not found' });
      }

      meal.code = code || meal.code;
      meal.protein = protein || meal.protein;
      meal.price = price || meal.price;
      await meal.save();

      res.status(httpStatus.OK).json({
        message: 'Meal updated successfully',
        meal: meal,
      });
    } catch (error) {
      console.error('Error updating meal:', error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Error updating meal' });
    }
  },

  deleteMeal: async (req, res) => {
    const mealId = req.params.id;

    try {
      const meal = await Meal.findByPk(mealId);

      if (!meal) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'Meal not found' });
      }

      if (meal.image) {
        await handleImageDeletion(meal.image);
      }

      await meal.destroy();

      res.status(httpStatus.OK).json({
        message: 'Meal deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting meal:', error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Error deleting meal' });
    }
  },
};

async function handleImageUploads(file, mealId) {
  if (!file) return null;

  const baseImagesDir = path.join(__dirname, '..', 'mealImages');

  if (!fs.existsSync(baseImagesDir)) {
    fs.mkdirSync(baseImagesDir, { recursive: true });
  }

  const fileExtension = path.extname(file.originalname);
  const newFileName = `${mealId}${fileExtension}`;
  const newFilePath = path.join(baseImagesDir, newFileName);

  fs.writeFileSync(newFilePath, file.buffer);

  const relativeUrl = path.join('mealImages', newFileName).replace(/\\/g, '/');

  return relativeUrl;
}

async function handleImageDeletion(image) {
  if (!image) return;

  const imagePath = path.join(__dirname, '..', image);

  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
}

module.exports = mealController;
