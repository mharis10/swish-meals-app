const httpStatus = require('http-status-codes').StatusCodes;
const { Order, validateOrder } = require('../models/order.model');
const { Meal } = require('../models/meal.model');
const { User } = require('../models/user.model');
const { Op, Sequelize } = require('sequelize');
const { calculateUpcomingSunday } = require('../helpers/dateUtils');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

orderController = {
  createOrder: async (req, res) => {
    const { error } = validateOrder(req.body);
    if (error) {
      console.warn(`Invalid data format: ${error}`);
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: `Invalid data format: ${error}` });
    }

    const startDate = calculateUpcomingSunday();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    try {
      let isFirstOrder = true;

      const orders = await Order.findAll({ where: { userId: req.user.id } });

      if (orders && orders.length > 0) isFirstOrder = false;

      const order = await Order.create({
        userId: req.user.id,
        mealOneId: req.body.mealOneId,
        mealTwoId: req.body.mealTwoId,
        mealThreeId: req.body.mealThreeId,
        sideMeal: req.body.sideMeal,
        address: req.body.address,
        appartmentNumber: req.body.appartmentNumber,
        totalPrice: req.body.totalPrice,
        status: 'Pending',
        startDate,
        endDate,
        isFirstOrder,
        isDelayedSubscription: req.user.isSubscribed ? false : true,
      });

      if (req.user.isSubscribed) {
        return res.status(httpStatus.CREATED).json({
          message: 'Order placed successfully.',
          order: order,
          stripeURL: null,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'setup',
        customer: req.user.stripeCustomerId,
        success_url: `${process.env.CLIENT_URL}/buy?orderId=${order.id}&status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/buy?orderId=${order.id}&status=error`,
      });

      res.status(httpStatus.CREATED).json({
        message: 'Order placed successfully.',
        order: order,
        stripeURL: session.url,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal Server Error');
    }
  },

  getOrderById: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            attributes: [
              'id',
              'full_name',
              'email',
              'phone',
              'is_active',
              'is_admin',
              'stripeCustomerId',
              'isSubscribed',
            ],
          },
          {
            model: Meal,
            as: 'mealOne',
          },
          {
            model: Meal,
            as: 'mealTwo',
          },
          {
            model: Meal,
            as: 'mealThree',
          },
        ],
      });

      if (!order) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ message: 'Order not found' });
      }

      if (order.userId !== req.user.id) {
        return res
          .status(httpStatus.FORBIDDEN)
          .json({ message: 'Unauthorized access to order' });
      }

      res.status(httpStatus.OK).json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal Server Error');
    }
  },
  getMyOrders: async (req, res) => {
    try {
      const orders = await Order.findAll(
        { where: { userId: req.user.id } },
        {
          include: [
            {
              model: User,
              attributes: [
                'id',
                'full_name',
                'email',
                'phone',
                'is_active',
                'is_admin',
                'stripeCustomerId',
                'isSubscribed',
              ],
            },
            {
              model: Meal,
              as: 'mealOne',
            },
            {
              model: Meal,
              as: 'mealTwo',
            },
            {
              model: Meal,
              as: 'mealThree',
            },
          ],
        }
      );

      res.status(httpStatus.OK).json(orders);
    } catch (error) {
      console.error("Error fetching user's orders:", error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal Server Error' });
    }
  },

  getMyActiveOrder: async (req, res) => {
    try {
      const currentDate = new Date();

      const currentDateStr = currentDate.toISOString().split('T')[0];

      const order = await Order.findOne(
        {
          where: {
            userId: req.user.id,
            status: 'Confirmed',
            [Op.or]: [
              Sequelize.where(
                Sequelize.fn('date', Sequelize.col('startDate')),
                '<=',
                currentDateStr
              ),
              Sequelize.where(
                Sequelize.fn('date', Sequelize.col('endDate')),
                '>=',
                currentDateStr
              ),
            ],
          },
        },
        {
          include: [
            {
              model: User,
              attributes: [
                'id',
                'full_name',
                'email',
                'phone',
                'is_active',
                'is_admin',
                'stripeCustomerId',
                'isSubscribed',
              ],
            },
            {
              model: Meal,
              as: 'mealOne',
            },
            {
              model: Meal,
              as: 'mealTwo',
            },
            {
              model: Meal,
              as: 'mealThree',
            },
          ],
        }
      );

      if (!order) {
        return res
          .status(httpStatus.OK)
          .json({ error: 'No active order found' });
      }

      res.status(httpStatus.OK).json(order);
    } catch (error) {
      console.error("Error fetching user's orders:", error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal Server Error' });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: [
          {
            model: User,
            attributes: [
              'id',
              'full_name',
              'email',
              'phone',
              'is_active',
              'is_admin',
              'stripeCustomerId',
              'isSubscribed',
            ],
          },
          {
            model: Meal,
            as: 'mealOne',
          },
          {
            model: Meal,
            as: 'mealTwo',
          },
          {
            model: Meal,
            as: 'mealThree',
          },
        ],
      });

      res.status(httpStatus.OK).json(orders);
    } catch (error) {
      console.error('Error getting all orders:', error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal Server Error' });
    }
  },

  updateMyOrder: async (req, res) => {
    const { id } = req.params;
    const { sessionId, orderStatus } = req.body;

    if (orderStatus !== 'Confirmed')
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: 'Invalid Order Status' });

    if (sessionId && orderStatus === 'Confirmed') {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.mode !== 'setup' || session.status !== 'complete') {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ error: 'Payment Setup not completed successfully' });
      }
    }

    const order = await Order.findByPk(id);

    if (!order) {
      console.warn('No orders found with this id');

      return res.status(httpStatus.FORBIDDEN).json({
        message: 'No orders not found with this id',
      });
    }

    if (orderStatus) order.status = orderStatus;

    await order.save();

    res.status(httpStatus.OK).json({
      message: 'Order status updated successfully',
      updatedOrder: order,
    });
  },
};

module.exports = orderController;
