import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './features/user/home/Home';
import User from './features/user/User';
import Admin from './features/admin/Admin';
import Authentication from './features/authentication/Authentication';
import NotFoundPage from './pages/NotFoundPage';

if (import.meta.env.MODE === 'production') {
    console.log = function () {};
}

// Now you can use console.log as normal in development, but it will be ignored in production.
// console.error will still work as usual.
console.log("This will not show in production");
console.error("This will show in both development and production");

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
