const Joi = require('joi');

const UserAuth = {
    validateUserAuth: (user) => {
        const userAuthSchema = Joi.object({
            email: Joi.string().max(100).required(),
            password: Joi.string().max(50).required(),
        });

        return userAuthSchema.validate(user);
    },
};

module.exports = UserAuth;