import React from 'react'
import logo from '../../../assets/logo1.jpg'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux';

function Footer() {

    const currentYear = new Date().getFullYear();
    const activeTab = useSelector((state) => state.user.activeTab);

    return (
        <div className='px-[4%] sm:px-[12%]'>
            <div className='flex flex-col md:flex-row items-start justify-between border-t border-gray-300 pt-4 sm:pt-2'>
                <div className='h-full flex flex-col justify-between'>
                    <div className='flex items-center'>
                        <div>
                            <img src={logo} alt="Logo" className="w-8 h-8" />
                        </div>
                        <div title='Home' className='font-arima text-2xl flex cursor-pointer' onClick={() => navigate('/')}>
                            <h1 className='inline'>read</h1>
                            <h1 className='inline font-bold text-primary'>rack</h1>
                        </div>
                    </div>
                    <p className='font-arima text-sm mt-2 lg:w-4/5 mr-2'>
                        ReadRack is the go-to platform for book lovers, offering tools to explore book series in order, complete author works, standalone novels, and genres.
                        With features like author bios, social links, recommendations, and powerful search tools, it helps you discover, organize, and track your reading.
                        Join the community, suggest books, and support the platform as we celebrate literature and connect readers to the works of authors worldwide.
                    </p>
                </div>
                <div className='mt-4 md:mt-0 w-full md:w-1/2 h-full font-semibold text-gray-500'>
                    <h2 className='font-poppins font-semibold text-base'>Links</h2>
                    <div className='flex flex-row md:flex-col items-start mt-1 md:mt-0'>
                        <Link to='/series' className={`${activeTab === "Series" ? 'text-primary font-extrabold' : ''} font-arima text-sm md:mt-2 mr-4 md:mr-0`} >Series</Link>
                        <Link to='/authors' className={`${activeTab === "Authors" ? 'text-primary font-extrabold' : ''} font-arima text-sm md:mt-1 mr-4 md:mr-0`} >Authors</Link>
                        <Link to='/about-us' className={`${location.pathname.startsWith('/about-us') ? 'text-primary font-extrabold' : ''} font-arima text-sm md:mt-1 mr-4 md:mr-0`} >About us</Link>
                    </div>
                </div>
            </div>
            <span className='block py-2 text-xs text-center font-bold text-gray-500 mb-1 mt-4 sm:mt-0'>© {currentYear} readrack. All Rights Reserved.</span>
        </div>
    )
}

export default Footer