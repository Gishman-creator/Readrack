import React, { useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function GenreList() {
    const scrollContainerRef = useRef(null);

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

    return (
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
                <div className='absolute mx-5 sm:mx-0 top-0 left-0 h-full w-8 bg-gradient-to-r from-white to-transparent pointer-events-none'></div>
                <div className='absolute mx-5 sm:mx-0 top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none'></div>
                <div 
                    ref={scrollContainerRef}
                    className='flex px-2 py-4 mx-5 sm:mx-0 space-x-2 text-sm font-poppins font-semibold overflow-x-scroll scrollbar-hidden'>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                    <p className='px-2 py-1 rounded-lg cursor-pointer on-click'>Fantasy</p>
                </div>
            </div>

            {/* Right Arrow Icon */}
            <button 
                onClick={scrollRight} 
                title='Next'
                className='hidden sm:block p-2 text-black rounded-full on-click'>
                <ChevronRightIcon className='w-6 h-6' />
            </button>
        </div>
    );
}

export default GenreList;
