// TableHeader.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import SearchBar from './SearchBar';
import FilterBtn from './FilterBtn';
import { selectAllRows, toggleRowSelection, clearSelection } from '../../slices/catalogSlice';

function TableHeader({ hasShadow, openEditAuthorModal, openEditBooksModal, openEditSeriesModal }) {
  const dispatch = useDispatch();
  const { activeTab, selectedRowIds } = useSelector((state) => state.catalog);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
          default:
            break;
        }
      }
  };

  const handleDeleteClick = () => {
    if (selectedRowIds.length > 0) {
      // Handle delete logic here
      console.log('Deleting rows:', selectedRowIds);
      dispatch(clearSelection()); // Optionally clear selection after delete
    }
  };

  const toggleSearch = (isOpen) => {
    setIsSearchOpen(isOpen);
  };

  return (
    <div className={`bg-white sticky top-0 p-2 flex justify-between items-center ${hasShadow ? 'custom-drop-shadow' : ''}`}>
      <div className={`${isSearchOpen ? 'hidden' : 'flex'} sm:flex justify-between items-center w-fit py-2`}>
        <p className="text-sm px-2 pr-4 border-slate-300">{activeTab}</p>
        {selectedRowIds.length > 0 && (
          <div className="flex space-x-4 pr-2 pl-2 border-l-[1.5px]">
            <PencilSquareIcon className="w-4 h-4 inline ml-2 cursor-pointer" onClick={handleEditClick} />
            <TrashIcon className="w-4 h-4 inline cursor-pointer" onClick={handleDeleteClick} />
          </div>
        )}
      </div>
      <div className={`${isSearchOpen ? 'w-full sm:w-fit max-h-fit' : 'w-fit'} flex justify-end items-center space-x-2`}>
        <SearchBar isSearchOpen={isSearchOpen} toggleSearch={toggleSearch} />
        <FilterBtn isSearchOpen={isSearchOpen} />
        <div className={`${isSearchOpen ? 'hidden lg:flex' : 'flex'} lg:flex justify-between items-center space-x-4`}>
          <p className="hidden sm:block text-xs pl-4 border-l-[1.5px]">1 - 47 of 47</p>
          <div className="pl-4 border-l-[1.5px] sm:pl-0 sm:border-none">
            <ChevronLeftIcon className="w-8 h-8 p-2 rounded-full on-click inline" />
            <ChevronRightIcon className="w-8 h-8 p-2 rounded-full on-click inline" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableHeader;
