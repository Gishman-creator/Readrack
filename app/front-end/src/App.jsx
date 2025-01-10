import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './features/user/home/Home';
import User from './features/user/User';
import Admin from './features/admin/Admin';
import Authentication from './features/authentication/Authentication';
import NotFoundPage from './pages/NotFoundPage';
import axiosUtils from './utils/axiosUtils';
import Sitemap from './Sitemap';

if (import.meta.env.MODE === 'production') {
    console.log = function () { };
}

const GetRobotsTxt = () => {
    const [robotsTxt, setRobotsTxt] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRobotsTxt = async () => {
            try {
                const response = await axiosUtils('/robots.txt', 'GET');
                setRobotsTxt(response.data); // Set the data to state
            } catch (error) {
                setError('Error fetching robots.txt');
                console.error('Error fetching robots.txt:', error);
            }
        };

        fetchRobotsTxt();
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    if (!robotsTxt) {
        return <div>Loading robots.txt...</div>;
    }

    return <pre>{robotsTxt}</pre>; // Render the robots.txt content
};

const App = () => {

    return (
        <div className='h-screen-nonav bg-[#f9f9f9]'>
            <Router>
                <Routes>
                    <Route path="/*" element={<User />} />
                    <Route path="/admin/*" element={<Admin />} />
                    <Route path="/auth/*" element={<Authentication />} />
                    {/* <Route path="/sitemap.xml" element={<Sitemap />} /> */}
                    {/* <Route path="/robots.txt" element={<GetRobotsTxt />} /> */}
                    <Route path='*' element={<NotFoundPage />} />
                </Routes>
            </Router>
        </div>
    );
};

export default App;
