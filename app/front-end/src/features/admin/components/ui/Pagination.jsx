import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTableLimitEnd, setTableLimitStart } from '../../slices/catalogSlice';

function Pagination({ isSearchOpen }) {
    const [currentPage, setCurrentPage] = useState(1);
    const limitStart = useSelector((state) => state.catalog.tableLimitStart);
    const limitEnd = useSelector((state) => state.catalog.tableLimitEnd);
    const totalItems = useSelector((state) => state.catalog.tableTotalItems);
    const pageInterval = 50;

    const dispatch = useDispatch();

    useEffect(() => {
        const newPage = Math.floor(limitStart / pageInterval) + 1;
        setCurrentPage(newPage);
    }, [limitStart, pageInterval]);

    const totalPages = Math.ceil(totalItems / pageInterval);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        const validPageInterval = pageInterval || 50;

        let newLimitStart = (pageNumber - 1) * validPageInterval;
        let newLimitEnd = Math.min(pageNumber * validPageInterval, totalItems);

        dispatch(setTableLimitStart(newLimitStart));     
        dispatch(setTableLimitEnd(newLimitEnd));     
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    return (
        <div className={`${isSearchOpen ? 'hidden lg:flex' : 'flex'} lg:flex justify-between items-center space-x-2`}>
            <p className="hidden sm:block text-xs pl-4 border-l-[1.5px]">
                {limitStart + 1} - {limitEnd > totalItems ? totalItems :limitEnd} of {totalItems}
            </p>
            <div className="flex border-l-[1.5px] sm:border-none">
                <ChevronLeftIcon
                    className={`w-8 h-8 p-2 rounded-full cursor-pointer ${currentPage === 1 ? 'text-gray-300 cursor-default' : ''}`}
                    onClick={handlePreviousPage}
                />
                <ChevronRightIcon
                    className={`w-8 h-8 p-2 rounded-full cursor-pointer ${currentPage === totalPages ? 'text-gray-300 cursor-default' : ''}`}
                    onClick={handleNextPage}
                />
            </div>
        </div>
    );
}

export default Pagination;
