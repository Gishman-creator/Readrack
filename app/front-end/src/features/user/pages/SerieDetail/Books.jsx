import React from 'react'
import harryPotter1 from '../../../../assets/harry_potter_1_.jpg'

function Books() {
  return (
    <div>
      <p className='font-poppins font-semibold text-2xl mt-8 md:mt-0  2xl:w-full 2xl:text-center'>Harry potter serie books:</p>
      <div className='2xl:grid 2xl:grid-cols-2 gap-x-4'>
        <div className='flex space-x-2 mt-4 pb-4 border-b'>
          <img src={harryPotter1} alt="book image" className='h-[9rem] w-[6rem] rounded-sm' />
          <div className='min-h-full flex flex-col justify-between'>
            <p className='font-bold m-0 leading-5 text-sm'>Harry Potter and the Sorcerer's Stone (Philosopher's Stone in the UK)</p>
            <p className='font-arsenal text-sm'>by J.K Rowling</p>
            <p className='font-poppins text-[#b5b5b5] text-sm'>#1, published 1997</p>
            <a href="#" className='bg-[#37643B] block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto'>Serie on amazon</a>
          </div>
        </div>
        <div className='flex space-x-2 mt-4 pb-4 border-b'>
          <img src={harryPotter1} alt="book image" className='h-[9rem] w-[6rem] rounded-sm' />
          <div className='min-h-full flex flex-col justify-between'>
            <p className='font-bold m-0 leading-5 text-sm'>Harry Potter and the Sorcerer's Stone (Philosopher's Stone in the UK)</p>
            <p className='font-arsenal text-sm'>by J.K Rowling</p>
            <p className='font-poppins text-[#b5b5b5] text-sm'>#1, published 1997</p>
            <a href="#" className='bg-[#37643B] block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto'>Serie on amazon</a>
          </div>
        </div>
        <div className='flex space-x-2 mt-4 pb-4 border-b'>
          <img src={harryPotter1} alt="book image" className='h-[9rem] w-[6rem] rounded-sm' />
          <div className='min-h-full flex flex-col justify-between'>
            <p className='font-bold m-0 leading-5 text-sm'>Harry Potter and the Sorcerer's Stone (Philosopher's Stone in the UK)</p>
            <p className='font-arsenal text-sm'>by J.K Rowling</p>
            <p className='font-poppins text-[#b5b5b5] text-sm'>#1, published 1997</p>
            <a href="#" className='bg-[#37643B] block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto'>Serie on amazon</a>
          </div>
        </div>
        <div className='flex space-x-2 mt-4 pb-4 border-b'>
          <img src={harryPotter1} alt="book image" className='h-[9rem] w-[6rem] rounded-sm' />
          <div className='min-h-full flex flex-col justify-between'>
            <p className='font-bold m-0 leading-5 text-sm'>Harry Potter and the Sorcerer's Stone (Philosopher's Stone in the UK)</p>
            <p className='font-arsenal text-sm'>by J.K Rowling</p>
            <p className='font-poppins text-[#b5b5b5] text-sm'>#1, published 1997</p>
            <a href="#" className='bg-[#37643B] block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto'>Serie on amazon</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Books