import axios from './axios';

const getAllMeals = async () => {
  try {
    const response = await axios.get('/meal');

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const createMeal = async (data) => {
  try {
    const response = await axios.post('/meal', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const updateMeal = async (id, data) => {
  try {
    const response = await axios.put(`/meal/${id}`, data);

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const deleteMeal = async (id) => {
  try {
    const response = await axios.delete(`/meal/${id}`);

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const mealService = {
  getAllMeals,
  createMeal,
  updateMeal,
  deleteMeal,
};

export default mealService;
