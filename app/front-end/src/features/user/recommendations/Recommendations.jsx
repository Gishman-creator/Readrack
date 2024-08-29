import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import axiosUtils from '../../../utils/axiosUtils';
import { SkeletonCard } from '../components/skeletons/SkeletonCard';
import Card from '../components/Card';
import { useSelector } from 'react-redux';
import { bufferToBlobURL } from '../../../utils/imageUtils';

function Recommendations({ genres }) {

    const [cardData, setCardData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const activeTab = useSelector((state) => state.user.activeTab);
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (!activeTab || !genres) return;

            try {
                let response;
                if(activeTab == 'Series') {
                    response = await axiosUtils(`/api/recommendSeries?genres=${genres}`, 'GET')
                } else {
                    response = await axiosUtils(`/api/recommendAuthors?genres=${genres}`, 'GET')
                }

                const dataWithBlobs = response.data.map((item) => ({
                    ...item,
                    image: bufferToBlobURL(item.image),
                }));

                setCardData(dataWithBlobs);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            }
        }

        fetchData();
    }, [genres, activeTab]);

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
                <p className='font-poppins font-semibold text-lg 2xl:text-center'>You may also like:</p>
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
                className='w-full flex flex-row pt-4 space-x-4 overflow-x-scroll scrollbar-hidden'
            >
                {isLoading ? (
                    [...Array(10)].map((_, index) => (
                        <SkeletonCard key={index} />
                    ))
                ) : (
                    cardData.map((item) => (
                        <Card key={item.id} card={item} activeTab={activeTab} fixedWidth={true} />
                    ))
                )}
            </div>
        </div>
    );
}

export default Recommendations;
