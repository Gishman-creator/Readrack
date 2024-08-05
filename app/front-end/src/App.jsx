import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './features/user/home/Home';
import User from './features/user/User';
import Admin from './features/admin/Admin';
import Authentication from './features/authentication/Authentication';

const App = () => {
    // Check local storage for the authentication token
    const isLoggedIn = !!localStorage.getItem('authToken');

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
}

export default App;
