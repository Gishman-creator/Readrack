import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import harryPotterSerie from '../../../assets/harry_potter_serie.png';
import axiosUtils from '../../../utils/axiosUtils';
import { capitalize, formatDate } from '../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../utils/imageUtils';
import { useSelector } from 'react-redux';

function Cards() {
    const activeTab = useSelector((state) => state.user.activeTab);
    const [isLoading, setIsLoading] = useState(true);
    const [cardData, setCardData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response;
                if (activeTab === 'Series') {
                    response = await axiosUtils('/api/getSeries', 'GET');
                } else {
                    response = await axiosUtils('/api/getAuthors', 'GET');
                }
                console.log(`Fetched ${activeTab} data:`, response.data);

                const dataWithBlobs = response.data.map((item) => ({
                    ...item,
                    image: bufferToBlobURL(item.image),
                }));

                setCardData(dataWithBlobs);
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                console.error(`Error fetching ${activeTab} data:`, error);
            }
        };

        fetchData();
    }, [activeTab]);

    const navigateToDetails = (item) => {
        if (activeTab === 'Series') {
            navigate(`/series/${item.id}/${encodeURIComponent(item.name)}`);
        } else {
            navigate(`/authors/${item.id}/${encodeURIComponent(item.name)}`);
        }
    };

    if (isLoading) {
        return <p className="flex justify-center items-center">Loading...</p>;
    }

    return (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-10">
            {activeTab === 'Series'
                ? cardData.map((item) => (
                    <div
                        key={item.id}
                        className="w-full group hover:border-[#e1e1e1] rounded-md cursor-pointer"
                        onClick={() => navigateToDetails(item)}
                    >
                        <div className="overflow-hidden rounded-sm">
                            <img
                                src={item.image || harryPotterSerie}
                                alt="Serie image"
                                className="h-48 w-full transform transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex-col justify-center items-center py-1">
                            <p className="font-poppins font-medium">
                                {capitalize(item.name)} Serie
                            </p>
                            <p className="font-arima text-sm leading-3">by {item.author_name}</p>
                            <p className="font-arima font-medium text-sm text-green-600 mt-2">
                                {item.booksNo} books
                            </p>
                        </div>
                    </div>
                ))
                : cardData.map((item) => (
                    <div
                        key={item.id}
                        className="w-full group hover:border-[#e1e1e1] rounded-md cursor-pointer"
                        onClick={() => navigateToDetails(item)}
                    >
                        <div className="overflow-hidden rounded-sm">
                            <img
                                src={item.image || harryPotterSerie}
                                alt="Author image"
                                className="h-48 w-full transform transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex-col justify-center items-center py-1">
                            <p className="font-poppins font-medium">
                                {capitalize(item.name)}
                            </p>
                            <p className="font-arima text-sm leading-4">{capitalize(item.nationality)}</p>
                            <p className="font-arima font-medium text-sm text-green-600 mt-2">
                                {item.booksNo} books
                            </p>
                        </div>
                    </div>
                ))
            }
        </div>
    );
}

export default Cards;
