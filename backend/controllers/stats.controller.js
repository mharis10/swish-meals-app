const httpStatus = require('http-status-codes').StatusCodes;
const { Op } = require('sequelize');
const { Meal } = require('../models/meal.model');
const { Order } = require('../models/order.model');
const { sendWeeklyStatsEmail } = require('../helpers/email');

const adminController = {
  getWeeklyOrdersStats: async (req, res) => {
    try {
      const { fromDate, toDate } = req.query;

      const weekStart = new Date(fromDate);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(toDate);
      weekEnd.setHours(23, 59, 59, 999);

      if (isNaN(weekStart.getTime()) || isNaN(weekEnd.getTime())) {
        return res.status(400).json({ error: 'Invalid fromDate or toDate' });
      }

      const orders = await Order.findAll({
        where: {
          startDate: {
            [Op.gte]: weekStart,
            [Op.lte]: weekEnd,
          },
        },
        include: [
          { model: Meal, as: 'mealOne' },
          { model: Meal, as: 'mealTwo' },
          { model: Meal, as: 'mealThree' },
        ],
      });

      let mealCountByCode = {};
      let sideCounts = {};
      let mealTypeCount = { S: 0, C: 0, A: 0, P: 0 };

      orders.forEach((order) => {
        [order.mealOne, order.mealTwo, order.mealThree].forEach((meal) => {
          if (meal) {
            mealCountByCode[meal.code] = (mealCountByCode[meal.code] || 0) + 1;

            let firstLetter = meal.code.charAt(0).toUpperCase();
            if (mealTypeCount.hasOwnProperty(firstLetter)) {
              mealTypeCount[firstLetter]++;
            }
          }
        });

        const sideMeal = order.sideMeal;
        sideCounts[sideMeal] = (sideCounts[sideMeal] || 0) + 1;
      });

      res.json({
        weekStart,
        weekEnd,
        totalOrders: orders.length,
        mealCountByCode,
        sideCounts,
        mealTypeCount,
      });
    } catch (error) {
      console.error('Error fetching weekly order stats:', error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Error fetching weekly order stats' });
    }
  },

  sendWeeklyStats: async (req, res) => {
    sendWeeklyStatsEmail(req.body);

    return res.status(httpStatus.OK).json('Email sent successfully!');
  },
};

module.exports = adminController;