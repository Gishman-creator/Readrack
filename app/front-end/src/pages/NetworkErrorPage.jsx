import React from 'react';
import logo from '../assets/logo1.jpg';
import { useNavigate } from 'react-router-dom';

function NetworkErrorPage() {
  const navigate = useNavigate();

  const reloadPage = () => {
    window.location.reload(); // This reloads the current page
  };

  return (
    <div className='px-[4%] sm:px-[12%] sm:mt-0 pb-10 md:pb-0'>
      <div className='h-screen-nonav flex flex-col lg:flex-row justify-center lg:justify-evenly items-center'>
        <img src={logo} alt="Logo" className="w-[20rem] h-[20rem]" />
        <div className='flex flex-col justify-center items-center md:mt-6'>
          <p className='font-poppins font-semibold text-3xl text-center mb-2'>Oops!</p>
          <p className='font-arima text-base text-center w-[20rem]'>
            An unexpected error occurred. We apologize for the inconvenience.
            There was a problem connecting to the server.
          </p>
          <p className='font-arima text-base text-center w-[20rem] mt-2'>
            Please check your internet connection or try again later.
          </p>
          <div className='my-8 '>
            <span
              onClick={reloadPage}
              className='py-2 px-4 bg-primary on-click-amzn max-w-fit rounded-lg cursor-pointer text-white text-sm font-semibold font-poppins'
            >
              Reload page
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkErrorPage;
