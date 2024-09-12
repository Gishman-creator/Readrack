import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './features/user/home/Home';
import User from './features/user/User';
import Admin from './features/admin/Admin';
import Authentication from './features/authentication/Authentication';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
    return (
        <div className='h-screen-nonav bg-[#f9f9f9]'>
            <Router>
                <Routes>
                    <Route path="/*" element={<User />} />
                    <Route path="/admin/*" element={<Admin />} />
                    <Route path="/auth/*" element={<Authentication />} />
                    <Route path='*' element={<NotFoundPage />} />
                </Routes>
            </Router>
        </div>
    );
};

export default App;
