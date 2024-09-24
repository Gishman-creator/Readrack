import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './home/Home';
import SideBar from './components/SideBar';
import NavBar from './components/NavBar';
import AuthorDetails from './detailsPages/AuthorDetails';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from './slices/userSlice';
import SearchResults from './search/SearchResults';
import NotFoundPage from '../../pages/NotFoundPage';
import axiosUtils from '../../utils/axiosUtils';
import AboutUs from './about us/AboutUs';
import SerieDetails from './detailsPages/SerieDetails';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Footer from './components/Footer';
import CollectionDetails from './detailsPages/CollectionDetails';
import NetworkErrorPage from '../../pages/NetworkErrorPage';

function User() {
  const activeTab = useSelector((state) => state.user.activeTab);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // State to manage the visibility of the div
  const [isDivVisible, setIsDivVisible] = useState(false);
  const divRef = useRef(null); // Reference to the div

  useEffect(() => {
    const logVisit = async () => {
      try {
        await axiosUtils('/api/visit', 'POST', {
          pageVisited: location.pathname,
          sessionId: sessionStorage.getItem('sessionId') || createSessionId(),
        });
        // console.log("Logging a user.............")
      } catch (error) {
        console.error('Error logging visit:', error);
      }
    };

    logVisit();
  }, []);

  const createSessionId = () => {
    const sessionId = Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('sessionId', sessionId);
    return sessionId;
  };

  useEffect(() => {
    dispatch(setActiveTab(''));
    if (location.pathname.startsWith('/series')) {
      dispatch(setActiveTab('Series'));
      // console.log('Active tab set to: series')
    } else if (location.pathname.startsWith('/authors')) {
      dispatch(setActiveTab('Authors'));
      // console.log('Active tab set to: authors')
    }
  }, [location, dispatch]);

  const toggleDivVisibility = () => {
    setIsDivVisible(!isDivVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setIsDivVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [divRef]);

  return (
    <div className='block bg-white'>
      <NavBar />
      <div className='h-screen-nonav mt-[3.5rem] flex flex-col justify-between'>
        <div>
          <Routes>
            <Route path='/' element={<Navigate to='/series' />} />
            <Route path='/series' element={<Home />} />
            <Route path='/authors' element={<Home />} />
            <Route path='/series/:serieId/:serieName?' element={<SerieDetails />} />
            <Route path='/collections/:collectionId/:collectionName?' element={<CollectionDetails />} />
            <Route path='/authors/:authorId/:authorName?' element={<AuthorDetails />} />
            <Route path='/search' element={<SearchResults />} />
            <Route path='/about-us' element={<AboutUs />} />
            <Route path='/404' element={<NotFoundPage />} />
            <Route path='*' element={<Navigate to="/404" />} />
          </Routes>
          <div
            ref={divRef} // Attach the ref to this div
            className={`${isDivVisible ? ' bg-white pb-4' : ' bg-primary'} group flex text-black shadow-custom3 fixed bottom-0 right-0 mt-auto mb-4 mx-4 max-w-fit max-h-fit p-2 rounded-lg z-20 cursor-pointer`}
          >
            <div
              className={`${isDivVisible ? 'block' : 'hidden'
                } text-sm font-poppins px-4 py-2 rounded-lg transform transition-opacity duration-300`}
            >
              <div className='flex justify-between items-center mb-4'>
                <p className='font-poppins'>Feedback</p>
                <span
                  className='text-xl cursor-pointer'
                  onClick={toggleDivVisibility}
                >
                  &times;
                </span>
              </div>
              <div>
                <p className='mb-1 font-bold'>We're always looking to improve your experience on readrack. Please let us know your thoughts by:</p>
                <ul className='mb-8'>
                  <li>Suggesting new series or authors.</li>
                  <li>Reporting any issues.</li>
                </ul>
                <p className='mb-4 text-xs'>Leave any feedback about our website on our Insighto board</p>
                <a
                  href='https://insigh.to/b/readrack-recommend-book-series-or-authors-or-report-an-issue'
                  target="_blank"
                  rel="noopener noreferrer"
                  className='bg-primary text-white text-xs font-semibold py-2 px-4 rounded-lg on-click-amzn'
                  onClick={toggleDivVisibility}
                >
                  Leave feedback
                </a>
              </div>
            </div>
            <p
              className={`${isDivVisible ? 'hidden' : 'block'} text-4xl font-arima font-bold transform transition-transform duration-300`}
              onClick={toggleDivVisibility}
            >
              <QuestionMarkCircleIcon className='w-6 h-6 ml-auto text-white hover:scale-125' />
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default User;
