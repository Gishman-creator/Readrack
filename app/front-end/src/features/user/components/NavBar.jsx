import React, { useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import SideBar from './ui/SideBar';
import SearchBar from './ui/SearchBar';

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleSearch = (state) => setIsSearchOpen(state);

    return (
        <div className='relative flex w-full h-16 justify-between items-center px-[5%] sm:px-[12%] border border-[#bcbcbc] bg-white'>
            <div className={` sm:flex items-center ${isSearchOpen ? 'hidden' : 'flex'}`}>
                {/* Hamburger Menu for Small Screens */}
                <div className={`${isSearchOpen ? 'block' : 'sm:hidden'}  mr-1`}>
                    <Bars3Icon className='w-10 h-10 p-2 cursor-pointer rounded-full on-click' onClick={toggleMenu} />
                </div>
                {/* Logo */}
                <div title='Home' className='font-arsenal text-2xl flex cursor-pointer'>
                    <h1 className='inline'>Series</h1>
                    <h1 className='inline font-semibold'>Order</h1>
                </div>
            </div>

            {/* Navigation Links */}
            <div className={`${isSearchOpen ? 'hidden' : 'sm:flex'} hidden sm:space-x-4`}>
                <a href="#">Books</a>
                <a href="#">About</a>
                <a href="#" className='sm:hidden'>Donate</a>
            </div>

            {/* Render Search Bar */}
            <SearchBar isSearchOpen={isSearchOpen} toggleSearch={toggleSearch} />

            {/* Render Sidebar */}
            <SideBar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </div>
    );
};

export default NavBar;
