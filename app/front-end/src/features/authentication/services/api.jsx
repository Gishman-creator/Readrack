// services/api.js
import Axios from '../utils/Axios'; // Adjust the import path as needed

const API_BASE_URL = '/api'; // Adjust according to your API base URL

// Login API request
export const login = (credentials) => {
    return Axios(`${API_BASE_URL}/login`, 'POST', credentials);
};

// Signup API request
export const signup = (userData) => {
    return Axios(`${API_BASE_URL}/signup`, 'POST', userData);
};

// Email verification API request
export const verifyEmail = (code) => {
    return Axios(`${API_BASE_URL}/verify-email`, 'POST', { code });
};
