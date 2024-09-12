import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../../utils/axiosUtils';
import { capitalize, formatDate } from '../../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/Modal';  // Assuming you have a reusable Modal component
import EditBooksForm from '../forms/edit forms/EditBooksForm'; // Import the EditBooksForm component
import { setAuthorName, setBookId, setSerieName, toggleRowSelection } from '../../slices/catalogSlice';
import AddAuthorsForm from '../forms/add forms/AddAuthorsForm';
import AddBooksForm from '../forms/add forms/AddBooksForm';
import { useSocket } from '../../../../context/SocketContext';
import blank_image from '../../../../assets/brand_blank_image.png';

function SerieDetails() {
  const { serieId, serieName } = useParams();
  const [serieData, setSerieData] = useState({});
  const [books, setBooks] = useState([]);
  const [IsLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);  // Manage modal visibility
  const dispatch = useDispatch();

  const [booksLimit, setBooksLimit] = useState();
  const [booksCount, SetBooksCount] = useState();

  const navigate = useNavigate();
  const socket = useSocket();

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
        // console.log('Fetched serie data:', serieResponse.data);

        // If serieName is not in the URL, update it
        if (!serieName || serieName !== serieResponse.data.serieName) {
          navigate(`/admin/catalog/series/${serieId}/${encodeURIComponent(serieResponse.data.serieName)}`, { replace: true });
        }

        const booksResponse = await axiosUtils(`/api/getBooksBySerieId/${serieResponse.data.id}?limit=${booksLimit}`, 'GET');
        // console.log('Books response:', booksResponse.data); // Debugging

        setBooks(booksResponse.data.books);
        SetBooksCount(booksResponse.data.totalCount);
        // console.log('The total count is:', booksResponse.data.totalCount);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching series data:', error);
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
        return updatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      });
    });

    // Event listener for bookAdded
    socket.on('bookAdded', (bookData) => {
      if (bookData.serie_name === serieName) {
        setBooks((prevData) => {
          const updatedData = [...prevData, bookData];

          // Sort the updatedData by date in ascending order (oldest first)
          return updatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        });
      }
    });


    return () => {
      socket.off('seriesUpdated');
      socket.off('booksUpdated');
      socket.off('bookAdded');
    };

  }, [serieId, serieName, navigate, booksLimit, socket]);

  const handleSetLimit = () => {
    if (window.innerWidth >= 1024) {
      setBooksLimit(booksLimit === 6 ? booksCount : 6);
    } else {
      setBooksLimit(booksLimit === 5 ? booksCount : 5);
    }
    // console.log('Books limit set to:', booksLimit);
  }

  const handleEditClick = (book) => {
    dispatch(setBookId(book.id)); // Dispatch action to set the bookId in the store
    setModalType('editBook');
    setIsModalOpen(true);
  };

  const handelAddClick = (serie) => {
    dispatch(setSerieName(serie.serieName));
    dispatch(setAuthorName(serie.author_name));
    setModalType('addBook');
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);  // Hide the modal
  };

  if (IsLoading) {
    return <p className='flex justify-center items-center'>Loading...</p>;
  }

  return (
    <div className='md:flex md:flex-row pt-2 md:space-x-6 xl:space-x-8 pb-10'>
      <div className='w-full pt-2 md:w-[22rem] md:h-full md:sticky md:top-20 lg:top-[4.5rem] overflow-hidden'>
        <div className=' max-w-[13rem] mx-auto'>
          <img src={serieData.imageURL || blank_image} alt="serie image" className='h-[16rem] w-full bg-[rgba(3,149,60,0.08)] rounded-lg mx-auto object-cover' />
          <div className='w-full mx-auto'>
            <p
              title={capitalize(serieData.serieName)}
              className='font-poppins font-medium text-lg text-center md:text-left mt-2 md:overflow-hidden md:whitespace-nowrap md:text-ellipsis cursor-default'
            >
              {capitalize(serieData.serieName)}
            </p>
            <p
              className='font-arima text-center md:text-left hover:underline cursor-pointer'
              onClick={() => navigate(`/admin/catalog/authors/${serieData.author_id}/${encodeURIComponent(serieData.author_name)}`)}
            >
              by {capitalize(serieData.author_name)}
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
        <div className='flex justify-between items-center mt-8 md:mt-0'>
          <p className='font-poppins font-semibold text-xl 2xl:text-center'>
            {capitalize(serieData.serieName)} Books:
          </p>
          <div
            className='bg-green-700 flex items-center space-x-2 text-center text-white text-sm font-semibold font-poppins px-3 p-2 rounded cursor-pointer on-click-amzn'
            onClick={() => handelAddClick(serieData)}
          >
            <PlusIcon className='w-3 h-3 inline' />
            <p className='text-xs'>Add</p>
          </div>
        </div>
        <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
          {books.map((item, index) => (
            <div key={item.id} className='flex space-x-2 mt-4 pb-3 border-b-2 border-slate-100 cursor-default'>
              <img
                src={item.imageURL || blank_image}
                alt='book image'
                className='bg-[rgba(3,149,60,0.08)] h-[9rem] w-[6rem] rounded-lg object-cover'
              />
              <div className='min-h-full w-full flex flex-col justify-between'>
                <div className='flex justify-between items-center'>
                  <p className='font-semibold m-0 leading-5 text-lg'>
                    {capitalize(item.bookName)}
                  </p>
                  <PencilSquareIcon
                    className="w-4 h-4 inline ml-2 cursor-pointer"
                    onClick={() => handleEditClick(item)}  // Handle click to open modal
                  />
                </div>
                <p className='font-arima text-sm'>by {capitalize(item.author_name)}</p>
                <p className='font-arima text-slate-400 text-sm mt-1'>
                  #{index + 1}, published {formatDate(item.publishDate)}
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
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalType === 'editBook' && <EditBooksForm onClose={closeModal} />}
        {modalType === 'addBook' && <AddBooksForm onClose={closeModal} />}
      </Modal>
    </div>
  );
}

export default SerieDetails;
