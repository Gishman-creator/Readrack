import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, setAuthor, setSearchTerm, setSerie, setTableLimitEnd, setTableLimitStart } from '../slices/catalogSlice';
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
import AddCollectionsForm from './forms/add forms/AddCollectionsForm';
import EditCollectionsForm from './forms/edit forms/EditCollectionsForm';

function Catalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.catalog.activeTab);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Retrieve the active tab from the query string or default to "Series"
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab') || 'series'; // Default to 'series' if no tab is set
    const formattedTab = tab.charAt(0).toUpperCase() + tab.slice(1);
    // console.log('The tab is:', formattedTab);
    dispatch(setActiveTab(formattedTab));
    navigate(`/admin/catalog?tab=${formattedTab.toLowerCase()}`, { replace: true });
  }, [location.search, dispatch, activeTab]);

  const handleTabClick = (tab) => {
    // console.log(tab);
    dispatch(setActiveTab(''));
    dispatch(setTableLimitStart(0));
    dispatch(setTableLimitEnd(50));
    navigate(`/admin/catalog?tab=${tab.toLowerCase()}`, { replace: true });
    dispatch(setSearchTerm(''));
  };

  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    navigate(`/admin/catalog?tab=${activeTab.toLowerCase()}`, { replace: true });
  };

  const renderModalContent = () => {
    dispatch(setSerie(''));
    dispatch(setAuthor(''));
    switch (modalContent) {
      case 'Series':
        return <AddSeriesForm onClose={closeModal} />;
      case 'Collections':
        return <AddCollectionsForm onClose={closeModal} />;
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
      case 'EditCollections':
        return <EditCollectionsForm onClose={closeModal} />;
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
        <div className='grid grid-cols-4 text-sm cursor-pointer'>
          <p
            className={`text-center px-4 py-1 ${activeTab === 'Series' ? 'border-b-2 border-green-700' : ''}`}
            onClick={() => handleTabClick('series')}
          >
            Series
          </p>
          <p
            className={`text-center px-4 py-1 ${activeTab === 'Collections' ? 'border-b-2 border-green-700' : ''}`}
            onClick={() => handleTabClick('collections')}
          >
            Collections
          </p>
          <p
            className={`text-center px-4 py-1 ${activeTab === 'Authors' ? 'border-b-2 border-green-700' : ''}`}
            onClick={() => handleTabClick('authors')}
          >
            Authors
          </p>
          <p
            className={`text-center px-4 py-1 ${activeTab === 'Books' ? 'border-b-2 border-green-700' : ''}`}
            onClick={() => handleTabClick('books')}
          >
            Books
          </p>
        </div>
        <div
          onClick={() => openModal(activeTab)}
          className='bg-primary on-click-amzn flex items-center space-x-2 text-center text-white text-sm font-semibold font-poppins px-3 p-2 rounded cursor-pointer'
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
          openEditCollectionsModal={() => openModal('EditCollections')}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default Catalog;
