import axios from './axios';

const createCustomerPortalSession = async () => {
  try {
    const response = await axios.post('/subscription/createCustomerPortalSession');

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const subscriptionService = {
  createCustomerPortalSession,
};

export default subscriptionService;
