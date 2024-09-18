import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import axiosUtils from '../../../../utils/axiosUtils'; // Adjust the import path as needed
import { setActiveGenre } from '../../slices/userSlice';
import { capitalize } from '../../../../utils/stringUtils';

function GenreList() {
    const activeTab = useSelector((state) => state.user.activeTab);
    const activeGenre = useSelector((state) => state.user.activeGenre);
    const scrollContainerRef = useRef(null);
    const [genres, setGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Add isLoading state
    const dispatch = useDispatch();

    useEffect(() => {
        if (!activeTab) return;
        const fetchGenres = async () => {
            setIsLoading(true); // Set loading to true when fetching starts
            try {
                const response = await axiosUtils(`/api/getGenres?tab=${activeTab}`, 'GET');
                setGenres(response.data.genres);
            } catch (error) {
                console.error('Error fetching genres:', error);
            } finally {
                setIsLoading(false); // Set loading to false once fetching completes
            }
        };

        fetchGenres();
    }, [activeTab]);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -200, // Adjust this value to control scroll speed
                behavior: 'smooth'
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 200, // Adjust this value to control scroll speed
                behavior: 'smooth'
            });
        }
    };

    const handleGenreClick = (genre) => {
        dispatch(setActiveGenre(genre));
    };

    const renderSkeleton = () => (
        <div className='flex px-2 py-4 mx-0 sm:mx-0 space-x-2 text-sm font-poppins overflow-x-scroll whitespace-nowrap scrollbar-hidden'>
            {Array.from({ length: 15 }).map((_, index) => (
                <div key={index} className='px-3 py-3 rounded-lg bg-gray-300 animate-pulse min-w-[5rem]'></div>
            ))}
        </div>
    );

    return (
        <div className='bg-white sticky top-[3.5rem] z-10 py-1 px-[4%] sm:px-[12%]'>
            <div className='relative flex items-center'>
                {/* Left Arrow Icon */}
                <button
                    onClick={scrollLeft}
                    title='Previous'
                    className='hidden sm:block p-2 text-black rounded-full on-click'>
                    <ChevronLeftIcon className='w-6 h-6' />
                </button>

                {/* Scrollable Content Container with Blurring Effect */}
                <div className='relative flex-1 overflow-hidden'>
                    <div className='absolute mx-0 sm:mx-0 top-0 -left-1 h-full w-10 bg-gradient-to-r from-white to-transparent pointer-events-none'></div>
                    <div className='absolute mx-0 sm:mx-0 top-0 -right-5 h-full w-24 bg-gradient-to-l from-white to-transparent pointer-events-none'></div>
                    {isLoading ? (
                        renderSkeleton()
                    ) : (
                        <div
                            ref={scrollContainerRef}
                            className='flex px-2 mx-0 sm:mx-0 space-x-2 text-sm font-poppins overflow-x-scroll whitespace-nowrap scrollbar-hidden'>
                            {genres.map((genre, index) => (
                                <p
                                    key={index}
                                    className={`px-3 py-1 rounded-lg cursor-pointer on-click ${genre === activeGenre ? 'bg-green-700 text-white on-click-amzn' : ''
                                        }`}
                                    onClick={() => handleGenreClick(genre)}
                                >
                                    {capitalize(genre)}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Arrow Icon */}
                <button
                    onClick={scrollRight}
                    title='Next'
                    className='hidden sm:block p-2 text-black rounded-full on-click'>
                    <ChevronRightIcon className='w-6 h-6' />
                </button>
            </div>
        </div>
    );
}

export default GenreList;
