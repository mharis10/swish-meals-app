export const getAuthHeader = async () => {
	let token = localStorage.getItem('token');
  
	return token ? token : null;
  };