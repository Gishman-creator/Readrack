import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from '../slices/catalogSlice';
import SearchBar from '../components/ui/SearchBar';
import FilterBtn from '../components/ui/FilterBtn';
import Table from '../components/ui/Table';
import Modal from '../components/Modal';
import AddSeriesForm from './forms/add forms/AddSeriesForm';
import AddAuthorsForm from './forms/add forms/AddAuthorsForm';
import AddBooksForm from './forms/add forms/AddBooksForm';
import EditAuthorForm from './forms/edit forms/EditAuthorsForm';
import EditBooksForm from './forms/edit forms/EditBooksForm';
import EditSeriesForm from './forms/edit forms/EditSeriesForm';
import { PlusIcon } from '@heroicons/react/24/outline';

function Catalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.catalog.activeTab);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Retrieve active tab from local storage on mount
  useEffect(() => {
    const storedTab = localStorage.getItem('catalogActiveTab');
    if (storedTab) {
      dispatch(setActiveTab(storedTab));
    }
  }, [dispatch]);

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
    // Save active tab to local storage
    localStorage.setItem('catalogActiveTab', formattedTab);
  };

  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
    navigate(`#add/${activeTab.toLowerCase()}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    navigate(location.pathname, { replace: true });
  };

  const renderModalContent = () => {
    switch (modalContent) {
      case 'Series':
        return <AddSeriesForm onClose={closeModal} />;
      case 'Authors':
        return <AddAuthorsForm onClose={closeModal} />;
      case 'Books':
        return <AddBooksForm onClose={closeModal} />;
      case 'EditAuthor':
        return <EditAuthorForm onClose={closeModal} />;
      case 'EditBooks':
        return <EditBooksForm onClose={closeModal} />;
      case 'EditSeries':
        return <EditSeriesForm onClose={closeModal} />;
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
        <div className='grid grid-cols-3 text-sm cursor-pointer'>
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
          onClick={() => openModal(activeTab)}
          className='bg-[#37643B] flex items-center space-x-2 text-center text-white text-sm font-semibold font-poppins px-3 p-2 rounded cursor-pointer'
        >
          <PlusIcon className='w-3 h-3 inline' />
          <p className='text-xs'>Add</p>
        </div>
      </div>
      <div className='mt-4'>
        <Table
          openEditAuthorModal={() => openModal('EditAuthor')}
          openEditBooksModal={() => openModal('EditBooks')}
          openEditSeriesModal={() => openModal('EditSeries')}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default Catalog;
