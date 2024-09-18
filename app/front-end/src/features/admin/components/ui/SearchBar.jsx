import React, { useRef, useEffect, useState } from 'react';
import { MagnifyingGlassIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, setTableLimitEnd, setTableLimitStart } from '../../slices/catalogSlice';

const SearchBar = ({ isSearchOpen, toggleSearch }) => {
    const searchTerm = useSelector((state) => state.catalog.searchTerm);
    const [searchValue, setSearchValue] = useState(searchTerm);
    const searchBarRef = useRef(null);
    const inputRef = useRef(null); // Reference for the input
    const dispatch = useDispatch();

    useEffect(() => {
        setSearchValue(searchTerm);
        const handleClickOutside = (event) => {
            if (
                searchBarRef.current &&
                !searchBarRef.current.contains(event.target) &&
                searchTerm === ''
            ) {
                toggleSearch(false); // Close only if searchTerm is empty
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
    }, [isSearchOpen, searchTerm, toggleSearch]);

    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            // Delay focusing to ensure the input is rendered
            const timer = setTimeout(() => inputRef.current.focus(), 100);
            return () => clearTimeout(timer); // Cleanup timer on unmount or before the next effect
        }
    }, [isSearchOpen]);

    useEffect(() => {
        // Create a timeout for clearing the search term
        const timeoutId = setTimeout(() => {
            if (!searchValue) {
                dispatch(setSearchTerm(''));
                dispatch(setTableLimitStart(0));
                dispatch(setTableLimitEnd(50));
            }
        }, 2000); // Adjust the delay time as needed (500ms here)
    
        // Clear the timeout if the component unmounts or searchValue changes before the timeout completes
        return () => clearTimeout(timeoutId);
    }, [searchValue, dispatch]);

    const handleSearchClick = () => {
        toggleSearch(true);
        if (!searchTerm) {
            dispatch(setTableLimitStart(0));
            dispatch(setTableLimitEnd(50));
        }
    };

    const handleInputChange = (e) => {
        if (e.key === 'Enter') {
            dispatch(setSearchTerm(e.target.value));
            // console.log('The search term is:', e.target.value);
            dispatch(setTableLimitStart(0));
            dispatch(setTableLimitEnd(50));
        }
    };

    const clearSearch = () => {
        setSearchValue('');
        inputRef.current.focus();
        if (searchTerm === '') {
            toggleSearch(false)
        }
    };

    return (
        <div
            ref={searchBarRef}
            className={`${isSearchOpen ? 'w-full' : 'w-fit'
                } lg:max-w-[50%] sm:w-fit relative block items-center`}
        >
            {isSearchOpen ? (
                <div className="flex sm:justify-end items-center w-full lg:max-w-fit space-x-6">
                    <ArrowLeftIcon
                        className="w-8 h-8 ml-2 cursor-pointer text-black p-1 rounded-lg sm:hidden on-click"
                        onClick={() => {
                            if (searchTerm === '') toggleSearch(false);
                        }}
                    />
                    <div className="bg-white flex text-sm py-1 h-fit w-full sm:w-fit border rounded-lg items-center">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleInputChange}
                            className="p-1 w-full sm:w-60 ml-2 border-none outline-none rounded"
                            ref={inputRef} // Attach the ref to the input
                        />
                        <XMarkIcon
                            className="w-6 h-6 mr-1 px-1 cursor-pointer font-bold rounded-lg text-[#000] on-click"
                            onClick={clearSearch} // Clear search term when clicked
                        />
                    </div>
                </div>
            ) : (
                <MagnifyingGlassIcon
                    title="Search"
                    className="w-8 h-8 cursor-pointer text-black rounded-lg p-2 on-click"
                    onClick={handleSearchClick}
                />
            )}
        </div>
    );
};

export default SearchBar;
