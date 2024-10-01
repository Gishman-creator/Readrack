import axios from 'axios';

// Hardcoded base URL for debugging purposes
const BASE_URL = import.meta.env.VITE_BASE_URL;

const axiosUtils = (url, method, data = {}, headers = {}, params = {}, signal = null) => {
    const fullUrl = `${BASE_URL}${url}`;

    // console.log(`Request URL: ${fullUrl}`);
    // console.log(`Request Method: ${method}`);
    // console.log(`Request Data:`, data);
    // console.log(`Request Headers:`, headers);
    // console.log(`Request Params:`, params);
    console.log(`Request signal:`, signal);

    return axios({
        url: fullUrl,
        method: method,
        headers: {
            ...headers,
            'Content-Type': headers['Content-Type'] || 'application/json',
        },
        data: data,
        params: params,
        signal: signal, // Pass the abort signal here
    }).then(res => res)
      .catch(err => {
          console.error(`Error making request: ${err}`);
          throw err;
      });
};

export default axiosUtils;
