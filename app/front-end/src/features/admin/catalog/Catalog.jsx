import { PlusIcon } from '@heroicons/react/24/outline'
import React from 'react'
import SearchBar from '../components/ui/SearchBar'
import FilterBtn from '../components/ui/FilterBtn'
import Table from '../components/ui/Table'

function Catalog() {
  return (
    <div className=''>
      <div>
        <h1 className='text-xl font-semibold'>Catalog</h1>
        <p className='text-xs text-slate-500'>Manage your catalog</p>
      </div>
      <div className='flex justify-between items-center space-x-2 mt-6 cursor-pointer'>
        <div className='grid grid-cols-3 text-xs'>
          <p className='text-center px-4 py-1 border-b-2 border-green-800'>Series</p>
          <p className='text-center px-4 py-1 border-b-2'>Authors</p>
          <p className='text-center px-4 py-1 border-b-2'>Books</p>
        </div>
        <div
          href='#'
          className='bg-[#37643B] flex  items-center space-x-2 text-center text-white text-sm font-semibold font-poppins px-3 p-2 rounded on-click-amzn'
        >
          <PlusIcon className='w-3 h-3 inline' />
          <p className='text-xs'>Add</p>
        </div>
      </div>
      <div className='bg-[#f3f7ed] mt-4 p-2 rounded flex justify-between items-center'>
        <SearchBar />
        <FilterBtn />
      </div>
      <div className='mt-4'>
        <Table />
      </div>
    </div>
  )
}

export default Catalog