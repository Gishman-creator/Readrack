import React, { useRef, useEffect, useState } from 'react';
import { MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router for navigation
import axiosUtils from '../../../../utils/axiosUtils';
import { capitalize } from '../../../../utils/stringUtils';
import { incrementSearchCount } from '../../../../utils/searchCountUtils';

const SearchBar = ({ isSearchOpen, toggleSearch }) => {
    const searchBarRef = useRef(null);
    const inputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const navigate = useNavigate();

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

    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Debounced search function
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchInstant(searchTerm);
            } else {
                setSearchResults([]);
            }
        }, 300); // Adjust debounce timing as necessary

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const searchInstant = async (term) => {
        setIsLoading(true); // Set loading to true when search starts
        try {
            const response = await axiosUtils('/api/search', 'GET', {}, {}, { query: term, type: 'all' });
            const results = response.data.results || []; // Ensure results is an array
            setSearchResults(results.slice(0, 5));
        } catch (error) {
            console.error('Error searching:', error);
            setSearchResults([]); // Clear results on error
        } finally {
            setIsLoading(false); // Set loading to false after request completes
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Prevent form submission
        navigate(`/search?q=${encodeURIComponent(searchTerm)}&type=all`);
        toggleSearch(false);
        setSearchTerm('');
    };

    const handleSelectResult = (result) => {
        if (result.type == 'serie') {
            navigate(`/series/${result.id}/${encodeURIComponent(result.name)}`);
        } else {
            navigate(`/authors/${result.id}/${encodeURIComponent(result.name)}`);
        }
        incrementSearchCount(result.type, result.id);
        toggleSearch(false);
    };

    return (
        <div ref={searchBarRef} className={` ${isSearchOpen ? 'w-full' : 'w-fit'} sm:w-fit relative flex items-center`}>
            {isSearchOpen ? (
                <div className='flex items-center w-full space-x-2'>
                    <ArrowLeftIcon
                        className='w-10 h-10 ml-2 cursor-pointer text-black p-2 rounded-lg sm:hidden on-click'
                        onClick={() => toggleSearch(false)}
                    />
                    <form onSubmit={handleSearchSubmit} className='flex h-fit w-full sm:w-fit border border-gray-300 rounded-lg items-center p-1'>
                        <input
                            ref={inputRef}
                            type='text'
                            placeholder='Search series and authors...'
                            className='p-1 w-full sm:w-60 text-sm ml-2 border-none outline-none rounded-lg'
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setIsLoading(true); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)} // Handle Enter key press
                        />
                        {isLoading ? (
                            <div className=" w-7 h-7 rounded-full border-t-2 border-green-700 animate-spin"></div>
                        ) : (
                            <MagnifyingGlassIcon
                                type='submit'
                                onClick={handleSearchSubmit} // Ensure this triggers form submission
                                className='on-click w-7 h-7 p-1 cursor-pointer font-bold rounded-lg text-[#000]'
                            />
                        )}
                    </form>
                </div>
            ) : (
                <MagnifyingGlassIcon
                    title='Search'
                    className='w-10 h-10 cursor-pointer text-black rounded-lg on-click p-2'
                    onClick={() => { toggleSearch(true) }}
                />
            )}
            {!isLoading &&
                searchResults.length > 0 && isSearchOpen ? (
                <div>
                    <div className='absolute top-full right-0 min-w-[84%] sm:min-w-[97%] bg-white border rounded shadow-md z-50 p-1'>
                        {searchResults.map((result) => (
                            <div
                                key={result.id}
                                className='p-2 cursor-pointer on-click rounded text-sm font-poppins font-medium'
                                onClick={() => handleSelectResult(result)}
                            >
                                {capitalize(result.name)} <span className='font-arima text-green-700'>({capitalize(result.type)})</span>
                            </div>
                        ))}
                        <div
                            className='bg-gray-100 p-2 px-3 cursor-pointer on-click rounded text-sm font-arima font-medium'
                            onClick={(e) => handleSearchSubmit(e)}
                        >
                            See all results for "{searchTerm}"
                        </div>
                    </div>
                </div>
            ) : (
                isSearchOpen && searchTerm && !isLoading && (

                    <div className='absolute top-full right-0 max-w-[84%] sm:max-w-full bg-white border rounded shadow-md z-50 p-1'>
                        <div
                            className='p-2 cursor-pointer on-click rounded text-sm font-medium font-arima text-gray-700'
                            onClick={() => { toggleSearch(false); setSearchTerm(''); }}
                        >
                            <span>Not results found for '{searchTerm}'</span>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default SearchBar;
