const { DataTypes } = require('sequelize');
const Joi = require('joi');
const { sequelize } = require('../startup/db');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    mealOneId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'meals',
        key: 'id',
      },
    },
    mealTwoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'meals',
        key: 'id',
      },
    },
    mealThreeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'meals',
        key: 'id',
      },
    },
    sideMeal: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    appartmentNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled'),
      allowNull: false,
    },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    isFirstOrder: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDelayedSubscription: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: false,
  }
);

function validateOrder(order) {
  const orderSchema = Joi.object({
    mealOneId: Joi.number().integer().positive().required(),
    mealTwoId: Joi.number().integer().positive().required(),
    mealThreeId: Joi.number().integer().positive().required(),
    sideMeal: Joi.string().max(255).required(),
    address: Joi.string().max(255).required(),
    appartmentNumber: Joi.string().max(50).required(),
    totalPrice: Joi.number().precision(2).positive(),
  });

  return orderSchema.validate(order);
}

module.exports = { Order, validateOrder };
