const bcrypt = require("bcrypt");
const httpStatus = require("http-status-codes").StatusCodes;
const {
  User,
  generateUserAuthToken,
  validateUser,
} = require("../models/user.model");
const { createCustomer } = require('./subscription.controller');
const { sendSignUpEmail } = require('../helpers/email');

const userController = {
  registerUser: async (req, res) => {
    const { full_name, email, phone, is_admin } = req.body;
    let { password } = req.body;
    const { error } = validateUser(req.body);

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

    if (user) {
      console.warn("User already registered");
      return res
        .status(httpStatus.CONFLICT)
        .json({ error: "User already registered" });
    }

    const stripeCustomerId = await createCustomer(full_name, email);

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      full_name,
      email,
      password,
      phone,
      is_admin,
      stripeCustomerId,
    });

    sendSignUpEmail(newUser);

    const token = generateUserAuthToken(newUser);

    const sanitizedUser = { ...newUser.get() };
    delete sanitizedUser.password;

    res.status(httpStatus.CREATED).header("x-auth-token", token).json({
      message: "User registered successfully",
      account: sanitizedUser,
    });
  },

  getMyUser: async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      console.warn("User not found");
      return res.status(httpStatus.NOT_FOUND).json({ error: "User not found" });
    }

    const sanitizedUser = { ...user.get() };
    delete sanitizedUser.password;

    res.status(httpStatus.OK).json(sanitizedUser);
  },

  updateMyUser: async (req, res) => {
    try {
      const { full_name, email, phone, password } = req.body;

      const currentUser = await User.findByPk(req.user.id);

      if (!currentUser) {
        console.warn("User not found");
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: "User not found" });
      }

      currentUser.full_name = full_name || currentUser.full_name;
      currentUser.email = email || currentUser.email;
      currentUser.phone = phone || currentUser.phone;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        currentUser.password = await bcrypt.hash(password, salt);
      }

      await currentUser.save();

      const sanitizedUser = { ...currentUser.get() };
      delete sanitizedUser.password;

      res.status(httpStatus.OK).json(sanitizedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const allUsers = await User.findAll({
        attributes: { exclude: ["password"] },
      });

      res.status(httpStatus.OK).json(allUsers);
    } catch (error) {
      console.error("Error getting all users:", error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  },
};

module.exports = userController;
