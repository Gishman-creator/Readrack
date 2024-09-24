import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosUtils from '../../../utils/axiosUtils';
import Card from '../components/Card';
import { bufferToBlobURL } from '../../../utils/imageUtils';
import Pagination from '../components/ui/Pagination';
import { SkeletonCard } from '../../../components/skeletons/SkeletonCard';
import Dropdown from '../components/ui/Dropdown';
import NetworkErrorPage from '../../../pages/NetworkErrorPage';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialQuery = searchParams.get('q') || '';
    const [type, setType] = useState(searchParams.get('type') || 'All');

    // Available types for the dropdown
    const types = ['All', 'Series', 'Authors'];

    // State variables for series, authors, loading state, and search term
    const [series, setSeries] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [networkError, setNetworkError] = useState(false);

    const [seriePageLimitStart, setSeriePageLimitStart] = useState();
    const [authorPageLimitStart, setAuthorPageLimitStart] = useState();
    const [seriePageLimitEnd, setSeriePageLimitEnd] = useState();
    const [authorPageLimitEnd, setAuthorPageLimitEnd] = useState();
    const [pageInterval, setPageInterval] = useState();
    const [totalSeries, setTotalSeries] = useState();
    const [totalAuthors, setTotalAuthors] = useState();
    const [searchTerm, setSearchTerm] = useState(initialQuery);

    useEffect(() => {
        // console.log('The isloading state is:', isLoading);
        // console.log('The page interval is:', pageInterval);
    }, [isLoading, pageInterval])

    useEffect(() => {
        setSearchTerm(initialQuery);
        // console.log('Initial query:', initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        const updatePageLimitAndInterval = () => {
            const width = window.innerWidth;
            setSeriePageLimitStart(0);
            setAuthorPageLimitStart(0);
            if (width >= 1536) {
                if (type == 'all' && totalSeries > 0 && totalAuthors > 0) {
                    setSeriePageLimitEnd(6);
                    setAuthorPageLimitEnd(6);
                    setPageInterval(6);
                } else {
                    setSeriePageLimitEnd(18);
                    setAuthorPageLimitEnd(18);
                    setPageInterval(18);
                }
            } else if (width >= 1024 && width < 1536) {
                if (type == 'all' && totalSeries > 0 && totalAuthors > 0) {
                    setSeriePageLimitEnd(5);
                    setAuthorPageLimitEnd(5);
                    setPageInterval(5);
                } else {
                    setSeriePageLimitEnd(15);
                    setAuthorPageLimitEnd(15);
                    setPageInterval(15);
                }
            } else if (width >= 640 && width < 1024) {
                if (type == 'all' && totalSeries > 0 && totalAuthors > 0) {
                    setSeriePageLimitEnd(3);
                    setAuthorPageLimitEnd(3);
                    setPageInterval(3);
                } else {
                    setSeriePageLimitEnd(9);
                    setAuthorPageLimitEnd(9);
                    setPageInterval(9);
                }
            } else {
                if (type == 'all' && totalSeries > 0 && totalAuthors > 0) {
                    setSeriePageLimitEnd(2);
                    setAuthorPageLimitEnd(2);
                    setPageInterval(2);
                } else {
                    setSeriePageLimitEnd(6);
                    setAuthorPageLimitEnd(6);
                    setPageInterval(6);
                }
            }
        };

        updatePageLimitAndInterval();
        window.addEventListener('resize', updatePageLimitAndInterval);

        return () => {
            window.removeEventListener('resize', updatePageLimitAndInterval);
        };
    }, [type, totalSeries, totalAuthors]);

    useEffect(() => {
        if (seriePageLimitStart === undefined || seriePageLimitEnd === undefined || authorPageLimitStart === undefined || authorPageLimitEnd === undefined) return;

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const response = await axiosUtils(`/api/search?query=${initialQuery}&type=${type}&seriePageLimitStart=${seriePageLimitStart}&seriePageLimitEnd=${seriePageLimitEnd}&authorPageLimitStart=${authorPageLimitStart}&authorPageLimitEnd=${authorPageLimitEnd}`, 'GET');
                // console.log('The search results are:', response);

                const dataWithBlobs = response.data.results.map((item) => ({
                    ...item,
                    image: bufferToBlobURL(item.image),
                }));

                if (type === 'series') {
                    setSeries(dataWithBlobs);
                    setTotalSeries(response.data.totalSeriesCount);
                    setAuthors([]);
                } else if (type === 'authors') {
                    setAuthors(dataWithBlobs);
                    setTotalAuthors(response.data.totalAuthorsCount);
                    setSeries([]);
                } else {
                    const seriesData = dataWithBlobs.filter(result => result.type === 'serie');
                    const authorsData = dataWithBlobs.filter(result => result.type === 'author');
                    setSeries(seriesData);
                    setTotalSeries(response.data.totalSeriesCount);
                    setAuthors(authorsData);
                    setTotalAuthors(response.data.totalAuthorsCount);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
                if (error.message === "Network Error" || error.response.status === 500 || error.response.status === 501) {
                    setNetworkError(true);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [initialQuery, type, seriePageLimitStart, authorPageLimitStart, seriePageLimitEnd, authorPageLimitEnd]);

    const handlePageChange = (newPageStart, newPageEnd, isSeries) => {
        if (isSeries) {
            setSeriePageLimitStart(newPageStart);
            setSeriePageLimitEnd(newPageEnd);
        } else {
            setAuthorPageLimitStart(newPageStart);
            setAuthorPageLimitEnd(newPageEnd);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        navigate(`/search?q=${searchTerm}&type=${type}`);
        // setInitialQuery(searchTerm);
    };

    const handleTypeChange = (selectedType) => {
        const formattedSelectedType = selectedType.toLowerCase();
        navigate(`/search?q=${searchTerm}&type=${formattedSelectedType}`);
        setType(formattedSelectedType);
    };

    if (networkError) {
        return <NetworkErrorPage />
    }

    return (
        <div className="px-[4%] sm:px-[12%] pb-10">
            <div className='flex justify-between items-center'>
                <form onSubmit={handleSearchSubmit} className='flex h-fit w-full text-sm sm:w-[70%] lg:w-[50%] border text-gray-700 border-gray-300 rounded-lg items-center p-1'>
                    <input
                        type='text'
                        placeholder='Search'
                        className='p-1 w-full ml-2 border-none outline-none '
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className='bg-green-700 rounded-lg py-2 px-4 text-white font-poppins font-medium'>
                        Search
                    </button>
                </form>
                <Dropdown types={types} selectedType={type} onSelectType={handleTypeChange} />
            </div>

            {/* Handle case when no results are found */}
            {series.length === 0 && authors.length === 0 && !isLoading ? (
                <p className="font-arima my-10">
                    No results found for "{searchTerm}"
                    {type == 'all' ? '.' : ` in ${type}.`}
                </p>
            ) : (isLoading ? (
                <>
                    <div className='mt-8 mb-4 bg-gray-200 h-5 w-[8rem] animate-pulse rounded-lg'></div>
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-0'>
                        {[...Array(pageInterval)].map((_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    {/* Display series results */}
                    {series.length > 0 && (
                        <div>
                            <h2 className="font-poppins font-semibold mb-3 mt-6">Series</h2>
                            <div className='mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-0'>
                                {series.map((result) => (
                                    <Card key={result.id} card={result} activeTab="Series" />
                                ))}
                            </div>
                            <Pagination
                                pageLimitStart={seriePageLimitStart}
                                pageLimitEnd={seriePageLimitEnd}
                                pageInterval={pageInterval}
                                totalItems={totalSeries}
                                onPageChange={(newPageStart, newPageEnd) => handlePageChange(newPageStart, newPageEnd, true)}
                                toTop={false}
                            />
                        </div>
                    )}

                    {/* Display authors results */}
                    {authors.length > 0 && (
                        <div>
                            <h2 className="font-poppins font-semibold mb-3 mt-10">Authors</h2>
                            <div className='mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-0'>
                                {authors.map((result) => (
                                    <Card key={result.id} card={result} activeTab="Authors" />
                                ))}
                            </div>
                            <Pagination
                                pageLimitStart={authorPageLimitStart}
                                pageLimitEnd={authorPageLimitEnd}
                                pageInterval={pageInterval}
                                totalItems={totalAuthors}
                                onPageChange={(newPageStart, newPageEnd) => handlePageChange(newPageStart, newPageEnd, false)}
                                toTop={false}
                            />
                        </div>
                    )}
                </>
            ))}

        </div>
    );
};

export default SearchResults;
