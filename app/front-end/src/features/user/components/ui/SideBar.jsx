import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SideBar = ({ isMenuOpen, toggleMenu }) => {
    return (
        <div
            className={`fixed z-50 top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div
                className={`w-64 h-full bg-white border border-[#bcbcbc] fixed top-0 left-0 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'transform translate-x-0' : 'transform -translate-x-full'}`}
            >
                <div className='flex justify-between p-[5%]'>
                    <div className='font-arsenal text-2xl flex'>
                        <h1 className='inline'>Series</h1>
                        <h1 className='inline font-semibold'>Order</h1>
                    </div>
                    <XMarkIcon title='Close' className='w-10 h-10 p-2 rounded-full cursor-pointer text-black on-click' onClick={toggleMenu} />
                </div>
                <div className='flex flex-col p-4 space-y-4'>
                    <a href="#" className='text-gray-800'>Books</a>
                    <a href="#" className='text-gray-800'>About</a>
                    <a href="#" className='text-gray-800'>Donate</a>
                </div>
            </div>
        </div>
    );
};

export default SideBar;
