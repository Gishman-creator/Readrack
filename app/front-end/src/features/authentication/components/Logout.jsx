// components/Logout.jsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice'; // Adjust the import path as needed
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            // console.log('accessToken:', accessToken);
            // console.log('refreshToken:', refreshToken);
            if (accessToken && refreshToken) {
                try {
                    const action = await dispatch(logout({ accessToken, refreshToken }));
                    if (logout.fulfilled.match(action)) {
                        // Only remove items from localStorage if logout is successful
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userEmail');
                        navigate('/auth/login');
                    } else {
                        console.error('Logout failed:', action.payload);
                    }
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            }
        };

        handleLogout();
    }, [dispatch, navigate]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">Logging out...</div>
        </div>
    );
};

export default Logout;
