import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../utils/axiosUtils';
import { capitalize, formatDate } from '../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { NewspaperIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Recommendations from '../recommendations/Recommendations';
import NotFoundPage from '../../../pages/NotFoundPage';
import blank_image from '../../../assets/brand_blank_image.png'

function AuthorDetails() {
  const { authorId, authorName } = useParams();
  const [authorData, setAuthorData] = useState({});
  const [series, setSeries] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [seriesLimit, setSeriesLimit] = useState();
  const [booksLimit, setBooksLimit] = useState();
  const [seriesCount, SetSeriesCount] = useState();
  const [booksCount, SetBooksCount] = useState();
  const [notFound, setNotFound] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const updatePageLimitAndInterval = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setSeriesLimit(4);
        setBooksLimit(6);
      } else {
        setSeriesLimit(3);
        setBooksLimit(5);
      }
    };

    updatePageLimitAndInterval();
    window.addEventListener('resize', updatePageLimitAndInterval);

    return () => {
      window.removeEventListener('resize', updatePageLimitAndInterval);
    };
  }, [authorId]);

  useEffect(() => {
    const fetchBooksData = async () => {
      if (!seriesLimit || !booksLimit) return;
      try {
        const authorResponse = await axiosUtils(`/api/getAuthorById/${authorId}`, 'GET');
        console.log(authorResponse.data);
        setAuthorData(authorResponse.data);

        // Convert books image
        if (authorResponse.data.image) {
          authorResponse.data.image = bufferToBlobURL(authorResponse.data.image);
        }

        // If serieName is not in the URL, update it
        if (!authorName) {
          const fetchedAuthorName = authorResponse.data.name;
          navigate(`/authors/${authorId}/${encodeURIComponent(fetchedAuthorName)}`, { replace: true });
        }

        // Fetching series by the author
        const seriesResponse = await axiosUtils(`/api/getSeriesByAuthor/${authorResponse.data.name}?limit=${seriesLimit}`, 'GET');
        console.log('Series response:', seriesResponse.data); // Debugging

        const seriesWithBlobs = seriesResponse.data.series.map((serie) => {
          return {
            ...serie,
            image: bufferToBlobURL(serie.image) // Convert buffer to Blob URL
          };
        });
        setSeries(seriesWithBlobs);
        SetSeriesCount(seriesResponse.data.totalCount);

        // Fetching books by the author
        const booksResponse = await axiosUtils(`/api/getBooksByAuthor/${authorResponse.data.name}?limit=${booksLimit}`, 'GET');
        console.log('Books response:', booksResponse.data); // Debugging

        const booksWithBlobs = booksResponse.data.books.map((book) => {
          return {
            ...book,
            image: bufferToBlobURL(book.image) // Convert buffer to Blob URL
          };
        });
        setBooks(booksWithBlobs);
        SetBooksCount(booksResponse.data.totalCount);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.response);
        setLoading(false);
        if (error.response && error.response.status === 404) {
          setNotFound(true);
        }
      }
    };

    fetchBooksData();
  }, [authorId, authorName, navigate, seriesLimit, booksLimit]);

  const handleSetLimit = (type) => {
    if (type == 'series') {
      if (window.innerWidth >= 1024) {
        setSeriesLimit(seriesLimit === 4 ? booksCount : 4);
      } else {
        setSeriesLimit(seriesLimit === 3 ? booksCount : 3);
      }
      console.log('Series limit set to:', seriesLimit);
    } else {
      if (window.innerWidth >= 1024) {
        setBooksLimit(booksLimit === 6 ? booksCount : 6);
      } else {
        setBooksLimit(booksLimit === 5 ? booksCount : 5);
      }
      console.log('Books limit set to:', booksLimit);
    }
  }

  if (loading) {
    return <p className='flex justify-center items-center'>Loading...</p>;
  } else if (notFound) {
    return <NotFoundPage type='author' />
  }

  return (
    <div className='px-[4%] sm:px-[12%]'>
      <div className='md:flex md:flex-row md:space-x-6 xl:space-x-8 mb-10'>
        <div className='w-full pt-2 md:w-[22rem] md:h-full md:sticky md:top-20 lg:top-[4.5rem] overflow-auto'>
          <div className=' max-w-[13rem] mx-auto'>
            <img src={authorData.image || blank_image} alt="author image" className='h-[16rem] w-full bg-[#edf4e6] rounded-lg mx-auto object-cover' />
            <div className='w-full mx-auto'>
              <p
                title={capitalize(authorData.name)}
                className='font-poppins font-medium text-lg text-center md:text-left mt-2 overflow-hidden whitespace-nowrap text-ellipsis cursor-default'
              >
                {capitalize(authorData.name)}
              </p>
              <p className='font-arima font-medium text-sm text-center md:text-left'>{capitalize(authorData.nationality)}, Born on {formatDate(authorData.date)}</p>
              <div className='w-full md:items-center mt-4 leading-3 md:max-w-[90%]'>
                <p className='md:inline font-medium font-poppins text-center md:text-left text-sm'>Genres:</p>
                <div className='md:inline flex flex-wrap gap-x-2 md:ml-1 text-sm text-center md:text-left font-arima items-center justify-center md:justify-start w-[90%] mx-auto'>
                  {authorData.genres}
                </div>
              </div>
              <div className='flex justify-evenly items-center mt-4'>
                {authorData.link &&
                  <a
                    href={authorData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <NewspaperIcon title={`${authorData.name}'s Page`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
                {authorData.x &&
                  <a
                    href={authorData.x}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaXTwitter title={`${authorData.name}'s X`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
                {authorData.ig &&
                  <a
                    href={authorData.ig}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram title={`${authorData.name}'s Instagram`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
                {authorData.fb &&
                  <a
                    href={authorData.fb}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook title={`${authorData.name}'s Facebook`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
        <div className='w-full md:mt-2 mb-2'>
          <div className='mt-6 md:mt-0'>
            <p className='font-poppins font-semibold text-lg 2xl:text-center'>About {capitalize(authorData.name)}:</p>
            <p className='font-arima'>{authorData.bio}</p>
            <div className='mt-2'>
              <p className='inline font-medium font-poppinstext-left text-sm'>Awards:</p>
              <div className='inline ml-1 text-sm font-arima  w-[90%] mx-auto'>
                {authorData.awards}
              </div>
            </div>
          </div>

          {/* Author series */}
          {series.length > 0 && (
            <>
              <div className='flex justify-between items-center mt-8 md:mt-6'>
                <p className='font-poppins font-semibold text-lg 2xl:text-center'>
                  {capitalize(authorData.name)} Series:
                </p>
              </div>
              <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
                {series.map((item, index) => (
                  <div
                    key={item.id}
                    className='flex space-x-2 mt-4 pb-3 border-b-2 border-slate-300 cursor-default'
                    onClick={() => {
                      navigate(`/series/${item.id}/${encodeURIComponent(item.name)}`);
                      incrementSearchCount('serie', item.id);
                    }}
                  >
                    <img
                      src={item.image || blank_image} // Fallback image if Blob URL is null
                      alt='serie image'
                      className='h-[9rem] w-[6rem] rounded-lg object-cover'
                    />
                    <div className='min-h-full w-full flex flex-col justify-between'>
                      <div className='flex justify-between items-center'>
                        <p className='font-semibold m-0 leading-5 text-lg'>
                          {capitalize(item.name)}
                        </p>
                      </div>
                      <p className='font-arima text-sm'>by {capitalize(item.author_name)}</p>
                      <p className='font-arima text-gray-400 text-sm mt-1'>
                        #{index + 1}, {item.firstBook?.date ? `from ${formatDate(item.firstBook.date)}` : 'Coming soon'}
                      </p>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className='bg-primary block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto on-click-amzn'
                      >
                        Find on Amazon
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              {(seriesCount > seriesLimit || seriesLimit > 4) && (
                <span
                  onClick={() => handleSetLimit('series')}
                  className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
                >
                  {seriesLimit < booksCount ? 'Show more' : 'Show less'}
                </span>
              )}
            </>
          )}

          {/* Author Books */}
          <div className='flex justify-between items-center mt-8 md:mt-6'>
            <p className='font-poppins font-semibold text-lg 2xl:text-center'>
              {capitalize(authorData.name)} Books:
            </p>
          </div>
          <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
            {books.map((item, index) => (
              <div key={item.id} className='flex space-x-2 mt-4 pb-3 border-b-2 border-slate-300 cursor-default'>
                <img
                  src={item.image || blank_image} // Fallback image if Blob URL is null
                  alt='book image'
                  className='h-[9rem] w-[6rem] rounded-lg object-cover'
                />
                <div className='min-h-full w-full flex flex-col justify-between'>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold m-0 leading-5 text-lg'>
                      {capitalize(item.name)}
                    </p>
                  </div>
                  <p className='font-arima text-sm'>by {capitalize(item.author_name)}</p>
                  <p className='font-arima text-slate-400 text-sm mt-1'>
                    #{index + 1}, published {formatDate(item.date)}
                  </p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className='bg-primary block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto on-click-amzn'
                  >
                    Find on Amazon
                  </a>
                </div>
              </div>
            ))}
          </div>
          {(booksCount > booksLimit || booksLimit > 6) && (
            <span
              onClick={() => handleSetLimit('books')}
              className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
            >
              {booksLimit < booksCount ? 'Show more' : 'Show less'}
            </span>
          )}
        </div>
      </div>
      <Recommendations genres={authorData.genres} />
    </div>
  );
}

export default AuthorDetails;
