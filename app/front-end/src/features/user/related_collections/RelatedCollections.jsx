import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import axiosUtils from '../../../utils/axiosUtils';
import { SkeletonCard } from '../../../components/skeletons/SkeletonCard';
import Card from '../components/Card';
import { useSelector } from 'react-redux';
import { bufferToBlobURL } from '../../../utils/imageUtils';

function RelatedCollections({ data }) {
    const cardData = data;
    // console.log('The collection data received from the related collections:', cardData);
    const activeTab = useSelector((state) => state.user.activeTab) || tab;
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);

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
        <div className=' mb-5'>
            <div className='flex items-center justify-between'>
                <p className='font-poppins font-semibold text-lg 2xl:text-center'>Related books collections:</p>
                <div className='flex items-center justify-between space-x-2'>
                    <button onClick={scrollLeft} className='text-xl cursor-pointer p-2 rounded-full on-click'>
                        <ChevronLeftIcon className='w-5 h-5' />
                    </button>
                    <button onClick={scrollRight} className='text-xl cursor-pointer p-2 rounded-full on-click'>
                        <ChevronRightIcon className='w-5 h-5' />
                    </button>
                </div>
            </div>
            <div
                ref={scrollContainerRef}
                className='w-full flex flex-row pt-4 space-x-4 px-3 overflow-x-scroll scrollbar-hidden'
            >
                {cardData.map((item) => (
                    <Card key={item.id} card={item} activeTab='Collections' fixedWidth={true} />
                ))}
            </div>
        </div>
    );
}

export default RelatedCollections;
