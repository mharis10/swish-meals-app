const { calculateUpcomingSunday } = require('../helpers/dateUtils');
const { Order } = require('../models/order.model');
const { User } = require('../models/user.model');
const httpStatus = require('http-status-codes').StatusCodes;

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const subscriptionController = {
  createCustomer: async (name, email) => {
    const customer = await stripe.customers.create({
      name,
      email,
    });

    return customer.id;
  },

  createCustomerPortalSession: async (req, res) => {
    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/buy`,
    });

    res.status(httpStatus.OK).json({
      customerPortalURL: session.url,
    });
  },

  handleWebhook: async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`Webhook signature verification failed.`);
      return res
        .status(httpStatus.BAD_REQUEST)
        .send(`Webhook Error: ${err.message}`);
    }

    const subscription = event.data.object;
    const customerId = subscription.customer;

    const user = await User.findOne({
      where: { stripeCustomerId: customerId },
    });

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Checkout session completed');
        const upcomingSunday = calculateUpcomingSunday();
        await stripe.subscriptionSchedules.create({
          customer: customerId,
          start_date: upcomingSunday.getTime() / 1000,
          end_behavior: 'release',
          phases: [
            {
              items: [
                {
                  price: process.env.PLAN_PRICE_ID,
                  quantity: 1,
                },
              ],
            },
          ],
        });
        user.isSubscribed = true;
        await user.save();
        break;
      case 'customer.subscription.created':
        console.log('Created');
        user.isSubscribed = true;
        await user.save();
        break;
      case 'customer.subscription.deleted':
        console.log('Deleted');
        user.isSubscribed = false;
        await user.save();

        const now = new Date();
        const startOfCurrentSunday = new Date(now);
        startOfCurrentSunday.setUTCDate(now.getUTCDate() - now.getUTCDay());
        startOfCurrentSunday.setUTCHours(0, 0, 0, 0);

        const orders = await Order.findAll({
          where: {
            userId: user.id,
            status: 'Confirmed',
            startDate: {
              [Op.gte]: startOfCurrentSunday,
            },
          },
        });
      
        for (const order of orders) {
          order.status = 'Cancelled';
          await order.save();
          console.log(`Cancelled order ${order.id} for user ${user.id}`);
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(httpStatus.OK).json({ received: true });
  },
};

module.exports = subscriptionController;
