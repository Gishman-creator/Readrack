// features/auth/Authentication.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import VerifyEmail from './components/VerifyEmail';
import Logout from './components/Logout';

function Authentication() {
    return (
        <div className=" font-poppins min-h-screen bg-[#f6f9f2] flex items-center justify-center">
            <Routes>
                <Route path="/" element={<Navigate to='login' />} />
                <Route path="login" element={<Login />} />
                {/* <Route path="signup" element={<Signup />} /> */}
                <Route path="verify-email" element={<VerifyEmail />} />
                <Route path="logout" element={<Logout />} />
            </Routes>
        </div>
    );
}

export default Authentication;
