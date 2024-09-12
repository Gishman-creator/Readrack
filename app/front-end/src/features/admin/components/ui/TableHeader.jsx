import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import SearchBar from './SearchBar';
import FilterBtn from './FilterBtn';
import { selectAllRows, toggleRowSelection, clearSelection } from '../../slices/catalogSlice';
import Pagination from './Pagination';
import axiosUtils from '../../../../utils/axiosUtils';
import toast from 'react-hot-toast';
import Modal from '../Modal'; // Import your Modal component
import { useSocket } from '../../../../context/SocketContext';

function TableHeader({ hasShadow, openEditAuthorModal, openEditBooksModal, openEditSeriesModal, openEditCollectionsModal }) {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { activeTab, selectedRowIds } = useSelector((state) => state.catalog);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility

  const handleEditClick = () => {
    if (selectedRowIds.length <= 1) {
      switch (activeTab) {
        case 'Authors':
          openEditAuthorModal();
          break;
        case 'Books':
          openEditBooksModal();
          break;
        case 'Series':
          openEditSeriesModal();
          break;
        case 'Collections':
          openEditCollectionsModal();
          break;
        default:
          break;
      }
    } else {
      dispatch(clearSelection());
      toast('Please select one row to update');
    }
  };

  const handleDeleteClick = () => {
    if (selectedRowIds.length > 0) {
      setIsModalOpen(true); // Open confirmation modal
    }
  };

  const confirmDelete = () => {
    const type = activeTab.toLowerCase(); // Dynamically determine the type
    // console.log(`Deleting from table: ${type}`);

    axiosUtils('/api/deleteData', 'DELETE', { ids: selectedRowIds, type })
      .then((response) => {
        dispatch(clearSelection()); // Clear selection after delete
        toast.success(response.data.message);
        setIsModalOpen(false); // Close modal after delete
      })
      .catch((error) => {
        console.error('Error deleting:', error);
      });
  };

  const cancelDelete = () => {
    setIsModalOpen(false); // Close modal without deleting
  };

  const toggleSearch = (isOpen) => {
    setIsSearchOpen(isOpen);
  };

  return (
    <div className={`bg-white sticky top-0 p-2 flex justify-between items-center ${hasShadow ? 'custom-drop-shadow' : ''}`}>
      <div className={`${isSearchOpen ? 'hidden' : 'flex'} sm:flex justify-between items-center w-fit`}>
        <p
          className={`text-sm my-2 pl-2 pr-4 border-slate-300 cursor-default ${selectedRowIds.length > 0 ? ' border-r-[1.5px]' : ''}`}
        >
          {activeTab}
        </p>
        {selectedRowIds.length > 0 && (
          <div className="flex space-x-2 pr-2">
            <PencilSquareIcon
              className="w-8 h-8 inline ml-2 cursor-pointer rounded-lg p-2 on-click"
              onClick={handleEditClick}
            />
            <TrashIcon
              className="w-8 h-8 inline cursor-pointer rounded-lg p-2 on-click"
              onClick={handleDeleteClick}
            />
          </div>
        )}
      </div>
      <div className={`${isSearchOpen ? 'w-full sm:w-fit max-h-fit' : 'w-fit'} flex justify-end items-center space-x-2`}>
        <SearchBar isSearchOpen={isSearchOpen} toggleSearch={toggleSearch} />
        <FilterBtn isSearchOpen={isSearchOpen} />
        <Pagination isSearchOpen={isSearchOpen} />
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={cancelDelete}>
        <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete?</h3>
        <div className="flex justify-end space-x-4">
          <button
            onClick={confirmDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Confirm
          </button>
          <button
            onClick={cancelDelete}
            className="bg-gray-300 text-black px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default TableHeader;
