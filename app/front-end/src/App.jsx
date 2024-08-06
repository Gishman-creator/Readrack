// App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axiosUtils from './utils/axiosUtils'; // Adjust path as necessary
import Home from './features/user/home/Home';
import User from './features/user/User';
import Admin from './features/admin/Admin';
import Authentication from './features/authentication/Authentication';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const validateTokens = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            console.log('accessToken:', accessToken);
            console.log('refreshToken:', refreshToken);
        
            if (!accessToken || !refreshToken) {
                setIsLoggedIn(false);
                return;
            }
        
            try {
                const response = await axiosUtils('/api/auth/validate-tokens', 'POST', {}, {
                    Authorization: `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                });
        
                console.log('Token validation response:', response);
        
                if (response.status === 200) {
                    const newAccessToken = response.data.accessToken; // Access the new token from response body
                    if (newAccessToken) {
                        localStorage.setItem('accessToken', newAccessToken);
                        console.log('New access token received and stored');
                    }
                    setIsLoggedIn(true);
                    console.log('Token validation successful');
                } else {
                    console.log('Token validation failed');
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Token validation failed:', error);
                setIsLoggedIn(false);
            }
        };
        

        validateTokens();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/*" element={<User />} />
                <Route
                    path="/admin/*"
                    element={isLoggedIn ? <Admin /> : <Navigate to="/auth" />}
                />
                <Route path="/auth/*" element={<Authentication />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default App;
