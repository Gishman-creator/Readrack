import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const SideBar = ({ isMenuOpen, toggleMenu }) => {

    const navigate = useNavigate();
    const navigateToHome = () => {
        navigate('/');
    };

    return (
        <div
            // Overlay with onClick handler to close the sidebar when clicked
            onClick={toggleMenu}
            className={`fixed min-w-full inset-0 z-30 bg-[rgba(0,0,0,0.5)] transition-opacity duration-300 ease-in-out ${
                isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            <div
                // Sidebar with event stopPropagation to prevent the toggleMenu function from firing when inside the sidebar
                onClick={(e) => e.stopPropagation()}
                className={`max-w-[18rem] h-full bg-white border border-[#bcbcbc] fixed top-0 left-0 transition-transform duration-300 ease-in-out z-21 ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className='z-24 flex items-center py-3 px-[2%] sm:px-[12%]'>
                    {/* Hamburger Menu for Small Screens */}
                    <div className='lg:hidden mr-1'>
                        <Bars3Icon className='w-10 h-10 p-2 cursor-pointer rounded-full on-click' onClick={toggleMenu} />
                    </div>
                    {/* Logo */}
                    <div title='Home' className='font-arsenal text-2xl flex cursor-pointer' onClick={navigateToHome}>
                        <h1 className='inline'>Series</h1>
                        <h1 className='inline font-semibold'>Order</h1>
                    </div>
                </div>
                <div className="flex flex-col px-[5%] sm:px-[15%] space-y-4">
                    <a href="#" className="">
                        Books
                    </a>
                    <a href="#" className="">
                        About
                    </a>
                    <a href="#" className="hidden">
                        Donate
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SideBar;
