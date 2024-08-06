import axios from 'axios';

// Hardcoded base URL for debugging purposes
const BASE_URL = import.meta.env.VITE_BASE_URL;

const axiosUtils = (url, method, data = {}, headers = {}, params = {}) => {
    const fullUrl = `${BASE_URL}${url}`;

    console.log(`Request URL: ${fullUrl}`);
    console.log(`Request Method: ${method}`);
    console.log(`Request Data:`, data);
    console.log(`Request Headers:`, headers);
    console.log(`Request Params:`, params);

    return axios({
        url: fullUrl,
        method: method,
        headers: headers, // Ensure Content-Type is set
        data: data, // Use data for POST/PUT, otherwise undefined
        params: params, // Use params for GET/DELETE, otherwise undefined
    }).then(res => res)
      .catch(err => {
          console.error(`Error making request: ${err}`);
          throw err;
      });
};

export default axiosUtils;
