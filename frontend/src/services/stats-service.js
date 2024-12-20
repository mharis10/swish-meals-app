import axios from './axios';

const getWeeklyStats = async (fromDate, toDate) => {
  try {
    const response = await axios.get(
      `/stat/weekly?fromDate=${fromDate}&toDate=${toDate}`
    );

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const sendWeeklyStats = async (data) => {
  try {
    const response = await axios.post(`/stat/weekly/email`, data);

    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const statsService = {
  getWeeklyStats,
  sendWeeklyStats,
};

export default statsService;