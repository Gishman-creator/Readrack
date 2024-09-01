import React, { useState, useEffect } from 'react';
import AreaChart from './charts/AreaChart';
import axiosUtils from '../../../utils/axiosUtils';

function Dashboard() {
    const [counts, setCounts] = useState({
        books: 0,
        series: { total: 0, complete: 0, incomplete: 0 },
        authors: { total: 0, complete: 0, incomplete: 0 },
    });

    const fetchCounts = async () => {
        try {
            const bookCountResponse = await axiosUtils('/api/getCount?type=books', 'GET');
            const seriesCountResponse = await axiosUtils('/api/getCount?type=series', 'GET');
            const authorCountResponse = await axiosUtils('/api/getCount?type=authors', 'GET');

            setCounts({
                books: bookCountResponse.data.totalCount,
                series: {
                    total: seriesCountResponse.data.totalCount,
                    complete: seriesCountResponse.data.completeCount,
                    incomplete: seriesCountResponse.data.incompleteCount
                },
                authors: {
                    total: authorCountResponse.data.totalCount,
                    complete: authorCountResponse.data.completeCount,
                    incomplete: authorCountResponse.data.incompleteCount
                }
            });
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    return (
        <div className=''>
            <h1 className='text-xl font-semibold'>Dashboard</h1>
            <AreaChart />
            <h1 className='text-xl font-semibold mt-4'>Catalog</h1>
            <div className='grid grid-cols-1 md:grid-cols-3 md:gap-x-4 text-sm'>
                <div className="bg-[#fafcf8] p-6 mt-4 rounded-lg space-y-4 drop-shadow">
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Books</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>{counts.books}</p>
                    </div>
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Series</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>{counts.series.total}</p>
                    </div>
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Authors</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>{counts.authors.total}</p>
                    </div>
                </div>
                <div className="bg-[#fafcf8] p-6 mt-4 rounded-lg space-y-4 drop-shadow">
                    <div className='w-2/5 flex justify-between items-center'>
                        <p className='font-semibold text-base'>Series</p>
                    </div>
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Incomplete</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>{counts.series.incomplete}</p>
                    </div>
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Complete</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>{counts.series.complete}</p>
                    </div>
                </div>
                <div className="bg-[#fafcf8] p-6 mt-4 rounded-lg space-y-4 drop-shadow">
                    <div className='w-2/5 flex justify-between items-center'>
                        <p className='font-semibold text-base'>Authors</p>
                    </div>
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Incomplete</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>{counts.authors.incomplete}</p>
                    </div>
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Complete</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>{counts.authors.complete}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
