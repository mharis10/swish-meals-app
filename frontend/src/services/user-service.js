import axios from './axios';

const signUp = async (data) => {
  try {
    const response = await axios.post('/user', data);

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};


const getMyUser = async () => {
  try {
    const response = await axios.get('/user/me');

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const getAllUsers = async () => {
  try {
    const response = await axios.get('/user/all');

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const updateMyUser = async (data) => {
  try {
    const response = await axios.patch('/user/me', data);

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const userService = {
  signUp,
  getMyUser,
  getAllUsers,
  updateMyUser,
};

export default userService;
