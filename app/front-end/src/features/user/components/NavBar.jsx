import React, { useEffect, useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import SearchBar from './ui/SearchBar';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveGenre, setActiveTab } from '../slices/userSlice';
import logo from '../../../assets/logo1.jpg'

const NavBar = () => {
    const activeTab = useSelector((state) => state.user.activeTab);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const navigateToHome = () => {
        navigate('/');
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleSearch = (state) => setIsSearchOpen(state);
    const [hasShadow, setHasShadow] = useState(false);

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
        dispatch(setActiveGenre(''));
        if (tab === 'Series') {
            navigate('/series');
        } else {
            navigate('/authors');
        }
    }

    return (
        <div className={`bg-white fixed top-0 flex min-w-full max-w-full h-14 justify-between items-center px-[2%] sm:px-[12%] z-20`}>
            <a href="/" className={`z-24 sm:flex items-center ${isSearchOpen ? 'hidden' : 'flex'}`} onClick={(e) => { e.preventDefault(); navigateToHome() }}>
                {/* Logo */}
                <div>
                    <img src={logo} alt="Logo" className="w-8 h-8 cursor-pointer" />
                </div>
                <div title='Home' className='font-arima text-2xl flex cursor-pointer'>
                    <h1 className='inline'>read</h1>
                    <h1 className='inline font-bold text-primary'>rack</h1>
                </div>
            </a>

            {/* Navigation Links */}
            <div className={`${isSearchOpen ? 'hidden' : 'sm:flex'} lg:flex hidden sm:space-x-4`}>
                <a
                    href='/series'
                    onClick={(e) => { e.preventDefault(); handleTabClick('Series') }}
                    className={`cursor-pointer font-arima font-semibold ${activeTab == 'Series' ? 'text-primary font-extrabold' : ''}`}
                >Series</a>
                <a
                    href='/authors'
                    onClick={(e) => { e.preventDefault(); handleTabClick('Authors') }}
                    className={`cursor-pointer font-arima font-semibold ${activeTab == 'Authors' ? 'text-primary font-extrabold' : ''}`}
                >Authors</a>
                <a className='sm:hidden'>Donate</a>
            </div>

            <div className={`${isSearchOpen && 'w-full sm:w-fit'} flex items-center space-x-2`}>
                <a
                    href='/series'
                    onClick={(e) => { e.preventDefault(); handleTabClick('Series') }}
                    className={`sm:hidden cursor-pointer font-arima font-semibold ${activeTab == 'Series' ? 'hidden' : (!isSearchOpen ? 'inline' : 'hidden')}`}
                >Series</a>
                <a
                    href='/authors'
                    onClick={(e) => { e.preventDefault(); handleTabClick('Authors') }}
                    className={`sm:hidden cursor-pointer font-arima font-semibold ${activeTab == 'Authors' ? 'hidden' : (!isSearchOpen ? 'inline' : 'hidden')}`}
                >Authors</a>
                {/* Render Search Bar */}
                <SearchBar isSearchOpen={isSearchOpen} toggleSearch={toggleSearch} />
            </div>

            {/* Render Sidebar */}
            <SideBar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </div>
    );
};

export default NavBar;
