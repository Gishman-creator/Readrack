import React from 'react';
import { useNavigate } from 'react-router-dom'
import harryPotterSerie from '../../../assets/harry_potter_serie.png'

function Cards() {

    const navigate = useNavigate();

    const navigateToSeriesDetails = (serieName) => {
        const formatedSerieName = serieName.toLowerCase().replace(/\s+/g, '-');
        navigate(`/series/${formatedSerieName}`)
    };

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-4'>
        <div className='w-full border border-[#ededed] hover:border-[#e1e1e1] hover:shadow-sm rounded-md cursor-pointer' onClick={ () => {navigateToSeriesDetails('Harry Potter')}}>
            <img src={harryPotterSerie} alt="Serie image" className='h-44 w-full bg-[#edf4e6] rounded-sm'/>
            <div className='flex-col justify-center items-center py-2 px-2'>
                <p className='font-poppins font-semibold text-sm'>Harry potter serie</p>
                <p className='font-arsenal text-xs'>by J.K Rowling</p>
                <p className='font-poppins font-semibold text-xs text-[#b5b5b5]'>7 books</p>
            </div>
        </div>
        <div className='w-full border border-[#ededed] hover:border-[#e1e1e1] hover:shadow-sm rounded-md cursor-pointer'>
            <img src={harryPotterSerie} alt="Serie image" className='h-44 w-full bg-[#edf4e6] rounded-sm'/>
            <div className='flex-col justify-center items-center py-2 px-2'>
                <p className='font-poppins font-semibold text-sm'>Harry potter serie</p>
                <p className='font-arsenal text-xs'>by J.K Rowling</p>
                <p className='font-poppins font-semibold text-xs text-[#b5b5b5]'>7 books</p>
            </div>
        </div>
        <div className='w-full border border-[#ededed] hover:border-[#e1e1e1] hover:shadow-sm rounded-md cursor-pointer'>
            <img src={harryPotterSerie} alt="Serie image" className='h-44 w-full bg-[#edf4e6] rounded-sm'/>
            <div className='flex-col justify-center items-center py-2 px-2'>
                <p className='font-poppins font-semibold text-sm'>Harry potter serie</p>
                <p className='font-arsenal text-xs'>by J.K Rowling</p>
                <p className='font-poppins font-semibold text-xs text-[#b5b5b5]'>7 books</p>
            </div>
        </div>
        <div className='w-full border border-[#ededed] hover:border-[#e1e1e1] hover:shadow-sm rounded-md cursor-pointer'>
            <img src={harryPotterSerie} alt="Serie image" className='h-44 w-full bg-[#edf4e6] rounded-sm'/>
            <div className='flex-col justify-center items-center py-2 px-2'>
                <p className='font-poppins font-semibold text-sm'>Harry potter serie</p>
                <p className='font-arsenal text-xs'>by J.K Rowling</p>
                <p className='font-poppins font-semibold text-xs text-[#b5b5b5]'>7 books</p>
            </div>
        </div>
        <div className='w-full border border-[#ededed] hover:border-[#e1e1e1] hover:shadow-sm rounded-md cursor-pointer'>
            <img src={harryPotterSerie} alt="Serie image" className='h-44 w-full bg-[#edf4e6] rounded-sm'/>
            <div className='flex-col justify-center items-center py-2 px-2'>
                <p className='font-poppins font-semibold text-sm'>Harry potter serie</p>
                <p className='font-arsenal text-xs'>by J.K Rowling</p>
                <p className='font-poppins font-semibold text-xs text-[#b5b5b5]'>7 books</p>
            </div>
        </div>
        <div className='w-full border border-[#ededed] hover:border-[#e1e1e1] hover:shadow-sm rounded-md cursor-pointer'>
            <img src={harryPotterSerie} alt="Serie image" className='h-44 w-full bg-[#edf4e6] rounded-sm'/>
            <div className='flex-col justify-center items-center py-2 px-2'>
                <p className='font-poppins font-semibold text-sm'>Harry potter serie</p>
                <p className='font-arsenal text-xs'>by J.K Rowling</p>
                <p className='font-poppins font-semibold text-xs text-[#b5b5b5]'>7 books</p>
            </div>
        </div>
        <div className='w-full border border-[#ededed] hover:border-[#e1e1e1] hover:shadow-sm rounded-md cursor-pointer'>
            <img src={harryPotterSerie} alt="Serie image" className='h-44 w-full bg-[#edf4e6] rounded-sm'/>
            <div className='flex-col justify-center items-center py-2 px-2'>
                <p className='font-poppins font-semibold text-sm'>Harry potter serie</p>
                <p className='font-arsenal text-xs'>by J.K Rowling</p>
                <p className='font-poppins font-semibold text-xs text-[#b5b5b5]'>7 books</p>
            </div>
        </div>
        <div className='w-full border border-[#ededed] hover:border-[#e1e1e1] hover:shadow-sm rounded-md cursor-pointer'>
            <img src={harryPotterSerie} alt="Serie image" className='h-44 w-full bg-[#edf4e6] rounded-sm'/>
            <div className='flex-col justify-center items-center py-2 px-2'>
                <p className='font-poppins font-semibold text-sm'>Harry potter serie</p>
                <p className='font-arsenal text-xs'>by J.K Rowling</p>
                <p className='font-poppins font-semibold text-xs text-[#b5b5b5]'>7 books</p>
            </div>
        </div>
    </div>
  );
}

export default Cards;
