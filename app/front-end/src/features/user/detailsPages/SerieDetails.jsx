import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../utils/axiosUtils';
import { capitalize, formatDate } from '../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../utils/imageUtils';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

function SerieDetails() {
  const { serieId } = useParams();
  const [seriesData, setSeriesData] = useState({});
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        const seriesResponse = await axiosUtils(`/api/getSerieById/${serieId}`, 'GET');
        setSeriesData(seriesResponse.data);

        // Convert series image
        if (seriesResponse.data.image) {
          seriesResponse.data.image = bufferToBlobURL(seriesResponse.data.image);
        }

        const serieName = seriesResponse.data.name;

        const booksResponse = await axiosUtils(`/api/getBookBySerie/${serieName}`, 'GET');
        console.log('Books response:', booksResponse.data[0]); // Debugging

        const booksWithBlobs = booksResponse.data[0].map((book) => {
          console.log('Book data:', book); // Debugging
          return {
            ...book,
            image: bufferToBlobURL(book.image) // Convert buffer to Blob URL
          };
        });
        setBooks(booksWithBlobs);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching series data:', error);
        setLoading(false);
      }
    };

    fetchSeriesData();
  }, [serieId]);

  if (loading) {
    return <p className='flex justify-center items-center'>Loading...</p>;
  }

  return (
    <div className='md:flex md:flex-row pt-2 md:space-x-6 xl:space-x-8 px-[4%] sm:px-[12%] pb-10'>
      <div className='w-full pt-2 md:w-[22rem] md:h-full md:sticky md:top-20 lg:top-20 overflow-auto'>
        <div className=' max-w-[13rem] mx-auto'>
          <img src={seriesData.image} alt="serie image" className='h-[16rem] w-full bg-[#edf4e6] rounded-sm mx-auto' />
          <div className='w-full mx-auto'>
            <p className='font-poppins font-medium text-xl text-center md:text-left mt-2'>{capitalize(seriesData.name)}</p>
            <p className='font-arima text-center md:text-left'>by {capitalize(seriesData.author_name)}</p>
            <div className='w-full md:flex md:items-center mt-4'>
              <p className=' font-poppins font-medium text-center md:text-left text-sm'>Genres:</p>
              <div className='flex flex-wrap gap-x-2 md:ml-2 font-normal items-center justify-center md:justify-start w-[90%] mx-auto'>
                {seriesData.genres?.split(',').map((genre, index) => (
                  <span key={index} className='text-sm'>{genre.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <a
          href={seriesData.link}
          target="_blank"
          rel="noopener noreferrer"
          className='bg-[#37643B] block w-[60%] md:w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mx-auto mt-6 on-click-amzn'>
          Series on Amazon
        </a>
      </div>
      <div className='w-full'>
        <p className='font-poppins font-semibold text-xl mt-8 md:mt-0 2xl:w-full 2xl:text-center'>
          {capitalize(seriesData.name)} Books:
        </p>
        <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
          {books.map((item) => (
            <div key={item.id} className='flex space-x-2 mt-4 pb-3 border-b-2 border-slate-100 cursor-default'>
              <img
                src={item.image || '/default-image.jpg'} // Fallback image if Blob URL is null
                alt='book image'
                className='h-[9rem] w-[6rem] rounded-sm'
              />
              <div className='min-h-full w-full flex flex-col justify-between'>
                <p className='font-semibold m-0 leading-5 text-lg'>
                  {capitalize(item.name)}
                </p>
                <p className='font-arima text-sm'>by {capitalize(item.author_name)}</p>
                <p className='font-arima text-slate-400 text-sm mt-1'>
                  #{item.rank}, published {formatDate(item.date)}
                </p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='bg-[#37643B] block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto on-click-amzn'
                >
                  Buy on Amazon
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SerieDetails;
