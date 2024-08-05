// utils/Axios.js
import axios from 'axios';

// Hardcoded base URL for debugging purposes
const BASE_URL = import.meta.env.VITE_BASE_URL;

const axiosUtils = (url, method, data = {}, headers = {}, params = {}) => {
    const fullUrl = `${BASE_URL}${url}`;

    return axios({
        url: fullUrl,
        method: method,
        headers: headers,
        data: method === 'POST' || method === 'PUT' ? data : undefined, // Use data for POST/PUT, otherwise undefined
        params: method === 'GET' || method === 'DELETE' ? params : undefined, // Use params for GET/DELETE, otherwise undefined
    }).then(res => res.data);
};

export default axiosUtils;
