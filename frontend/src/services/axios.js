import axios from 'axios';
import { apiHost } from './host';
import { getAuthHeader } from './auth-header';
import AuthService from './auth-service';

axios.defaults.baseURL = apiHost;

const axiosInstance = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=UTF-8',
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  config.headers['x-auth-token'] = await getAuthHeader();
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
    } else if (error.response.status === 401) {
      setTimeout(() => {
        AuthService.logout();
        window.location = '/';
      }, 1000);
    }
    return error;
  }
);

export default axiosInstance;
