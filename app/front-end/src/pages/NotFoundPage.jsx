import React from 'react'
import logo from '../assets/logo1.jpg'
import { useNavigate } from 'react-router-dom';

function NotFoundPage({ type }) {
  // console.log("The type is:", type);

  let data;
  
  if(type === 'author' || type === 'Authors') {
    data = "We couldn't find the author you were looking for.";
  } else if ( type === 'serie' || type === 'Series' ) {
    data = "We couldn't find the serie you were looking for.";
  } else {
    data = 'The page ran away with the spoon.';
  }

  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // This navigates to the previous page in the history
  };

  return (
    <div className='px-[4%] sm:px-[12%] pb-10 md:pb-0'>
      <div className='h-screen-nonav flex flex-col md:flex-row justify-center md:justify-evenly items-center'>
        <img src={logo} alt="Logo" className="w-[20rem] h-[20rem]" />
        <div className='flex flex-col justify-center items-center mt-6'>
          <p className='font-poppins font-semibold text-3xl text-center'>Uh-oh!</p>
          <p className='font-arima text-base text-center w-[17rem]'>{data}</p>
          <span
            onClick={goBack}
            className='block mt-4 py-2 px-4 bg-primary on-click-amzn max-w-fit rounded-lg cursor-pointer text-white text-sm font-semibold font-poppins'
          >
            Go back
          </span>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage