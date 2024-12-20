import axios from 'axios';

const login = async (emailAddress, password) => {
  try {
    const response = await axios.post(`/auth`, {
      email: emailAddress,
      password: password,
    });

    const authToken = response.headers['x-auth-token'];

    return { token: authToken, user: response.data };
  } catch (error) {
    return error?.response?.data;
  }
};

const logout = (callback = () => console.log('store clear')) => {
  localStorage.clear();
};

const authService = {
  login,
  logout,
};

export default authService;
