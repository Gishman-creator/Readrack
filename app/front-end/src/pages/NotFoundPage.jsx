import React from 'react'
import logo from '../assets/logo1.jpg'
import { useNavigate } from 'react-router-dom';

function NotFoundPage({ type }) {

  let data;
  
  if(type) {
    data = `We couldn't find the ${type} you were looking for.`;
  } else {
    data = "We couldn't find the page you were looking for.";
  }

  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // This navigates to the previous page in the history
  };

  return (
    <div className='px-[4%] sm:px-[12%] pb-10 md:pb-0'>
      <div className='h-screen-nonav flex flex-col lg:flex-row justify-center lg:justify-evenly items-center'>
        <img src={logo} alt="Logo" className="w-[20rem] h-[20rem]" />
        <div className='flex flex-col justify-center items-center mt-6'>
          <p className='font-poppins font-semibold text-3xl text-center'>Uh-oh!</p>
          <p className='font-arima text-base text-center w-[17rem]'>{data}</p>
          <span
            onClick={goBack}
            className='block my-8 py-2 px-4 bg-primary on-click-amzn max-w-fit rounded-lg cursor-pointer text-white text-sm font-semibold font-poppins'
          >
            Go back
          </span>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage