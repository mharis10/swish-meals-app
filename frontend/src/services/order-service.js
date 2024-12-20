import axios from './axios';

const createOrder = async (data) => {
  try {
    const response = await axios.post('/order', data);

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const getMyActiveOrder = async () => {
  try {
    const response = await axios.get('/order/active');

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const getAllOrders = async () => {
  try {
    const response = await axios.get('/order/all');

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const updateMyOrder = async (id, data) => {
  try {
    const response = await axios.put(`/order/${id}`, data);

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const orderService = {
  createOrder,
  getMyActiveOrder,
  getAllOrders,
  updateMyOrder,
};

export default orderService;
