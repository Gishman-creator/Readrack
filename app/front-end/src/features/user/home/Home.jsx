import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import GenreList from '../components/ui/GenreList';
import Card from '../components/Card';
import Pagination from '../components/ui/Pagination';
import { useSelector, useDispatch } from 'react-redux';
import axiosUtils from '../../../utils/axiosUtils';
import { bufferToBlobURL } from '../../../utils/imageUtils';
import { SkeletonCard } from '../components/skeletons/SkeletonCard';
import NotFoundPage from '../../../pages/NotFoundPage';

export default function Home() {
    const activeTab = useSelector((state) => state.user.activeTab);
    const activeGenre = useSelector((state) => state.user.activeGenre);

    const [pageLimitStart, setPageLimitStart] = useState(1);
    const [pageLimitEnd, setPageLimitEnd] = useState(31);
    const [pageInterval, setPageInterval] = useState(30);
    const [totalItems, setTotalItems] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [cardData, setCardData] = useState([]);

    const dispatch = useDispatch();

    const updatePageLimitAndInterval = () => {
        const width = window.innerWidth;
        if (width >= 1536) {
            setPageLimitEnd(90);
            setPageInterval(90);
        } else if (width >= 1024 && width < 1536) {
            setPageLimitEnd(75);
            setPageInterval(75);
        } else if (width >= 640 && width < 1024) {
            setPageLimitEnd(45);
            setPageInterval(45);
        } else {
            setPageLimitEnd(30);
            setPageInterval(30);
        }
        // Reset to the first page whenever tab or genre changes
        setPageLimitStart(0);
    };

    useEffect(() => {
        updatePageLimitAndInterval();
        window.addEventListener('resize', updatePageLimitAndInterval);

        return () => {
            window.removeEventListener('resize', updatePageLimitAndInterval);
        };
    }, []);

    useEffect(() => {
        // Update page limits when activeTab or activeGenre changes
        updatePageLimitAndInterval();
    }, [activeTab, activeGenre]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (!activeTab) return; // Wait until activeTab is set

            try {
                let response;
                if (activeTab === 'Series') {
                    response = await axiosUtils(`/api/getSeries?genre=${activeGenre}&limitStart=${pageLimitStart}&limitEnd=${pageLimitEnd}`, 'GET');
                } else {
                    response = await axiosUtils(`/api/getAuthors?genre=${activeGenre}&limitStart=${pageLimitStart}&limitEnd=${pageLimitEnd}`, 'GET');
                }

                const { data, totalCount } = response.data;

                const dataWithBlobs = data.map((item) => ({
                    ...item,
                    image: bufferToBlobURL(item.image),
                }));

                setTotalItems(totalCount);
                console.log('Data fetched', dataWithBlobs);
                setCardData(dataWithBlobs);
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                console.error(`Error fetching ${activeTab} data:`, error);
                if (error.response && error.response.status === 404) {
                    setNotFound(true);
                }
            }
        };

        fetchData();
    }, [activeTab, activeGenre, pageLimitStart, pageLimitEnd]);

    const handlePageChange = (newPageStart, newPageEnd) => {
        setPageLimitStart(newPageStart);
        setPageLimitEnd(newPageEnd);
    };

    if (notFound) {
        return <NotFoundPage type={activeTab} />
    }

    return (
        <div className='bg-white px-[4%] sm:px-[12%] pb-10'>
            <GenreList />
            <div className={`mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 ${activeTab === 'Series' ? 'gap-6 md:gap-0' : 'gap-5 md:gap-0'}`}>
                {isLoading ? (
                    [...Array(pageLimitEnd)].map((_, index) => (
                        <SkeletonCard key={index} />
                    ))
                ) : (
                    cardData.map((item) => (
                        <Card key={item.id} card={item} activeTab={activeTab} />
                    ))
                )}
            </div>
            <Pagination
                pageLimitStart={pageLimitStart}
                pageLimitEnd={pageLimitEnd}
                pageInterval={pageInterval}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                toTop={true}
            />
        </div>
    );
}
