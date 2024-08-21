import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../../utils/axiosUtils';
import { capitalize, formatDate } from '../../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/Modal';  // Assuming you have a reusable Modal component
import EditBooksForm from '../forms/edit forms/EditBooksForm'; // Import the EditBooksForm component
import { setAuthorName, setBookId, setSerieName, toggleRowSelection } from '../../slices/catalogSlice';
import AddAuthorsForm from '../forms/add forms/AddAuthorsForm';
import AddBooksForm from '../forms/add forms/AddBooksForm';

function SerieDetails() {
  const { serieId, name } = useParams();
  const [serieData, setSerieData] = useState({});
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);  // Manage modal visibility
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        const serieResponse = await axiosUtils(`/api/getSerieById/${serieId}`, 'GET');
        setSerieData(serieResponse.data);

        // Convert series image
        if (serieResponse.data.image) {
          serieResponse.data.image = bufferToBlobURL(serieResponse.data.image);
        }

        const serieName = serieResponse.data.name;

        const booksResponse = await axiosUtils(`/api/getBooksBySerie/${serieName}`, 'GET');
        console.log('Books response:', booksResponse.data[0]); // Debugging

        const booksWithBlobs = booksResponse.data[0].map((book) => {
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

  const handleEditClick = (bookId) => {
    dispatch(setBookId(bookId)); // Dispatch action to set the bookId in the store
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handelAddClick = (serie) => {
    dispatch(setSerieName(serie.name));
    dispatch(setAuthorName(serie.author_name));
    setModalType('add');
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);  // Hide the modal
  };

  if (loading) {
    return <p className='flex justify-center items-center'>Loading...</p>;
  }

  return (
    <div>
      <div className='md:flex md:flex-row pt-2 md:space-x-6 xl:space-x-8'>
        <div className='w-full pt-2 md:w-[22rem] md:h-full md:sticky md:top-20 lg:top-20 overflow-auto'>
          <div className=' max-w-[13rem] mx-auto'>
            <img src={serieData.image} alt="serie image" className='h-[16rem] w-full bg-[#edf4e6] rounded-sm mx-auto' />
            <div className='w-full mx-auto'>
              <p className='font-poppins font-medium text-xl text-center md:text-left mt-2'>{capitalize(serieData.name)}</p>
              <p className='font-arima text-center md:text-left'>by {capitalize(serieData.author_name)}</p>
              <div className='w-full md:items-center mt-4'>
                <p className='md:inline font-medium font-poppins text-center md:text-left text-sm'>Genres:</p>
                <div className='md:inline flex flex-wrap gap-x-2 md:ml-1 text-sm font-arima items-center justify-center md:justify-start w-[90%] mx-auto'>
                  {serieData.genres}
                </div>
              </div>
            </div>
          </div>
          <a
            href={serieData.link}
            target="_blank"
            rel="noopener noreferrer"
            className='bg-[#37643B] block w-[60%] md:w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mx-auto mt-6 on-click-amzn'>
            Series on Amazon
          </a>
        </div>
        <div className='w-full'>
          <div className='flex justify-between items-center mt-8 md:mt-0'>
            <p className='font-poppins font-semibold text-xl 2xl:text-center'>
              {capitalize(serieData.name)} Books:
            </p>
            <div
              className='bg-[#37643B] flex items-center space-x-2 text-center text-white text-sm font-semibold font-poppins px-3 p-2 rounded cursor-pointer on-click-amzn'
              onClick={() => handelAddClick(serieData)}
            >
              <PlusIcon className='w-3 h-3 inline' />
              <p className='text-xs'>Add</p>
            </div>
          </div>
          <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4 mt-2'>
            {books.map((item, index) => (
              <div key={item.id} className='flex space-x-2 mt-4 pb-3 border-b-2 border-slate-300 cursor-default'>
                <img
                  src={item.image || '/default-image.jpg'} // Fallback image if Blob URL is null
                  alt='book image'
                  className='h-[9rem] w-[6rem] rounded-sm'
                />
                <div className='min-h-full w-full flex flex-col justify-between'>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold m-0 leading-5 text-lg'>
                      {capitalize(item.name)}
                    </p>
                    <PencilSquareIcon
                      className="w-4 h-4 inline ml-2 cursor-pointer"
                      onClick={() => handleEditClick(item.id)}  // Handle click to open modal
                    />
                  </div>
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
                    Buy on Amazon
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalType == 'edit' ? (
          <EditBooksForm
            onClose={closeModal}  // Pass closeModal to close the modal after edit
          />
        ) : (
          <AddBooksForm
            onClose={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}

export default SerieDetails;
