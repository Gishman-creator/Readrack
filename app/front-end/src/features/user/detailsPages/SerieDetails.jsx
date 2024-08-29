import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../utils/axiosUtils';
import { capitalize, formatDate } from '../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../utils/imageUtils';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Recommendations from '../recommendations/Recommendations';
import { incrementSearchCount } from '../../../utils/searchCountUtils';
import NotFoundPage from '../../../pages/NotFoundPage';
import blank_image from '../../../assets/brand_blank_image.png';

function SerieDetails() {
  const { serieId, serieName } = useParams();
  const [serieData, setSerieData] = useState({});
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booksLimit, setBooksLimit] = useState();
  const [booksCount, SetBooksCount] = useState();
  const [notFound, setNotFound] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const updatePageLimitAndInterval = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setBooksLimit(6);
      } else {
        setBooksLimit(5);
      }
    };

    updatePageLimitAndInterval();
    window.addEventListener('resize', updatePageLimitAndInterval);

    return () => {
      window.removeEventListener('resize', updatePageLimitAndInterval);
    };
  }, [serieId]);

  useEffect(() => {
    const fetchSeriesData = async () => {
      if (!booksLimit) return;
      try {
        const serieResponse = await axiosUtils(`/api/getSerieById/${serieId}`, 'GET');
        setSerieData(serieResponse.data);
        console.log('Serie data:', serieResponse.data.image)

        // Convert series image
        if (serieResponse.data.image) {
          serieResponse.data.image = bufferToBlobURL(serieResponse.data.image);
        }

        // If serieName is not in the URL, update it
        if (!serieName) {
          const fetchedSerieName = serieResponse.data.name;
          navigate(`/serie/${serieId}/${encodeURIComponent(fetchedSerieName)}`, { replace: true });
        }

        const booksResponse = await axiosUtils(`/api/getBooksBySerie/${serieResponse.data.name}?limit=${booksLimit}`, 'GET');
        console.log('Books response:', booksResponse.data); // Debugging

        const booksWithBlobs = booksResponse.data.books.map((book) => {
          console.log('Book data:', book); // Debugging
          return {
            ...book,
            image: bufferToBlobURL(book.image) // Convert buffer to Blob URL
          };
        });
        setBooks(booksWithBlobs);
        SetBooksCount(booksResponse.data.totalCount);
        console.log('The total count is:', booksResponse.data.totalCount);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.response);
        setLoading(false);
        if (error.response && error.response.status === 404) {
          setNotFound(true);
        }
      }
    };

    fetchSeriesData();
  }, [serieId, serieName, navigate, booksLimit]);

  const handleSetLimit = () => {
    if (window.innerWidth >= 1024) {
      setBooksLimit(booksLimit === 6 ? booksCount : 6);
    } else {
      setBooksLimit(booksLimit === 5 ? booksCount : 5);
    }
    console.log('Books limit set to:', booksLimit);
  }

  if (loading) {
    return <p className='flex justify-center items-center'>Loading...</p>;
  } else if (notFound) {
    return <NotFoundPage type='serie' />
  }

  return (
    <div className=' px-[4%] sm:px-[12%]'>
      <div className='md:flex md:flex-row pt-2 md:space-x-6 xl:space-x-8 pb-10'>
        <div className='w-full pt-2 md:w-[22rem] md:h-full md:sticky md:top-20 lg:top-[4.5rem] overflow-hidden'>
          <div className=' max-w-[13rem] mx-auto'>
            <img src={serieData.image || blank_image} alt="serie image" className='h-[16rem] w-full bg-[#edf4e6] rounded-lg mx-auto object-cover' />
            <div className='w-full mx-auto'>
              <p
                title={capitalize(serieData.name)}
                className='font-poppins font-medium text-lg text-center md:text-left mt-2 overflow-hidden whitespace-nowrap text-ellipsis cursor-default'
              >
                {capitalize(serieData.name)}
              </p>
              <p
                className='font-arima text-center md:text-left hover:underline cursor-pointer'
                onClick={() => {
                  navigate(`/authors/${serieData.author_id}/${encodeURIComponent(serieData.author_name)}`);
                  incrementSearchCount('author', serieData.author_id);
                }}
              >
                by {capitalize(serieData.author_name)}
              </p>
              <div className='w-full md:items-center mt-4 leading-3 md:max-w-[90%]'>
                <p className='md:inline font-medium font-poppins text-center md:text-left text-sm'>Genres:</p>
                <div className='md:inline flex flex-wrap gap-x-2 md:ml-1 text-sm text-center md:text-left font-arima items-center justify-center md:justify-start max-w-[90%] mx-auto'>
                  {serieData.genres}
                </div>
              </div>
            </div>
          </div>
          {serieData.link &&
            <a
              href={serieData.link}
              target="_blank"
              rel="noopener noreferrer"
              className='bg-[#37643B] block w-[60%] md:w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mx-auto mt-6 on-click-amzn'>
              Find on Amazon
            </a>
          }
        </div>
        <div className='w-full '>
          <p className='font-poppins font-semibold text-xl mt-8 md:mt-0 2xl:w-full 2xl:text-center'>
            {capitalize(serieData.name)} Books:
          </p>
          <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
            {books.map((item, index) => (
              <div key={item.id} className='flex space-x-2 mt-4 pb-3 border-b-2 border-slate-100 cursor-default'>
                <img
                  src={item.image || blank_image} // Fallback image if Blob URL is null
                  alt='book image'
                  className='h-[9rem] w-[6rem] rounded-lg object-cover'
                />
                <div className='min-h-full w-full flex flex-col justify-between'>
                  <p className='font-semibold m-0 leading-5 text-lg'>
                    {capitalize(item.name)}
                  </p>
                  <p className='font-arima text-sm'>by {capitalize(item.author_name)}</p>
                  <p className='font-arima text-slate-400 text-sm mt-1'>
                    #{index + 1}, published {formatDate(item.date)}
                  </p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className='bg-[#37643B] block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto on-click-amzn'
                  >
                    Find on Amazon
                  </a>
                </div>
              </div>
            ))}
          </div>
          {(booksCount > booksLimit || booksLimit > 6) && (
            <span
              onClick={() => handleSetLimit()}
              className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
            >
              {booksLimit < booksCount ? 'Show more' : 'Show less'}
            </span>
          )}
        </div>
      </div>
      <Recommendations genres={serieData.genres} />
    </div>
  );
}

export default SerieDetails;
