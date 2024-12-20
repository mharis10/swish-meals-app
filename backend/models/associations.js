const { User } = require('./user.model');
const { Meal } = require('./meal.model');
const { Order } = require('./order.model');

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Meal.hasMany(Order, { foreignKey: 'mealOneId' });
Meal.hasMany(Order, { foreignKey: 'mealTwoId' });
Meal.hasMany(Order, { foreignKey: 'mealThreeId' });

Order.belongsTo(Meal, { foreignKey: 'mealOneId', as: 'mealOne' });
Order.belongsTo(Meal, { foreignKey: 'mealTwoId', as: 'mealTwo' });
Order.belongsTo(Meal, { foreignKey: 'mealThreeId', as: 'mealThree' });

module.exports = {
  User,
  Order,
};
