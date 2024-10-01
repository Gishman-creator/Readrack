import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../utils/axiosUtils';
import { capitalize, formatDate, spacesToHyphens } from '../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../utils/imageUtils';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Recommendations from '../recommendations/Recommendations';
import NotFoundPage from '../../../pages/NotFoundPage';
import blank_image from '../../../assets/brand_blank_image.png';
import DeatailsPageSkeleton from '../../../components/skeletons/DeatailsPageSkeleton';
import { useSocket } from '../../../context/SocketContext';
import RelatedCollections from '../related_collections/RelatedCollections';
import NetworkErrorPage from '../../../pages/NetworkErrorPage';
import { sortByPublishDateAsc, sortBySerieIndexAsc } from '../../../utils/sortingUtils';

function SerieDetails() {

  const activeTab = useSelector((state) => state.user.activeTab);
  const { serieId, serieName } = useParams();
  const [serieData, setSerieData] = useState({});
  const [books, setBooks] = useState([]);
  const [IsLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const [booksLimit, setBooksLimit] = useState();
  const [booksRange, setBooksRange] = useState();
  const [booksCount, SetBooksCount] = useState();
  const socket = useSocket();

  const [relatedCollections, setRelatedCollections] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const updatePageLimitAndInterval = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setBooksLimit(6);
        setBooksRange(6);
      } else {
        setBooksLimit(5);
        setBooksRange(5);
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
      setIsLoading(true);
      setRelatedCollections([]);
      try {
        const serieResponse = await axiosUtils(`/api/getSerieById/${serieId}`, 'GET');
        setSerieData(serieResponse.data);
        // console.log('The serie data are:', serieResponse.data);

        // If serieName is not in the URL, update it
        if (!serieName || serieName !== serieResponse.data.serieName) {
          navigate(`/series/${serieId}/${spacesToHyphens(serieResponse.data.serieName)}`, { replace: true });
        }

        // Fetch related collections and convert images to Blob URLs
        if (serieResponse.data.related_collections) {
          const collectionIds = serieResponse.data.related_collections.split(',');
          const fetchedRelatedCollections = await Promise.all(
            collectionIds.map(async (id) => {
              const res = await axiosUtils(`/api/getCollectionById/${id}`, 'GET');
              const collectionData = res.data;

              return collectionData;
            })
          );
          setRelatedCollections(fetchedRelatedCollections);
        }

        const booksResponse = await axiosUtils(`/api/getBooksBySerieId/${serieResponse.data.id}`, 'GET');
        // console.log('Books response:', booksResponse.data); // Debugging

        // Sort the books by publish date or custom date
        const sortedBooks = booksResponse.data.books.sort(sortBySerieIndexAsc);

        setBooks(sortedBooks);
        SetBooksCount(booksResponse.data.totalCount);
        // console.log('The total count is:', booksResponse.data.totalCount);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching series data:', error);
        if (error.message === "Network Error" || error.response.status === 500 || error.response.status === 501) {
          setNetworkError(true);
        } else if (error.response && error.response.status === 404) {
          setNotFound(true);
        }
        setIsLoading(false);
      }
    };

    fetchSeriesData();

    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }

    socket.on('seriesUpdated', (updatedSeries) => {
      setSerieData((prevSerieData) => {
        // Only update if the IDs match
        if (prevSerieData.id === updatedSeries.id) {
          // console.log("The ids are equal...............")
          return {
            ...prevSerieData,
            ...updatedSeries,
          };
        }

        return prevSerieData; // Return the previous state if IDs don't match
      });
    });

    // Event listener for booksUpdated
    socket.on('booksUpdated', (updatedBooks) => {
      // console.log('Books updated via socket:', updatedBooks);
      setBooks((prevData) => {
        const updatedData = prevData.map((book) =>
          book.id === updatedBooks.id ? updatedBooks : book
        );

        // Sort the updatedData by date in ascending order (oldest first)
        return updatedData.sort(sortBySerieIndexAsc);
      });
    });

    // Event listener for bookAdded
    socket.on('bookAdded', (bookData) => {
      if (bookData.serie_id === parseInt(serieId)) {
        setBooks((prevData) => {
          const updatedData = [...prevData, bookData];

          // Sort the updatedData by date in ascending order (oldest first)
          return updatedData.sort(sortBySerieIndexAsc);
        });
        SetBooksCount((prevCount) => prevCount + 1);
        if (booksLimit >= booksRange) setBooksLimit((prevCount) => prevCount + 1);
      }
    });

    socket.on('dataDeleted', ({ ids, type }) => {
      // console.log('Data deleted via socket:', { ids, type });
      if (type = 'books') {
        setBooks((prevData) => prevData.filter((item) => !ids.includes(item.id)));
        SetBooksCount((prevCount) => prevCount - ids.length);
      }
    });


    return () => {
      socket.off('seriesUpdated');
      socket.off('booksUpdated');
      socket.off('bookAdded');
      socket.off('dataDeleted');
    };

  }, [serieId, serieName, navigate, socket]);

  const handleSetLimit = () => {
    if (window.innerWidth >= 1024) {
      setBooksLimit(booksLimit === 6 ? booksCount : 6);
    } else {
      setBooksLimit(booksLimit === 5 ? booksCount : 5);
    }
    // console.log('Books limit set to:', booksLimit);
  }

  if (IsLoading) {
    return <DeatailsPageSkeleton activeTab={activeTab} admin={false} />;
  } else if (notFound) {
    return <NotFoundPage type='serie' />
  } else if (networkError) {
    return <NetworkErrorPage />
  }


  return (
    <div className=' px-[4%] sm:px-[12%]'>
      <div className='md:flex md:flex-row pt-2 md:space-x-6 xl:space-x-8 pb-10'>
        <div className='w-full pt-2 md:w-[22rem] md:h-full md:sticky md:top-20 lg:top-[4.5rem] overflow-hidden'>
          <div className=' max-w-[13rem] mx-auto'>
            <img src={serieData.imageURL || blank_image} alt="" className='h-[16rem] w-full bg-[rgba(3,149,60,0.08)] rounded-lg mx-auto object-cover' loading="lazy" />
            <div className='w-full mx-auto'>
              <p
                title={capitalize(serieData.serieName)}
                className='font-poppins font-medium text-lg text-center md:text-left mt-2 md:overflow-hidden md:whitespace-nowrap md:text-ellipsis cursor-default'
              >
                {capitalize(serieData.serieName)}
              </p>
              <p
                className='font-arima text-center md:text-left'
              >
                <span>by </span>
                {serieData.authors.map(author => (
                  <span
                    key={author.author_id}
                    className='hover:underline cursor-pointer'
                    onClick={() => navigate(`/authors/${author.author_id}/${spacesToHyphens(author.author_name)}`)}
                  >
                    {capitalize(author.nickname || author.author_name)}
                  </span>
                )).reduce((prev, curr) => [prev, ', ', curr])}
              </p>
              <div className='w-full md:items-center mt-4 leading-3 md:max-w-[90%]'>
                <p className='md:inline font-medium font-poppins text-center md:text-left text-sm'>Genres:</p>
                <div className='md:inline flex flex-wrap gap-x-2 md:ml-1 text-sm text-center md:text-left font-arima items-center justify-center md:justify-start w-[90%] mx-auto'>
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
          <div className='flex justify-between items-center mt-12 md:mt-0'>
            <p className='font-poppins font-semibold text-xl 2xl:text-center'>
              {capitalize(serieData.serieName)} Books:
            </p>
          </div>
          <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
            {books.slice(0, booksLimit).map((item, index) => (
              <div key={item.id} className='flex space-x-2 mt-4 pb-3 border-b-2 border-gray-100 cursor-default'>
                <img
                  src={item.imageURL || blank_image} // Fallback image if Blob URL is null
                  alt=''
                  className='bg-[rgba(3,149,60,0.08)] min-h-[9rem] w-[6rem] rounded-lg object-cover'
                  loading="lazy"
                />
                <div className='min-h-full w-full flex flex-col'>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold m-0 leading-5 text-lg'>
                      {capitalize(item.bookName)}
                    </p>
                  </div>
                  <p className='font-arima text-sm'>by {item.authors.map(author => capitalize(author.nickname || author.author_name)).join(', ')}</p>
                  <p className='font-arima text-slate-400 text-sm mt-1'>
                    #{item.serieIndex}, published {formatDate(item.publishDate) || item.customDate}
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
          {(booksCount > booksLimit || booksLimit > booksRange) && (
            <span
              onClick={() => handleSetLimit()}
              className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
            >
              {booksLimit < booksCount ? 'Show more' : 'Show less'}
            </span>
          )}
        </div>
      </div>
      {relatedCollections.length > 0 && <RelatedCollections data={relatedCollections} />}
      <Recommendations data={serieData} />
    </div>
  );
}

export default SerieDetails
