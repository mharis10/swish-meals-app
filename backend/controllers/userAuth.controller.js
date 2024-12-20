const bcrypt = require('bcrypt');
const httpStatus = require('http-status-codes').StatusCodes;
const { User, generateUserAuthToken } = require('../models/user.model');
const UserAuth = require('../models/userAuth.model');

const userAuthController = {
  login: async (req, res) => {
    const { email, password } = req.body;
    const { error } = UserAuth.validateUserAuth(req.body);

    if (error) {
      console.warn(`Invalid data format: ${error}`);
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: `Invalid data format: ${error}` });
    }

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      console.warn('Invalid email or password');
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      console.warn('Inactive user');
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ error: 'Inactive user' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.warn('Invalid email or password');
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: 'Invalid email or password' });
    }

    const token = generateUserAuthToken(user);

    res
      .status(httpStatus.OK)
      .header('x-auth-token', token)
      .json({ message: 'Login Successful!', user: user });
  },
};

module.exports = userAuthController;
