import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import harryPotterSerie from '../../../assets/harry_potter_serie.png'
import axiosUtils from '../../../utils/axiosUtils';
import { capitalize } from '../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../utils/imageUtils';

function Cards() {
    const [isLoading, setIsLoading] = useState(true)
    const [series, setSeries] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosUtils('/api/getSeries', 'GET');
                console.log('Fetched series:', response.data);

                const seriesWithBlobs = response.data.map((serie) => {
                    console.log('Serie data', serie);
                    return {
                        ...serie,
                        image: bufferToBlobURL(serie.image)
                    };
                });

                setSeries(seriesWithBlobs);
                setIsLoading(false)
                console.log('Series data:', series)
            } catch (error) {
                setIsLoading(false)
                console.error('Error fetching series data:', error);
            }
        }

        fetchData();
    }, [setIsLoading]);

    const navigateToDetails = (item) => {
        navigate(`/series/${item.id}/${encodeURIComponent(item.name)}`)
    };

    if (isLoading) {
        return <p className='flex justify-center items-center'>Loading...</p>;
    }

    return (
        <div className='mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-10'>
            {series.map((item) => (
                <div
                    key={item.id}
                    className='w-full group hover:border-[#e1e1e1] rounded-md cursor-pointer'
                    onClick={() => { navigateToDetails(item) }}
                >
                    <div className='overflow-hidden rounded-sm'>
                        <img src={item.image || harryPotterSerie} alt="Serie image" className='h-48 w-full transform transition-transform duration-300 group-hover:scale-105' />
                    </div>
                    <div className='flex-col justify-center items-center py-1'>
                        <p className='font-poppins font-medium'>{capitalize(item.name)} Serie</p>
                        <p className='font-arsenal text-sm leading-3'>by {item.author_name}</p>
                        <p className='font-arsenal font-medium text-sm text-green-800 mt-2'>{item.booksNo} books</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Cards;
