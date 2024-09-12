import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { setActiveGenre, setActiveTab } from '../slices/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FaLayerGroup, FaPen, FaInfoCircle } from 'react-icons/fa'; // Import from FontAwesome
import { FaUserPen } from 'react-icons/fa6'; // Import from FontAwesome
import { MdCollections } from 'react-icons/md';
import logo from '../../../assets/logo1.jpg'

const SideBar = ({ isMenuOpen, toggleMenu }) => {

    const activeTab = useSelector((state) => state.user.activeTab);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const navigateToHome = () => {
        navigate('/');
    };

    return (
        <div
            // Overlay with onClick handler to close the sidebar when clicked
            onClick={toggleMenu}
            className={`fixed min-w-full inset-0 z-50 bg-[rgba(0,0,0,0.5)] transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <div
                // Sidebar with event stopPropagation to prevent the toggleMenu function from firing when inside the sidebar
                onClick={(e) => e.stopPropagation()}
                className={`max-w-fit h-full bg-white border border-[#bcbcbc] fixed top-0 left-0 transition-transform duration-300 ease-in-out p-2 px-3 pt-0 z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className='z-50 flex items-center py-3 '>
                    {/* Hamburger Menu for Small Screens */}
                    <div className='lg:hidden mr-1'>
                        <Bars3Icon className='w-10 h-10 p-2 cursor-pointer rounded-lg on-click' onClick={toggleMenu} />
                    </div>
                    {/* Logo */}
                    <div>
                        <img src={logo} alt="Logo" className="w-8 h-8" />
                    </div>
                    <div title='Home' className='font-arima text-2xl flex cursor-pointer' onClick={() => {navigateToHome(); toggleMenu()}}>
                        <h1 className='inline'>read</h1>
                        <h1 className='inline font-bold text-green-700'>rack</h1>
                    </div>
                </div>
                <ul className="space-y-2 font-poppins font-medium mt-5">
                    <li>
                        <Link
                            to="/series"
                            onClick={() => { toggleMenu(); dispatch(setActiveTab('')); dispatch(setActiveGenre('')); }}
                            className={`flex items-center p-2 on-click rounded-lg ${location.pathname.startsWith('/series') ? 'bg-green-700 text-white on-click-amzn' : ''
                                }`}
                        >
                            <FaLayerGroup className='mr-2 w-8 h-8 p-2' />
                            <span className='text-xs mr-28'>
                                Series
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/authors"
                            onClick={() => { toggleMenu(); dispatch(setActiveTab('')); dispatch(setActiveGenre('')); }}
                            className={`flex items-center p-2 on-click rounded-lg ${location.pathname.startsWith('/authors') ? 'bg-green-700 text-white on-click-amzn' : ''
                                }`}
                        >
                            <FaUserPen className='mr-2 w-8 h-8 p-2' />
                            <span className='text-xs mr-28'>
                                Authors
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/about-us"
                            onClick={() => { toggleMenu(); dispatch(setActiveTab('')); dispatch(setActiveGenre('')); }}
                            className={`flex items-center p-2 on-click rounded-lg ${location.pathname.startsWith('/about') ? 'bg-green-700 text-white on-click-amzn' : ''
                                }`}
                        >
                            <FaInfoCircle className='mr-2 w-8 h-8 p-2' />
                            <span className='text-xs mr-28'>
                                About
                            </span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SideBar;
