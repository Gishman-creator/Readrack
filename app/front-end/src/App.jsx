import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axiosUtils from './utils/axiosUtils'; // Adjust path as necessary
import Home from './features/user/home/Home';
import User from './features/user/User';
import Admin from './features/admin/Admin';
import Authentication from './features/authentication/Authentication';
import Modal from './features/admin/components/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { setLoginState } from './features/authentication/slices/authSlice';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
    const isLoggedIn =  useSelector((state) => state.auth.isLoggedIn);
    const dispatch = useDispatch();

    useEffect(() => {
        const validateTokens = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            // console.log('accessToken:', accessToken);
            // console.log('refreshToken:', refreshToken);

            if (!accessToken || !refreshToken) {
                dispatch(setLoginState(false));
                return;
            }

            try {
                const response = await axiosUtils('/api/auth/validate-tokens', 'POST', {}, {
                    Authorization: `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken,
                });

                // console.log('Token validation response:', response);

                if (response.status === 200) {
                    const newAccessToken = response.data.accessToken; // Ensure `accessToken` is in response.data
                    if (newAccessToken) {
                        localStorage.setItem('accessToken', newAccessToken);
                        // console.log('New access token received and stored');
                    }
                    dispatch(setLoginState(true));
                } else {
                    // console.log('Token validation failed');
                    dispatch(setLoginState(false));
                }
            } catch (error) {
                console.error('Token validation failed:', error);
                dispatch(setLoginState(false));
            }
        };

        validateTokens();
    }, []);

    if (isLoggedIn === null) {
        // Render a loading state while checking the token
        return <div className=" bg-[#f9f9f9] flex justify-center items-center min-h-screen"></div>;
    }

    return (
        <div className='min-h-screen bg-[#f9f9f9]'>
            <Router>
                <Routes>
                    <Route path="/*" element={<User />} />
                    <Route
                        path="/admin/*"
                        element={isLoggedIn ? <Admin /> : <Navigate to="/auth" />}
                    />
                    <Route path="/auth/*" element={<Authentication />} />
                    <Route path='*' element={<NotFoundPage />} />
                </Routes>
            </Router>
        </div>
    );
};

export default App;
