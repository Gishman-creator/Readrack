import React, { useEffect, useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import SearchBar from './ui/SearchBar';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from '../slices/userSlice';

const NavBar = () => {
    const activeTab = useSelector((state) => state.user.activeTab);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const navigateToHome = () => {
        navigate('/');
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleSearch = (state) => setIsSearchOpen(state);
    const [hasShadow, setHasShadow] = useState(false);

    useEffect(() => {
        const storedTab = localStorage.getItem('userActiveTab');
        if (storedTab) {
            dispatch(setActiveTab(storedTab));
        }
    }, [dispatch]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setHasShadow(true);
            } else {
                setHasShadow(false);
            }
        }
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [])

    const handleTabClick = (tab) => {
        dispatch(setActiveTab(tab));
        localStorage.setItem('userActiveTab', tab);
    }

    return (
        <div className={`sticky top-0 flex w-full h-16 justify-between items-center px-[2%] sm:px-[12%] bg-white z-20 ${hasShadow ? 'custom-drop-shadow' : ''}`}>
            <div className={`z-24 sm:flex items-center ${isSearchOpen ? 'hidden' : 'flex'}`}>
                {/* Hamburger Menu for Small Screens */}
                <div className={`${isSearchOpen ? 'block' : 'sm:hidden'} lg:hidden mr-1`}>
                    <Bars3Icon className='w-10 h-10 p-2 cursor-pointer rounded-full on-click' onClick={toggleMenu} />
                </div>
                {/* Logo */}
                <div title='Home' className='font-arima text-2xl flex cursor-pointer' onClick={navigateToHome}>
                    <h1 className='inline'>Read</h1>
                    <h1 className='inline font-bold text-[#0d4f11]'>Right</h1>
                </div>
            </div>

            {/* Navigation Links */}
            <div className={`${isSearchOpen ? 'hidden' : 'sm:flex'} lg:flex hidden sm:space-x-4`}>
                <span
                    onClick={() => handleTabClick('Series')}
                    className={`cursor-pointer font-arima font-semibold ${ activeTab == 'Series' ? 'text-green-600 font-extrabold' : '' }`}
                >Series</span>
                <span
                    onClick={() => handleTabClick('Authors')}
                    className={`cursor-pointer font-arima font-semibold ${ activeTab == 'Authors' ? 'text-green-600 font-extrabold' : '' }`}
                >Authors</span>
                <span className='sm:hidden'>Donate</span>
            </div>

            {/* Render Search Bar */}
            <SearchBar isSearchOpen={isSearchOpen} toggleSearch={toggleSearch} />

            {/* Render Sidebar */}
            <SideBar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </div>
    );
};

export default NavBar;
