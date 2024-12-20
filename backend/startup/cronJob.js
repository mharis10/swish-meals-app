const schedule = require('node-schedule');
const { sendSubscriptionExpiryEmail } = require('../helpers/email');
const { Order } = require('../models/order.model');
const { User } = require('../models/user.model');
const { Op } = require('sequelize');

const startEmailCronJob = () => {
  // Schedule for Friday 7pm UTC
  schedule.scheduleJob('0 19 * * 5', async function () {
    console.log('Running the cron job: Sending expiry emails...');

    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
    const formattedNextSunday = nextSunday.toISOString().split('T')[0];

    const subscribedUsers = await User.findAll({
      where: {
        isSubscribed: true,
      },
    });

    for (const user of subscribedUsers) {
      const userOrderForNextWeek = await Order.findOne({
        where: {
          userId: user.id,
          startDate: {
            [Op.gte]: formattedNextSunday,
          },
        },
        order: [['startDate', 'DESC']],
      });

      if (!userOrderForNextWeek) {
        await sendSubscriptionExpiryEmail(user.email);
        console.log(`Expiry email sent to ${user.email}`);
      }
    }
  });
};

const startOrdersCronJob = () => {
  // Schedule for Sunday 12pm UTC
  schedule.scheduleJob('0 12 * * 0', async function () {
    console.log(
      'Running the cron job: Creating orders for subscribed users...'
    );

    const subscribedUsers = await User.findAll({
      where: {
        isSubscribed: true,
      },
    });

    for (const user of subscribedUsers) {
      const thisSunday = new Date();
      thisSunday.setDate(thisSunday.getDate() + (7 - thisSunday.getDay()));
      const formattedThisSunday = thisSunday.toISOString().split('T')[0];

      const userOrderForThisWeek = await Order.findOne({
        where: {
          userId: user.id,
          startDate: {
            [Op.gte]: formattedThisSunday,
          },
        },
        order: [['startDate', 'DESC']],
      });

      if (!userOrderForThisWeek) {
        const latestOrder = await Order.findOne({
          where: { userId: user.id },
          order: [['startDate', 'DESC']],
        });

        if (latestOrder) {
          await Order.create({
            ...latestOrder.get({ plain: true }),
            id: null,
            startDate: thisSunday,
            endDate: new Date(thisSunday.getTime() + 1 * 24 * 60 * 60 * 1000),
          });

          console.log(`Order duplicated for user ${user.id}`);
        }
      }
    }
  });
};

module.exports = { startEmailCronJob, startOrdersCronJob };
