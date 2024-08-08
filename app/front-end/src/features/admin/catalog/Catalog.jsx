import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from '../slices/tabSlice';
import SearchBar from '../components/ui/SearchBar';
import FilterBtn from '../components/ui/FilterBtn';
import Table from '../components/ui/Table';
import Modal from '../components/Modal';
import AddSeriesForm from './forms/AddSeriesForm';
import AddAuthorsForm from './forms/AddAuthorsForm';
import AddBooksForm from './forms/AddBooksForm';

function Catalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.tabs.activeTab);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const hash = location.hash.replace('#add/', '');
    const tab = hash.charAt(0).toUpperCase() + hash.slice(1);

    if (hash) {
      dispatch(setActiveTab(tab));
      setIsModalOpen(true);
    }
  }, [location.hash, dispatch]);

  const handleTabClick = (tab) => {
    const formattedTab = tab.charAt(0).toUpperCase() + tab.slice(1);
    dispatch(setActiveTab(formattedTab));
  };

  const openModal = () => {
    setIsModalOpen(true);
    navigate(`#add/${activeTab.toLowerCase()}`); // Append the hash to the URL
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate(location.pathname, { replace: true }); // Remove hash from URL
  };

  const renderModalContent = () => {
    switch (activeTab) {
      case 'Series':
        return <AddSeriesForm onClose={closeModal} />;
      case 'Authors':
        return <AddAuthorsForm onClose={closeModal} />;
      case 'Books':
        return <AddBooksForm onClose={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div>
        <h1 className='text-xl font-semibold'>Catalog</h1>
        <p className='text-xs text-slate-500'>Manage your catalog</p>
      </div>
      <div className='flex justify-between items-center space-x-2 mt-6'>
        <div className='grid grid-cols-3 text-xs cursor-pointer'>
          <p
            className={`text-center px-4 py-1 ${activeTab === 'Series' ? 'border-b-2 border-green-800' : ''}`}
            onClick={() => handleTabClick('Series')}
          >
            Series
          </p>
          <p
            className={`text-center px-4 py-1 ${activeTab === 'Authors' ? 'border-b-2 border-green-800' : ''}`}
            onClick={() => handleTabClick('Authors')}
          >
            Authors
          </p>
          <p
            className={`text-center px-4 py-1 ${activeTab === 'Books' ? 'border-b-2 border-green-800' : ''}`}
            onClick={() => handleTabClick('Books')}
          >
            Books
          </p>
        </div>
        <div
          onClick={openModal}
          className='bg-[#37643B] flex items-center space-x-2 text-center text-white text-sm font-semibold font-poppins px-3 p-2 rounded cursor-pointer'
        >
          <PlusIcon className='w-3 h-3 inline' />
          <p className='text-xs'>Add</p>
        </div>
      </div>
      <div className='mt-4'>
        <Table />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default Catalog;
