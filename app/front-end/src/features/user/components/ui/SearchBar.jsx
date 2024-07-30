import React, { useRef, useEffect, useState } from 'react';
import { MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ isSearchOpen, toggleSearch }) => {
    const searchBarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                toggleSearch(false);
            }
        };

        if (isSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen, toggleSearch]);

    return (
        <div ref={searchBarRef} className={` ${isSearchOpen ? 'w-full' : 'w-fit'} sm:w-fit relative flex items-center`}>
            {isSearchOpen ? (
                <div className='flex items-center w-full space-x-6'>
                    <ArrowLeftIcon
                        className='w-8 h-8 ml-2 cursor-pointer text-black p-1 rounded-full sm:hidden on-click'
                        onClick={() => toggleSearch(false)}
                    />
                    <div className='flex h-fit w-full sm:w-fit border rounded-md items-center'>
                        <input
                            type='text'
                            placeholder='Search...'
                            className='p-1 w-full sm:w-60 ml-2 border-none outline-none rounded'
                        />
                        <MagnifyingGlassIcon
                            className='bg-[#eff0eb] w-9 h-6 mr-1 px-2 cursor-pointer font-bold rounded-md text-[#000] on-click'
                        />
                    </div>
                </div>
            ) : (
                <MagnifyingGlassIcon
                    title='Search'
                    className='w-10 h-10 cursor-pointer text-black rounded-full p-2 on-click'
                    onClick={() => toggleSearch(true)}
                />
            )}
        </div>
    );
};

export default SearchBar;
