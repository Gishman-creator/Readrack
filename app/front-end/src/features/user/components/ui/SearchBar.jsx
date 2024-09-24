import React, { useRef, useEffect, useState } from 'react';
import { MagnifyingGlassIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router for navigation
import axiosUtils from '../../../../utils/axiosUtils';
import { capitalize, spacesToHyphens } from '../../../../utils/stringUtils';
import { incrementSearchCount } from '../../../../utils/searchCountUtils';
import { delay } from 'lodash';

const SearchBar = ({ isSearchOpen, toggleSearch }) => {
    const searchBarRef = useRef(null);
    const inputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [isInputFocused, setIsInputFocused] = useState(true); // Input focus state
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            // setIsInputFocused(false);
            if (
                searchBarRef.current &&
                !searchBarRef.current.contains(event.target) &&
                searchTerm.trim() === '' // Close only if the search term is empty
            ) {
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
    }, [isSearchOpen, toggleSearch, searchTerm]); // Include searchTerm in the dependency array


    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            inputRef.current.focus();
        } else if (!isSearchOpen) {
            setSearchTerm(''); // Clear search term when search is closed
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
        }, 500); // Adjust debounce timing as necessary

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const searchInstant = async (term) => {
        setIsInputFocused(true);
        setIsLoading(true); // Set loading to true when search starts
        try {
            const response = await axiosUtils('/api/search', 'GET', {}, {}, { query: term, type: 'all' });
            const results = response.data.results || []; // Ensure results is an array
            // console.log('The results are:', response.data)
            setSearchResults(results.slice(0, 5));
        } catch (error) {
            console.error('Error searching:', error);
            setSearchResults([]); // Clear results on error
        } finally {
            setIsLoading(false); // Set loading to false after request completes
        }
    };

    const handleSearchSubmit = (e) => {
        // console.log('Handle search submit called');
        e.preventDefault(); // Prevent form submission
        navigate(`/search?q=${decodeURIComponent(searchTerm)}&type=all`);
        setIsInputFocused(false);
        setSearchTerm('');
        toggleSearch(false);
    };

    const handleSelectResult = (result) => {
        // console.log('Result selected:', result);
        if (result.type == 'serie') {
            navigate(`/series/${result.id}/${spacesToHyphens(result.name)}`);
        } else if (result.type == 'author') {
            navigate(`/authors/${result.id}/${spacesToHyphens(result.name)}`);
        } else if (result.type == 'collection') {
            navigate(`/collections/${result.id}/${spacesToHyphens(result.name)}`);
        }
        setIsInputFocused(false);
        incrementSearchCount(result.type, result.id);
    };

    const clearSearch = () => {
        setSearchTerm('');
        inputRef.current.focus();
        if (searchTerm === '') {
            toggleSearch(false)
        }
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
                            onFocus={() => setIsInputFocused(true)} // Set focus state to true
                            onBlur={() => {
                                setTimeout(() => {
                                    setIsInputFocused(false); // Delay setting focus state to false
                                }, 300);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)} // Handle Enter key press
                        />
                        {isLoading ? (
                            searchTerm ?
                                <div className="mr-1 p-2 green-loader"></div>
                                :
                                <MagnifyingGlassIcon
                                    type='submit'
                                    onClick={handleSearchSubmit} // Ensure this triggers form submission
                                    className='on-click w-7 h-7 p-1 cursor-pointer font-bold rounded-lg text-[#000]'
                                />
                        ) : (
                            searchTerm ?
                                <XMarkIcon
                                    className="w-6 h-6 mr-1 px-1 cursor-pointer font-bold rounded-lg text-[#000] on-click"
                                    onClick={clearSearch} // Clear search term when clicked
                                />
                                :
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
            {isInputFocused && !isLoading &&
                searchResults.length > 0 && isSearchOpen ? (
                <div>
                    <div className='absolute top-full right-0 min-w-[88%] sm:min-w-[17.7rem] bg-white border rounded-lg shadow-md z-50 p-1 space-y-1'>
                        {searchResults.map((result) => (
                            <div
                                key={result.id}
                                className='p-2 cursor-pointer on-click rounded-lg text-sm font-poppins font-medium'
                                onClick={() => handleSelectResult(result)} // Make sure this is correctly bound
                            >
                                {result.type === 'serie' && capitalize(result.serieName)}
                                {result.type === 'author' && capitalize(result.nickname || result.authorName)}
                                {result.type === 'collection' && capitalize(result.collectionName)}
                                <span className='font-arima text-green-700'>({capitalize(result.type)})</span>
                            </div>
                        ))}
                        <div
                            className='bg-gray-100 p-2 px-3 cursor-pointer on-click rounded text-sm font-arima font-medium'
                            onClick={handleSearchSubmit}
                        >
                            See all results for "{searchTerm}"
                        </div>
                    </div>
                </div>
            ) : (
                isInputFocused && isSearchOpen && searchTerm && !isLoading && (

                    <div className='absolute top-full right-0 min-w-[88%] sm:min-w-[17.7rem] bg-white border rounded shadow-md z-50 p-1'>
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
