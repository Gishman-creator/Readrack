import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import axiosUtils from '../../../utils/axiosUtils';
import { SkeletonCard } from '../../../components/skeletons/SkeletonCard';
import Card from '../components/Card';
import { useSelector } from 'react-redux';
import { bufferToBlobURL } from '../../../utils/imageUtils';

function Recommendations({ data, tab }) {
    const [cardData, setCardData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const activeTab = useSelector((state) => state.user.activeTab) || tab;
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (!activeTab || !data) return;

            try {
                let response;
                const requestBody = { data };

                if (activeTab === 'Series') {
                    response = await axiosUtils(`/api/recommendSeries`, 'POST', requestBody);
                } else {
                    response = await axiosUtils(`/api/recommendAuthors`, 'POST', requestBody);
                }

                // console.log('The recommended are:', response)

                const dataWithBlobs = response.data.map((item) => ({
                    ...item,
                    image: item.image ? bufferToBlobURL(item.image) : null,
                }));

                setCardData(dataWithBlobs);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [data, activeTab]);

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
                {isLoading ? (
                    [...Array(10)].map((_, index) => (
                        <SkeletonCard key={index} />
                    ))
                ) : cardData.length === 0 ? (
                    <p className='text-center font-arima mb-10'>Sorry! No recommendations available</p>
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
