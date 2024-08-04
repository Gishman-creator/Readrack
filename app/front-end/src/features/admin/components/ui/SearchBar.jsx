import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import React from 'react'

function SearchBar() {
  return (
    <div className='bg-[#fafcf8] w-1/2 flex items-center space-x-2 border p-2 px-3 rounded drop-shadow-sm'>
        <MagnifyingGlassIcon className='w-4 h-4' />
        <input type="text" placeholder='Search' className='text-xs w-full bg-transparent outline-none' />
    </div>
  )
}

export default SearchBar