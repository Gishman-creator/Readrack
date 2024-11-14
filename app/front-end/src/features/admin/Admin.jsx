import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/SideBar';
import Dashboard from './dashboard/Dashboard';
import CatalogCont from './catalog/CatalogCont';
import Editor from './UiElements/Editor';
import NavBar from './components/NavBar';
import { toggleVisibility } from './components/SideBarSlice';
import { useDispatch, useSelector } from 'react-redux';
import axiosUtils from '../../utils/axiosUtils'; // Adjust path as necessary
import { setLoginState } from '../authentication/slices/authSlice';
import Login from '../authentication/components/Login';
import NotFoundPage from '../../pages/NotFoundPage';
import NetworkErrorPage from '../../pages/NetworkErrorPage';
import logo from '../../assets/logo1.jpg';

function Admin() {
    const [isLoggedIn, setIsLoggedIn] = useState(null);  // Manage local login state
    const [networkError, setNetworkError] = useState(false);
    const dispatch = useDispatch();
    const { isExpanded } = useSelector((state) => state.sideBar);

    useEffect(() => {
        const validateTokens = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!accessToken || !refreshToken) {
                setIsLoggedIn(false);
                return;
            }

            try {
                const response = await axiosUtils('/api/auth/validate-tokens', 'POST', {}, {
                    Authorization: `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken,
                });

                if (response.status === 200) {
                    const newAccessToken = response.data.accessToken;
                    if (newAccessToken) {
                        localStorage.setItem('accessToken', newAccessToken);
                    }
                    setIsLoggedIn(true);
                    dispatch(setLoginState(true));
                } else {
                    setIsLoggedIn(false);
                    dispatch(setLoginState(false));
                }
            } catch (error) {
                console.error('Token validation failed:', error);
                if (error.message === "Network Error" || error.response.status === 500 || error.response.status === 501) {
                    setNetworkError(true);
                    // console.log("Network error networkError set to true");
                } else {
                    setIsLoggedIn(false);
                    dispatch(setLoginState(false));
                }
            }
        };

        validateTokens();
    }, [dispatch]);

    // Handle network error first
    if (networkError) {
        return <div className='h-screen pt-5 bg-white'><NetworkErrorPage /></div>;
    }

    // Return a loading indicator while checking login status
    if (isLoggedIn === null) {
        return <div className='h-screen flex justify-center items-center'><img src={logo} alt="Logo" className="w-[7rem] h-[7rem]" /></div>; // You can replace this with a proper loading component
    }

    return (
        isLoggedIn ? (
            <div className="flex min-h-screen bg-[#f9f9f9] font-poppins">
                <Sidebar />
                <div className={`flex-1 bg-[#f9f9f9] transition-margin duration-300 w-full ${isExpanded ? 'md:ml-[13.1rem]' : 'md:ml-[4.8rem]'}`}>
                    <NavBar />
                    <div className="p-4 px-5 bg-[#f9f9f9]">
                        <Routes>
                            <Route path="/" element={<Navigate to="/admin/dashboard" />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="catalog/*" element={<CatalogCont />} />
                            <Route path="editor" element={<Editor />} />
                            <Route path='*' element={<NotFoundPage />} />
                        </Routes>
                    </div>
                </div>
            </div>
        ) : (
            <Navigate to="/auth" />
        )
    );
}

export default Admin;
