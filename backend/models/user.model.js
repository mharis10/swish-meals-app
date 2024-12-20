const { DataTypes } = require('sequelize');
const { sequelize } = require('../startup/db');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    stripeCustomerId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isSubscribed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  }
);

function generateUserAuthToken(user) {
  const token = jwt.sign(
    {
      id: user.id,
      full_name: user.first_name,
      email: user.email,
      phone: user.phone,
      stripeCustomerId: user.stripeCustomerId,
      isSubscribed: user.isSubscribed,
      isFirstSubscription: user.isFirstSubscription,
      is_admin: user.is_admin,
      is_active: user.is_active,
    },
    process.env.USER_JWT_PRIVATE_KEY
  );
  return token;
}

function validateUser(user) {
  const userSchema = Joi.object({
    full_name: Joi.string().max(100).required(),
    email: Joi.string().max(100).required(),
    password: Joi.string().max(500).required(),
    phone: Joi.string().max(10).required(),
    is_admin: Joi.boolean().default(false),
  });

  return userSchema.validate(user);
}

module.exports = { User, generateUserAuthToken, validateUser };
