import React from 'react'
import AreaChart from './charts/AreaChart'

function Dashboard() {
    return (
        <div className=''>
            <h1 className='text-xl font-semibold'>Dashboard</h1>
            <AreaChart />
            <h1 className='text-xl font-semibold mt-4'>Catalog</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 md:gap-x-4 lg:gap-x-40 text-sm'>
                <div className="bg-[#fafcf8] p-6 mt-4 rounded-lg space-y-4 drop-shadow">
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Books</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>100</p>
                    </div>
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Series</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>40</p>
                    </div>
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Authors</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>38</p>
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
                        <p className='font-semibold text-slate-400 ml-4'>25</p>
                    </div>
                    <div className='w-2/5 flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                            <div className='h-3 w-3 bg-green-700 rounded-full'></div>
                            <p className='font-semibold text-slate-500'>Complete</p>
                        </div>
                        <p className='font-semibold text-slate-400 ml-4'>15</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard