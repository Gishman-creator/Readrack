import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import harryPotterSerie from '../../../assets/harry_potter_serie.png';

function Recommendations() {
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);

    const navigateToSeriesDetails = (serieName) => {
        const formattedSerieName = serieName.toLowerCase().replace(/\s+/g, '-');
        navigate(`/series/${formattedSerieName}`);
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -200,
                behavior: 'smooth',
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 200,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className=''>
            <div className='flex items-center justify-between'>
                <p className='font-poppins'>You may also like:</p>
                <div className='hidden md:flex items-center justify-between space-x-2'>
                    <button onClick={scrollLeft} className='text-xl cursor-pointer p-2 rounded-full on-click'>
                    <ChevronLeftIcon className='w-6 h-6' />
                    </button>
                    <button onClick={scrollRight} className='text-xl cursor-pointer p-2 rounded-full on-click'>
                    <ChevronRightIcon className='w-6 h-6' />
                    </button>
                </div>
            </div>
            <div
                ref={scrollContainerRef}
                className='w-full flex flex-row pt-4 pb-10 space-x-4 overflow-x-scroll scrollbar-hidden'
            >
                {[...Array(5)].map((_, index) => (
                    <div
                        key={index}
                        className='w-[12rem] flex-shrink-0 border border-[#ededed] hover:border-[#e1e1e1] hover:shadow-sm rounded-md cursor-pointer'
                        onClick={() => {
                            navigateToSeriesDetails('Harry Potter');
                        }}
                    >
                        <img
                            src={harryPotterSerie}
                            alt='Serie image'
                            className='h-44 w-full bg-[#edf4e6] rounded-sm'
                        />
                        <div className='flex-col justify-center items-center py-2 px-2'>
                            <p className='font-poppins font-semibold text-sm'>
                                Harry Potter Series
                            </p>
                            <p className='font-arsenal text-xs'>by J.K. Rowling</p>
                            <p className='font-poppins font-semibold text-xs text-[#b5b5b5]'>
                                7 books
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Recommendations;
