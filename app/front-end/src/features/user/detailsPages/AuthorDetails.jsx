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
import DeatailsPageSkeleton from '../components/skeletons/DeatailsPageSkeleton';
import { useSocket } from '../../../context/SocketContext';

function AuthorDetails() {

  const activeTab = useSelector((state) => state.user.activeTab);
  const { authorId, authorName } = useParams();
  const [authorData, setAuthorData] = useState({});
  const [series, setSeries] = useState([]);
  const [collections, setCollections] = useState([]);
  const [books, setBooks] = useState([]);
  const [IsLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [seriesLimit, setSeriesLimit] = useState();
  const [collectionsLimit, setCollectionsLimit] = useState();
  const [booksLimit, setBooksLimit] = useState();
  const [seriesCount, SetSeriesCount] = useState();
  const [collectionsCount, SetCollectionsCount] = useState();
  const [booksCount, SetBooksCount] = useState();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    
    const updatePageLimitAndInterval = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setSeriesLimit(4);
        setCollectionsLimit(4);
        setBooksLimit(6);
      } else {
        setSeriesLimit(3);
        setCollectionsLimit(3);
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
      setIsLoading(true);
      if (!seriesLimit || !booksLimit) return;
      try {
        const authorResponse = await axiosUtils(`/api/getAuthorById/${authorId}`, 'GET');
        // console.log(authorResponse.data);
        setAuthorData(authorResponse.data);

        // Convert books image
        if (authorResponse.data.image) {
          authorResponse.data.image = bufferToBlobURL(authorResponse.data.image);
        }

        // console.log('The author name is:', authorName);

        // If authorName is not in the URL, update it
        if (!authorName || authorName !== authorResponse.data.authorName) {
          navigate(`/authors/${authorId}/${encodeURIComponent(authorResponse.data.authorName)}`, { replace: true });
        }

        // Fetching series by the author
        const seriesResponse = await axiosUtils(`/api/getSeriesByAuthorId/${authorResponse.data.id}?limit=${seriesLimit}`, 'GET');
        // console.log('Series response:', seriesResponse.data); // Debugging

        const seriesWithBlobs = seriesResponse.data.series.map((serie) => {
          return {
            ...serie,
            image: bufferToBlobURL(serie.image) // Convert buffer to Blob URL
          };
        });
        setSeries(seriesWithBlobs);
        SetSeriesCount(seriesResponse.data.totalCount);

        // Fetching collections by the author
        const collectionsResponse = await axiosUtils(`/api/getCollectionsByAuthorId/${authorResponse.data.id}?limit=${collectionsLimit}`, 'GET');
        // console.log('Collections response:', collectionsResponse.data); // Debugging

        const collectionsWithBlobs = collectionsResponse.data.collections.map((collection) => {
          return {
            ...collection,
            image: bufferToBlobURL(collection.image) // Convert buffer to Blob URL
          };
        });
        setCollections(collectionsWithBlobs);
        SetCollectionsCount(collectionsResponse.data.totalCount);

        // Fetching books by the author
        const booksResponse = await axiosUtils(`/api/getBooksByAuthorId/${authorResponse.data.id}?limit=${booksLimit}`, 'GET');
        // console.log('Books response:', booksResponse.data); // Debugging

        const booksWithBlobs = booksResponse.data.books.map((book) => {
          return {
            ...book,
            image: bufferToBlobURL(book.image) // Convert buffer to Blob URL
          };
        });
        setBooks(booksWithBlobs);
        SetBooksCount(booksResponse.data.totalCount);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching books data:', error);
        if (error.response && error.response.status === 404) {
          setNotFound(true);
        }
        setIsLoading(false);
      }
    };

    fetchBooksData();

    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }

    socket.on('authorsUpdated', (updatedAuthors) => {
      setAuthorData((prevAuthorData) => {
        // Only update if the IDs match
        if (prevAuthorData.id === updatedAuthors.id) {
          // console.log("The ids are equal...............")
          return {
            ...prevAuthorData,
            ...updatedAuthors,
            image: bufferToBlobURL(updatedAuthors.image), // Convert updated series image to Blob URL
          };
        }

        return prevAuthorData; // Return the previous state if IDs don't match
      });
    });

    // Listen for series updates via socket
    socket.on('seriesUpdated', (updatedSeries) => {
      // console.log("Series updated via socket:", updatedSeries);
      setSeries((prevData) => {
        const updatedData = prevData.map((series) =>
          series.id === updatedSeries.id
            ? {
              ...updatedSeries,
              image: bufferToBlobURL(updatedSeries.image), // Convert buffer to Blob URL
            }
            : series
        );

        // Sort the updatedData by date in ascending order (oldest first)
        return updatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      });
    });

    // Listen for collections updates via socket
    socket.on('collectionsUpdated', (updatedCollections) => {
      // console.log("Collections updated via socket:", updatedCollections);
      setCollections((prevData) => {
        const updatedData = prevData.map((collections) =>
          collections.id === updatedCollections.id
            ? {
              ...updatedCollections,
              image: bufferToBlobURL(updatedCollections.image), // Convert buffer to Blob URL
            }
            : collections
        );

        // Sort the updatedData by date in ascending order (oldest first)
        return updatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      });
    });

    // Event listener for booksUpdated
    socket.on('booksUpdated', (updatedBooks) => {
      // console.log('Books updated via socket:', updatedBooks);
      setBooks((prevData) => {
        const updatedData = prevData.map((book) =>
          book.id === updatedBooks.id
            ? {
              ...updatedBooks,
              image: bufferToBlobURL(updatedBooks.image), // Convert buffer to Blob URL
            }
            : book
        );

        // Sort the updatedData by date in ascending order (oldest first)
        return updatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      });
    });

    // New event listener for serieAdded
    socket.on('serieAdded', (serieData) => {
      // console.log('New serie added via socket:', serieData);
      if (serieData.author_name === authorName) {
        serieData.image = bufferToBlobURL(serieData.image); // Convert buffer to Blob URL
        setSeries((prevData) => {
          const updatedData = [...prevData, serieData];

          // Sort the updatedData by date in ascending order (oldest first)
          return updatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        });
      }
    });

    // New event listener for collectionAdded
    socket.on('collectionAdded', (collectionData) => {
      // console.log('New collection added via socket:', collectionData);
      if (collectionData.author_name === authorName) {
        collectionData.image = bufferToBlobURL(collectionData.image); // Convert buffer to Blob URL
        setCollections((prevData) => {
          const updatedData = [...prevData, collectionData];

          // Sort the updatedData by date in ascending order (oldest first)
          return updatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        });
      }
    });

    // Event listener for bookAdded
    socket.on('bookAdded', (bookData) => {
      // console.log('Books added via socket:', bookData);
      if (bookData.author_name === authorName) {
        bookData.image = bufferToBlobURL(bookData.image); // Convert buffer to Blob URL
        setBooks((prevData) => {
          const updatedData = [...prevData, bookData];

          // Sort the updatedData by date in ascending order (oldest first)
          return updatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        });
      }
    });

    socket.on('dataDeleted', ({ ids, type }) => {
      // console.log('Data deleted via socket:', { ids, type });
      if (type = 'series') {
        setSeries((prevData) => prevData.filter((item) => !ids.includes(item.id)));
      } else {
        setBooks((prevData) => prevData.filter((item) => !ids.includes(item.id)));
      }
    });


    return () => {
      socket.off('authorsUpdated');
      socket.off('seriesUpdated');
      socket.off('collectionsUpdated');
      socket.off('booksUpdated');
      socket.off('serieAdded');
      socket.off('collectionAdded');
      socket.off('bookAdded');
      socket.off('dataDeleted');
    };

  }, [authorId, authorName, navigate, seriesLimit, collectionsLimit, booksLimit, socket]);

  const handleSetLimit = (type) => {
    if (type == 'series') {
      if (window.innerWidth >= 1024) {
        setSeriesLimit(seriesLimit === 4 ? seriesCount : 4);
      } else {
        setSeriesLimit(seriesLimit === 3 ? seriesCount : 3);
      }
      // console.log('Series limit set to:', seriesLimit);
    } else if (type == 'collections') {
      if (window.innerWidth >= 1024) {
        setCollectionsLimit(collectionsLimit === 4 ? collectionsCount : 4);
      } else {
        setCollectionsLimit(collectionsLimit === 3 ? collectionsCount : 3);
      }
      // console.log('Series limit set to:', seriesLimit);
    } else {
      if (window.innerWidth >= 1024) {
        setBooksLimit(booksLimit === 6 ? booksCount : 6);
      } else {
        setBooksLimit(booksLimit === 5 ? booksCount : 5);
      }
      // console.log('Books limit set to:', booksLimit);
    }
  }

  if (IsLoading) {
    return <DeatailsPageSkeleton activeTab={activeTab} />;
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
                title={capitalize(authorData.authorName)}
                className='font-poppins font-medium text-lg text-center md:text-left mt-2 overflow-hidden whitespace-nowrap text-ellipsis cursor-default'
              >
                {authorData.nickname ? capitalize(authorData.nickname) : capitalize(authorData.authorName)}
              </p>
              <p className='font-arima font-medium text-sm text-center md:text-left'>{capitalize(authorData.nationality)}, Born on {formatDate(authorData.dob)}</p>
              <div className='w-full md:items-center mt-4 leading-3 md:max-w-[90%]'>
                <p className='md:inline font-poppins font-medium text-center md:text-left text-sm'>Genres:</p>
                <div className='md:inline flex flex-wrap gap-x-2 md:ml-1 text-sm text-center md:text-left font-arima items-center justify-center md:justify-start w-[90%] mx-auto'>
                  {authorData.genres}
                </div>
              </div>
              <div className='flex justify-evenly items-center mt-4'>
                {authorData.website &&
                  <a
                    href={authorData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <NewspaperIcon title={`${authorData.nickname ? capitalize(authorData.nickname) : capitalize(authorData.authorName)}'s Website`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
                {authorData.x &&
                  <a
                    href={authorData.x}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaXTwitter title={`${authorData.nickname ? capitalize(authorData.nickname) : capitalize(authorData.authorName)}'s X`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
                {authorData.instagram &&
                  <a
                    href={authorData.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram title={`${authorData.nickname ? capitalize(authorData.nickname) : capitalize(authorData.authorName)}'s Instagram`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
                {authorData.facebook &&
                  <a
                    href={authorData.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook title={`${authorData.nickname ? capitalize(authorData.nickname) : capitalize(authorData.authorName)}'s Facebook`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
        <div className='w-full md:mt-2 mb-2'>
          <div className='mt-6 md:mt-0'>
            <p className='font-poppins font-semibold text-lg 2xl:text-center mb-2'>About {authorData.nickname ? capitalize(authorData.nickname) : capitalize(authorData.authorName)}:</p>
            <p className='font-arima'>{authorData.biography}</p>
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
                  {authorData.nickname ? capitalize(authorData.nickname) : capitalize(authorData.authorName)} Series:
                </p>
              </div>
              <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
                {series.map((item, index) => (
                  <div
                    key={item.id}
                    className='flex space-x-2 mt-4 pb-3 border-b-2 border-gray-300 cursor-pointer'
                    onClick={() => {
                      navigate(`/series/${item.id}/${encodeURIComponent(item.serieName)}`);
                    }}
                  >
                    <img
                      src={item.image || blank_image} // Fallback image if Blob URL is null
                      alt='book image'
                      className='min-h-[9rem] w-[6rem] rounded-lg object-cover'
                    />
                    <div className='min-h-full w-full flex flex-col justify-between'>
                      <div
                        className='flex justify-between items-center'
                      // onClick={(e) => e.stopPropagation()}
                      >
                        <p className='font-semibold m-0 leading-5 text-lg'>
                          {capitalize(item.serieName)}
                        </p>
                      </div>
                      <p className='font-arima text-sm'>by {capitalize(item.nickname ? item.nickname : item.author_name)}</p>
                      <p className='font-arima text-gray-400 text-sm mt-1'>
                        #{index + 1}, {item.first_book_year && item.last_book_year ? `from ${item.first_book_year} to ${item.last_book_year}` : 'Coming soon'}
                      </p>
                      {item.link &&
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className='bg-primary block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto on-click-amzn'
                        >
                          Find on Amazon
                        </a>
                      }
                    </div>
                  </div>
                ))}
              </div>
              {(seriesCount > seriesLimit || seriesLimit > 4) && (
                <span
                  onClick={() => handleSetLimit('series')}
                  className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
                >
                  {seriesLimit < seriesCount ? 'Show more' : 'Show less'}
                </span>
              )}
            </>
          )}

          {/* Author series */}
          {collections.length > 0 && (
            <>
              <div className='flex justify-between items-center mt-8 md:mt-6'>
                <p className='font-poppins font-semibold text-lg 2xl:text-center'>
                  Other {authorData.nickname ? capitalize(authorData.nickname) : capitalize(authorData.authorName)} book Collections:
                </p>
              </div>
              <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
                {collections.map((item, index) => (
                  <div
                    key={item.id}
                    className='flex space-x-2 mt-4 pb-3 border-b-2 border-gray-300 cursor-pointer'
                    onClick={() => {
                      navigate(`/collections/${item.id}/${encodeURIComponent(item.collectionName)}`);
                    }}
                  >
                    <img
                      src={item.image || blank_image} // Fallback image if Blob URL is null
                      alt='book image'
                      className='min-h-[9rem] w-[6rem] rounded-lg object-cover'
                    />
                    <div className='min-h-full w-full flex flex-col justify-between'>
                      <div
                        className='flex justify-between items-center'
                      // onClick={(e) => e.stopPropagation()}
                      >
                        <p className='font-semibold m-0 leading-5 text-lg'>
                          {capitalize(item.collectionName)}
                        </p>
                      </div>
                      <p className='font-arima text-sm'>by {capitalize(item.nickname ? item.nickname : item.author_name)}</p>
                      <p className='font-arima text-gray-400 text-sm mt-1'>
                        #{index + 1}, {item.first_book_year && item.last_book_year ? `from ${item.first_book_year} to ${item.last_book_year}` : 'Coming soon'}
                      </p>
                      {item.link &&
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className='bg-primary block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto on-click-amzn'
                        >
                          Find on Amazon
                        </a>
                      }
                    </div>
                  </div>
                ))}
              </div>
              {(collectionsCount > collectionsLimit || collectionsLimit > 4) && (
                <span
                  onClick={() => handleSetLimit('collections')}
                  className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
                >
                  {collectionsLimit < collectionsCount ? 'Show more' : 'Show less'}
                </span>
              )}
            </>
          )}

          {/* Author Books */}
          <div className='flex justify-between items-center mt-8 md:mt-6'>
            <p className='font-poppins font-semibold text-lg 2xl:text-center'>
              {authorData.nickname ? capitalize(authorData.nickname) : capitalize(authorData.authorName)} Books:
            </p>
          </div>
          <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
            {books.map((item, index) => (
              <div key={item.id} className='flex space-x-2 mt-4 pb-3 border-b-2 border-gray-300 cursor-default'>
                <img
                  src={item.image || blank_image} // Fallback image if Blob URL is null
                  alt='book image'
                  className='min-h-[9rem] w-[6rem] rounded-lg object-cover'
                />
                <div className='min-h-full w-full flex flex-col justify-between'>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold m-0 leading-5 text-lg'>
                      {capitalize(item.bookName)}
                    </p>
                  </div>
                  <p className='font-arima text-sm'>by {capitalize(item.nickname ? item.nickname : item.author_name)}</p>
                  <p className='font-arima text-slate-400 text-sm mt-1'>
                    #{index + 1}, published {formatDate(item.publishDate)}
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
      <Recommendations data={authorData} />
    </div>
  );
}

export default AuthorDetails;
