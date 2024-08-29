import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function Pagination({ pageLimitStart, pageLimitEnd, pageInterval, totalItems, onPageChange, toTop }) {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const newPage = Math.ceil(pageLimitStart / pageInterval) || 1;
        setCurrentPage(newPage);
    }, [pageLimitStart, pageInterval]);

    const totalPages = Math.ceil(totalItems / (pageInterval || 1)); // Avoid division by zero

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        const validPageInterval = pageInterval || 10; // Default to 10 if pageInterval is undefined

        let limitStart = (pageNumber - 1) * validPageInterval + 1;
        let limitEnd = Math.min(pageNumber * validPageInterval + 1, totalItems + 1);

        limitStart = Math.max(limitStart, 1);

        onPageChange(limitStart, limitEnd);
        if (toTop) {
            window.scrollTo({ top: 0 });
        }
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

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    return (
        <div className='min-w-fit mx-auto flex justify-evenly items-center'>
            <div>
                <ChevronLeftIcon
                    className={`h-8 w-8 p-2 font-bold rounded-full cursor-pointer ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : ''}`}
                    onClick={handlePreviousPage}
                />
            </div>
            <div className='space-x-3'>
                {renderPageNumbers().map((page, index) =>
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className='cursor-default'>...</span>
                    ) : (
                        <span
                            key={`page-${page}`}
                            className={`font-arsenal font-semibold px-3 p-2 rounded-full cursor-pointer ${page === currentPage ? 'bg-green-700 text-white' : 'text-slate-500'}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </span>
                    )
                )}
            </div>
            <div>
                <ChevronRightIcon
                    className={`h-8 w-8 p-2 font-bold rounded-full cursor-pointer ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : ''}`}
                    onClick={handleNextPage}
                />
            </div>
        </div>
    );
}

export default Pagination;
