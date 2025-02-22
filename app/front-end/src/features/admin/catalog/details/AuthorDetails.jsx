import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../../utils/axiosUtils';
import { calculateAgeAtDeath, capitalize, capitalizeGenres, spacesToHyphens } from '../../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { NewspaperIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Modal from '../../components/Modal';  // Assuming you have a reusable Modal component
import EditBooksForm from '../forms/edit forms/EditBooksForm'; // Import the EditBooksForm component
import { setAuthor, setBookId, setSerieId, setSerie, toggleRowSelection } from '../../slices/catalogSlice';
import AddAuthorsForm from '../forms/add forms/AddAuthorsForm';
import AddBooksForm from '../forms/add forms/AddBooksForm';
import AddSeriesForm from '../forms/add forms/AddSeriesForm';
import EditSeriesForm from '../forms/edit forms/EditSeriesForm';
import { useSocket } from '../../../../context/SocketContext';
import blank_image from '../../../../assets/brand_blank_image.png';
import DeatailsPageSkeleton from '../../../../components/skeletons/DeatailsPageSkeleton';
import NotFoundPage from '../../../../pages/NotFoundPage';
import NetworkErrorPage from '../../../../pages/NetworkErrorPage';
import { sortByFirstBookYearAsc, sortByPublishDateDesc } from '../../../../utils/sortingUtils';

function AuthorDetails() {

  const { authorId, author_name } = useParams();
  const [authorData, setAuthorData] = useState({});
  const [series, setSeries] = useState([]);
  const [books, setBooks] = useState([]);
  const [IsLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [modalType, setModalType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);  // Manage modal visibility

  const [seriesLimit, setSeriesLimit] = useState();
  const [groupRange, setGroupRange] = useState();
  const [booksLimit, setBooksLimit] = useState();
  const [booksRange, setBooksRange] = useState();
  const [seriesCount, setSeriesCount] = useState();
  const [booksCount, setBooksCount] = useState();
  const activeTab = useSelector((state) => state.catalog.activeTab);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    const updatePageLimitAndInterval = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setSeriesLimit(4);
        setGroupRange(4);
        setBooksLimit(6);
        setBooksRange(6);
      } else {
        setSeriesLimit(3);
        setGroupRange(3);
        setBooksLimit(5);
        setBooksRange(5);
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
      try {
        const authorResponse = await axiosUtils(`/api/getAuthorById/${authorId}`, 'GET');

        // Adding the age property to the author data
        const authorDataWithAge = {
          ...authorResponse.data,
          age: calculateAgeAtDeath(authorResponse.data.dob, authorResponse.data.dod),
        };
        // console.log('Author age at death:', authorDataWithAge.age);

        setAuthorData(authorDataWithAge);

        // console.log('The author name is:', author_name);

        // If author_name is not in the URL, update it
        if (!author_name || author_name !== authorResponse.data.author_name) {
          navigate(`/admin/catalog/authors/${authorId}/${spacesToHyphens(authorResponse.data.author_name)}`, { replace: true });
        }

        // Update the tab title with the series name
        document.title = `Admin - ${capitalize(authorResponse.data.author_name)}`;

        // Fetching series by the author
        const seriesResponse = await axiosUtils(`/api/getSeriesByAuthorId/${authorResponse.data.id}`, 'GET');
        // console.log('Series response:', seriesResponse.data); // Debugging

        const sortedSeries = seriesResponse.data.series.sort(sortByFirstBookYearAsc);

        setSeries(sortedSeries);
        setSeriesCount(seriesResponse.data.series.length);

        // Fetching books by the author
        const booksResponse = await axiosUtils(`/api/getBooksByAuthorId/${authorResponse.data.id}`, 'GET');
        // console.log('Books response:', booksResponse.data); // Debugging

        // Sort the books by publish date or custom date
        const sortedBooks = booksResponse.data.books.sort(sortByPublishDateDesc);

        setBooks(sortedBooks);
        setBooksCount(booksResponse.data.books.length);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching books data:', error);
        if (error.message === "Network Error" || error.response.status === 500 || error.response.status === 501) {
          setNetworkError(true);
        } else if (error.response && error.response.status === 404) {
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
          series.id === updatedSeries.id ? updatedSeries : series
        );

        // Sort the updatedData by date in ascending order (oldest first)
        return updatedData.sort(sortByFirstBookYearAsc);
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
        return updatedData.sort(sortByPublishDateDesc);
      });
    });

    // New event listener for serieAdded
    socket.on('serieAdded', (serieData) => {
      // console.log('Series updated via socket:', serieData);
      // Split the author_id string into an array of individual author IDs
      const authorIds = serieData.author_id.split(',').map(id => id.trim());

      // Check if the current authorId is one of the authorIds
      if (authorIds.includes(authorId)) {
        setSeries((prevData) => {
          const updatedData = [...prevData, serieData];

          // Sort the updatedData by date in ascending order (oldest first)
          return updatedData.sort(sortByFirstBookYearAsc);
        });
        // console.log('Serie count is:', seriesCount);
        setSeriesCount(seriesCount + 1);
        // console.log('Serie count set to:', seriesCount);
        if (seriesLimit >= seriesCount) { setSeriesLimit(seriesLimit + 1) };
      }
    });

    // Event listener for bookAdded
    socket.on('bookAdded', (bookData) => {
      // Split the author_id string into an array of individual author IDs
      const authorIds = bookData.author_id.split(',').map(id => id.trim());

      // Check if the current authorId is one of the authorIds
      if (authorIds.includes(authorId)) {
        setBooks((prevData) => {
          const updatedData = [...prevData, bookData];

          // Sort the updatedData by date in ascending order (oldest first)
          return updatedData.sort(sortByPublishDateDesc);
        });
        setBooksCount(booksCount + 1);
        if (booksLimit >= booksCount) { setBooksLimit(booksLimit + 1) };
      }
    });

    socket.on('dataDeleted', ({ ids, type }) => {
      // console.log('Data deleted via socket:', { ids, type });
      if (type = 'series') {
        setSeries((prevData) => prevData.filter((item) => !ids.includes(item.id)));
        setSeriesCount((prevCount) => prevCount - ids.length);
      } else if (type = 'books') {
        setBooks((prevData) => prevData.filter((item) => !ids.includes(item.id)));
        setBooksCount((prevCount) => prevCount - ids.length);
      }
    });


    return () => {
      socket.off('authorsUpdated');
      socket.off('seriesUpdated');
      socket.off('booksUpdated');
      socket.off('serieAdded');
      socket.off('bookAdded');
      socket.off('dataDeleted');
    };

  }, [authorId, author_name, navigate, socket]);

  const handleSetLimit = (type) => {
    if (type == 'series') {
      if (window.innerWidth >= 1024) {
        setSeriesLimit(seriesLimit === 4 ? seriesCount : 4);
      } else {
        setSeriesLimit(seriesLimit === 3 ? seriesCount : 3);
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

  const handleEditClick = (type, item) => {
    if (type === 'book') {
      dispatch(setBookId(item.id));
      setModalType('editBook');
    } else if (type === 'serie') {
      dispatch(setSerieId(item.id));
      setModalType('editSeries');
    }
    setIsModalOpen(true);
  };

  const handleAddClick = (type, item) => {
    if (type === 'book') {
      dispatch(setAuthor(item));
      setModalType('addBook');
    } else if (type === 'serie') {
      dispatch(setAuthor(item));
      setModalType('addSeries');
    }
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);  // Hide the modal
  };

  if (IsLoading) {
    return <DeatailsPageSkeleton activeTab='Authors' admin={true} />;
  } else if (notFound) {
    return <NotFoundPage type='author' />
  } else if (networkError) {
    return <NetworkErrorPage />
  }


  return (
    <div className='md:flex md:flex-row md:space-x-6 xl:space-x-8'>
      <div className='w-full pt-2 md:w-[22rem] md:h-full md:sticky md:top-20 lg:top-[4.5rem] overflow-auto'>
        <div className=' max-w-[13rem] mx-auto'>
          <img src={authorData.imageURL || blank_image} alt="author image" loading="lazy" className='h-[16rem] w-full bg-[rgba(3,149,60,0.08)] rounded-lg mx-auto object-cover' />
          <div className='w-full mx-auto'>
            <p
              title={capitalize(authorData.author_name)}
              className='font-poppins font-medium text-lg text-center md:text-left mt-2 mb-2 md:overflow-hidden md:whitespace-nowrap md:text-ellipsis cursor-default'
            >
              {capitalize(authorData.author_name)}
            </p>
            <div className='font-arima font-medium text-sm text-center md:text-left'>
              <span>{capitalize(authorData.nationality)}</span>
              <span className={`${authorData.dob || authorData.customDob ? 'inline' : 'hidden'}`}>,</span>
              <span className={`${authorData.dob || authorData.customDob ? 'block' : 'hidden'}`}>Born on {authorData.dob}</span>
            </div>
            {authorData.dod && (
              <>
                <p className='font-arima font-medium text-sm text-center md:text-left mt-2'>Died on {authorData.dod},</p>
                <p className='font-arima font-medium text-sm text-center md:text-left'> at {authorData.age} years old.</p>
              </>
            )}
            <div className='w-full md:items-center mt-4 leading-3 md:max-w-[90%]'>
              <p className='md:inline font-medium font-poppins text-center md:text-left text-sm'>Genres:</p>
              <div className='md:inline flex flex-wrap gap-x-2 md:ml-1 text-sm text-center md:text-left font-arima items-center justify-center md:justify-start w-[90%] mx-auto'>
                {capitalizeGenres(authorData.genre)}
              </div>
            </div>
            <div className='flex justify-evenly items-center mt-4'>
              {authorData.website &&
                <a
                  href={authorData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <NewspaperIcon title={`${authorData.author_name}'s Page`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                </a>
              }
              {authorData.x &&
                <a
                  href={authorData.x}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaXTwitter title={`${authorData.author_name}'s X`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                </a>
              }
              {authorData.instagram &&
                <a
                  href={authorData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram title={`${authorData.author_name}'s Instagram`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                </a>
              }
              {authorData.facebook &&
                <a
                  href={authorData.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook title={`${authorData.author_name}'s Facebook`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                </a>
              }
            </div>
          </div>
        </div>
      </div>
      <div className='w-full md:mt-2 mb-2'>
        <div className='mt-6 md:mt-0'>
          <p className='font-poppins font-semibold text-lg 2xl:text-center'>About {capitalize(authorData.author_name)}:</p>
          <p className='font-arima'>{authorData.biography}</p>
          <div className={`${authorData.awards ? 'block' : 'hidden'} mt-2`}>
            <p className='inline font-medium font-poppinstext-left text-sm'>Awards:</p>
            <div className='inline ml-1 text-sm font-arima  w-[90%] mx-auto'>
              {authorData.awards}
            </div>
          </div>
        </div>

        {/* Author series */}
        {series.length > 0 && (
          <>
            <div className='sticky top-[4rem] bg-[#f9f9f9] flex justify-between items-center py-2 md:pt-4 mt-6 md:mt-4'>
              <p className='font-poppins font-semibold text-lg 2xl:text-center'>
                {capitalize(authorData.author_name)} Series:
              </p>
              <div
                className='bg-green-700 flex items-center space-x-2 text-center text-white text-sm font-semibold font-poppins px-3 p-2 rounded cursor-pointer on-click-amzn'
                onClick={() => handleAddClick('serie', authorData)}
              >
                <PlusIcon className='w-3 h-3 inline' />
                <p className='text-xs'>Add</p>
              </div>
            </div>
            <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
              {series.slice(0, seriesLimit).map((item, index) => (
                <div
                  key={item.id}
                  className='flex space-x-2 mt-4 pb-3 border-b-2 border-slate-300 cursor-default'
                  onClick={() => navigate(`/admin/catalog/series/${item.id}/${spacesToHyphens(item.serie_name)}`)}
                >
                  <img
                    src={item.imageURL || blank_image} // Fallback image if Blob URL is null
                    alt='book image'
                    className='bg-[rgba(3,149,60,0.08)] h-[9rem] w-[6rem] rounded-lg object-cover'
                    loading="lazy"
                  />
                  <div className='min-h-full w-full flex flex-col'>
                    <div
                      className='flex justify-between items-center'
                    // onClick={(e) => e.stopPropagation()}
                    >
                      <p className='m-0 leading-5 text-lg'>
                        {capitalize(item.serie_name)}
                      </p>
                      <PencilSquareIcon
                        className="w-4 h-4 inline ml-2 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); handleEditClick('serie', item) }}  // Handle click to open modal
                      />
                    </div>
                    <p className='font-arima text-sm mt-2'>by {item.authors.map(author => capitalize(author.author_name)).join(', ')}</p>
                    <p className='font-arima text-gray-400 text-sm'>
                      {item.first_book_year && item.last_book_year ? `from ${item.first_book_year} to ${item.last_book_year}` : 'Coming soon'}
                    </p>
                    {item.amazon_link &&
                      <a
                        href={item.amazon_link}
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
            {(seriesCount > seriesLimit || seriesLimit > groupRange) && (
              <span
                onClick={() => handleSetLimit('series')}
                className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
              >
                {seriesLimit < seriesCount ? 'Show more' : 'Show less'}
              </span>
            )}
          </>
        )}

        {/* Author Books */}
        <div className='sticky top-[4rem] bg-[#f9f9f9] flex justify-between items-center py-2 md:pt-4 mt-6 md:mt-4'>
          <p className='font-poppins font-semibold text-lg 2xl:text-center'>
            Other {capitalize(authorData.author_name)} Books:
          </p>
          <div
            className='bg-green-700 flex items-center space-x-2 text-center text-white text-sm font-semibold font-poppins px-3 p-2 rounded cursor-pointer on-click-amzn'
            onClick={() => handleAddClick('book', authorData)}
          >
            <PlusIcon className='w-3 h-3 inline' />
            <p className='text-xs'>Add</p>
          </div>
        </div>
        <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
          {books.slice(0, booksLimit).map((item, index) => (
            <div key={item.id} className='flex space-x-2 mt-4 pb-3 border-b-2 border-slate-300 cursor-default'>
              <img
                src={item.imageURL || blank_image} // Fallback image if Blob URL is null
                alt='book image'
                className='bg-[rgba(3,149,60,0.08)] h-[9rem] w-[6rem] rounded-lg object-cover'
                loading="lazy"
              />
              <div className='min-h-full w-full flex flex-col justify-between'>
                <div className='flex justify-between items-center'>
                  <p className='m-0 leading-5 text-lg'>
                    {capitalize(item.book_name)}
                  </p>
                  <PencilSquareIcon
                    className="w-4 h-4 inline ml-2 cursor-pointer"
                    onClick={() => handleEditClick('book', item)}  // Handle click to open modal
                  />
                </div>
                <p className='font-arima text-sm mt-2'>
                  by {item.authors.map((author, index) => (
                    <span
                      key={index}
                      title={author.pen_name && author.pen_name.includes(item.pen_name) ? `${author.author_name}'s Pseudonym` : author.author_name}
                    >
                      {/* Check if pen_name matches the book's pen_name, otherwise display author_name */}
                      {author.pen_name && author.pen_name.includes(item.pen_name) ? capitalize(item.pen_name) : capitalize(author.author_name)}
                      {index < item.authors.length - 1 && ', '}
                    </span>
                  ))}
                </p>
                <p className='font-arima text-slate-400 text-sm'>
                  published {item.publish_date || item.publish_year}
                </p>
                <a
                  href={
                    item.amazon_link ||
                    `https://www.amazon.com/s?k=${encodeURIComponent(`${item.book_name} by ${item.authors.map(author => author.author_name).join(', ')}`)}`
                  }
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
        {(booksCount > booksLimit || booksLimit > booksRange) && (
          <span
            onClick={() => handleSetLimit('books')}
            className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
          >
            {booksLimit < booksCount ? 'Show more' : 'Show less'}
          </span>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalType === 'editBook' && <EditBooksForm onClose={closeModal} />}
        {modalType === 'addBook' && <AddBooksForm onClose={closeModal} />}
        {modalType === 'editSeries' && <EditSeriesForm onClose={closeModal} />}
        {modalType === 'addSeries' && <AddSeriesForm onClose={closeModal} />}
      </Modal>
    </div>
  );
}

export default AuthorDetails;
