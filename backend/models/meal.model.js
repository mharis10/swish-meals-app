const { DataTypes } = require('sequelize');
const { sequelize } = require('../startup/db');
const Joi = require('joi');

const Meal = sequelize.define(
  'meals',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    protein: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Meal',
    tableName: 'meals',
    timestamps: true,
  }
);

function validateMeal(meal) {
  const mealSchema = Joi.object({
    code: Joi.string().max(20).required(),
    protein: Joi.string().max(255).required(),
    price: Joi.number().precision(2).positive().required(),
    image: Joi.any(),
  });

  return mealSchema.validate(meal);
}

module.exports = { Meal, validateMeal };
