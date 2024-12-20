const express = require('express');
const path = require('path');
require('express-async-errors');
const cors = require('cors');
const user = require('../routes/user.route');
const userAuth = require('../routes/userAuth.route');
const meal = require('../routes/meal.route');
const order = require('../routes/order.route');
const stats = require('../routes/stats.route');
const subscription = require('../routes/subscription.route');
const error = require('../middlewares/error');

const corsOptions = {
  origin:
    process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN?.split(','),
  methods: 'GET,PUT,POST,DELETE',
  allowedHeaders: ['Content-Type', 'x-auth-token'],
  exposedHeaders: ['x-auth-token'],
  optionsSuccessStatus: 200,
};

module.exports = (app) => {
  app.use(cors(corsOptions));
  app.use('/api/subscription', subscription);
  app.use(express.json());
  app.use('/api/mealImages', express.static(path.join(__dirname, '..', 'mealImages')));
  app.use('/api/user', user);
  app.use('/api/auth', userAuth);
  app.use('/api/meal', meal);
  app.use('/api/order', order);
  app.use('/api/stat', stats);
  app.use(error);
};
