import React, { useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bars3Icon, HomeIcon, UsersIcon, CodeBracketSquareIcon, ArrowRightStartOnRectangleIcon, FolderOpenIcon, ChartBarIcon, AdjustmentsVerticalIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline';
import { toggleVisibility, toggleExpansion, setVisibility, setExpansion } from './SideBarSlice';

const SideBar = () => {
    const dispatch = useDispatch();
    const activeTab = useSelector((state) => state.catalog.activeTab);
    const { isVisible, isExpanded } = useSelector((state) => state.sideBar);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                dispatch(setVisibility(true));
                dispatch(setExpansion(false));
            } else {
                dispatch(setVisibility(false));
                dispatch(setExpansion(true));
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [dispatch]);

    const isCatalogRoute = location.pathname.startsWith('/admin/catalog');

    return (
        <>
            <div
                className={`fixed ${window.innerWidth < 768 ? (isVisible ? 'min-w-full' : 'w-full') : 'w-full'} md:max-w-fit top-0 left-0 min-h-screen  bg-[rgba(0,0,0,0.5)] z-30 transition-opacity ease-in-out duration-300 shadow-md
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'} `}
                onClick={() => dispatch(toggleVisibility())}
            >
                <div className="flex flex-col max-w-fit h-screen bg-white p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex max-w-fit items-center justify-between">
                        <Bars3Icon
                            className='w-10 h-10 rounded-lg p-2 cursor-pointer on-click-sidebar block md:hidden'
                            onClick={() => dispatch(toggleVisibility())}
                        />
                        <Bars3Icon
                            className='w-10 h-10 rounded-lg p-2 cursor-pointer on-click-sidebar hidden md:block'
                            onClick={() => dispatch(toggleExpansion())}
                        />
                    </div>
                    <nav className="flex flex-col justify-between mt-4 space-y-2 h-full">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/admin/dashboard"
                                    title={isExpanded ? null : 'Dashboard'}
                                    className={`flex items-center p-1 on-click-sidebar ${isExpanded ? 'rounded' : 'rounded-lg'} ${location.pathname === '/admin/dashboard' ? 'bg-primary text-white hover:bg-primary' : ''
                                        }`}
                                    onClick={() => dispatch(toggleVisibility())}
                                >
                                    <ChartBarSquareIcon className={`${isExpanded ? 'mr-2' : 'mr-0'} w-9 h-9 p-2`} />
                                    <span className={`text-xs mr-14 ${isExpanded ? 'block' : 'hidden'}`}>
                                        Dashboard
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to={`/admin/catalog?tab=${activeTab.toLowerCase()}`}
                                    title={isExpanded ? null : 'Catalog'}
                                    className={`flex items-center p-1 on-click-sidebar ${isExpanded ? 'rounded' : 'rounded-lg'} ${isCatalogRoute ? 'bg-primary text-white hover:bg-primary' : ''
                                        }`}
                                    onClick={() => dispatch(toggleVisibility())}
                                >
                                    <FolderOpenIcon className={`${isExpanded ? 'mr-2' : 'mr-0'} w-9 h-9 p-2`} />
                                    <span className={`text-xs mr-14 ${isExpanded ? 'block' : 'hidden'}`}>
                                        Catalog
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/admin/editor"
                                    title={isExpanded ? null : 'Ui elements'}
                                    className={`flex items-center p-1 on-click-sidebar ${isExpanded ? 'rounded' : 'rounded-lg'} ${location.pathname === '/admin/editor' ? 'bg-primary text-white hover:bg-primary' : ''
                                        }`}
                                    onClick={() => dispatch(toggleVisibility())}
                                >
                                    <CodeBracketSquareIcon className={`${isExpanded ? 'mr-2' : 'mr-0'} w-9 h-9 p-2`} />
                                    <span className={`text-xs mr-14 ${isExpanded ? 'block' : 'hidden'}`}>
                                        Ui elements
                                    </span>
                                </Link>
                            </li>
                        </ul>
                        <ul>
                            <li
                                title={isExpanded ? null : 'Logout'}
                                className={`flex items-center p-1 on-click-sidebar ${isExpanded ? 'rounded' : 'rounded-lg'} cursor-pointer`}
                                onClick={() => {
                                    // Perform any additional actions if needed before navigation
                                    navigate('/auth/logout');
                                }}
                            >
                                <ArrowRightStartOnRectangleIcon className={`${isExpanded ? 'mr-2' : 'mr-0'} w-9 h-9 p-2`} />
                                <span className={`text-xs mr-14 ${isExpanded ? 'block' : 'hidden'}`}>
                                    Logout
                                </span>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default SideBar;
