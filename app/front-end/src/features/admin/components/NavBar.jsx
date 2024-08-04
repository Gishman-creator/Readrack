import React, { useEffect, useRef, useState } from 'react'
import profile from '../../../assets/profile.png'
import { useDispatch, useSelector } from 'react-redux';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { toggleVisibility } from './SideBarSlice';

function NavBar() {

    const dispatch = useDispatch();
    const {isVisible} = useSelector((state) => state.sideBar);
    const [hasShadow, setHasShadow] = useState(false);

    useEffect (() => {
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

    return (
        <div className={`sticky z-20 top-0 bg-[#ecf3e5] h-16 px-5 w-full flex flex-row justify-between items-center ${hasShadow ? 'drop-shadow-sm' : ''}`}>
            <div className='flex flex-row justify-center items-center'>
                <div className='block md:hidden'>
                    <Bars3Icon
                        className='block md:hidden w-10 h-10 rounded mr-2 p-2 cursor-pointer on-click'
                        onClick={() => dispatch(toggleVisibility())}
                    />
                </div>
                <div title='Home' className='font-arsenal text-2xl flex cursor-pointer'>
                    <h1 className='inline'>Read</h1>
                    <h1 className='inline font-semibold'>Right</h1>
                </div>
            </div>
            <img src={profile} alt="profile picture" className='bg-slate-200 hover:bg-slate-300 w-10 h-10 rounded-full' />
        </div>
    )
}

export default NavBar