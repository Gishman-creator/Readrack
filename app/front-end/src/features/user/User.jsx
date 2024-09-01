import React, { useEffect } from 'react';
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
import SerieDetails from './detailsPages/SerieDetails'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Footer from './components/Footer';

function User() {
  const activeTab = useSelector((state) => state.user.activeTab);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const logVisit = async () => {
      try {
        await axiosUtils('/api/log-visit', 'POST', {
          pageVisited: location.pathname,
          sessionId: sessionStorage.getItem('sessionId') || createSessionId(),
        });
        // console.log("Logging a user.............")
      } catch (error) {
        console.error('Error logging visit:', error);
      }
    };

    logVisit();
  }, [location]);

  const createSessionId = () => {
    const sessionId = Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('sessionId', sessionId);
    return sessionId;
  };

  useEffect(() => {
    dispatch(setActiveTab(''));
    if (location.pathname.startsWith('/series')) {
      dispatch(setActiveTab('Series'));
    } else if (location.pathname.startsWith('/authors')) {
      dispatch(setActiveTab('Authors'));
    }
  }, [location, dispatch]);

  return (
    <div className='block min-h-screen bg-white'>
      <NavBar />
      <div className='h-screen-nonav flex flex-col justify-between'>
        <div>
          <Routes>
            <Route path='/' element={<Navigate to='/series' />} />
            <Route path='/series' element={<Home />} />
            <Route path='/authors' element={<Home />} />
            <Route path='/series/:serieId/:serieName?' element={<SerieDetails />} />
            <Route path='/authors/:authorId/:authorName?' element={<AuthorDetails />} />
            <Route path='/search' element={<SearchResults />} />
            <Route path='/about-us' element={<AboutUs />} />
          </Routes>
          <a
            href='https://insigh.to/b/readrack-recommend-book-series-or-authors-or-report-an-issue'
            target="_blank"
            rel="noopener noreferrer"
            className='group flex bg-primary text-white fixed bottom-0 right-0 mt-auto mb-4 mx-4 max-w-fit max-h-fit p-2 rounded-lg z-20 cursor-pointer on-click-amzn'
          >
            <span className='hidden group-hover:inline font-poppins font-semibold text-xs text-white px-4 py-2 opacity-0 transform transition-opacity transition-transform duration-1000 group-hover:opacity-100 group-hover:scale-100'>
              Make recommendations or report an issue
            </span>
            <p className='text-4xl font-arima font-bold group-hover:opacity-0 group-hover:scale-0 transform transition-transform duration-300'>
              <QuestionMarkCircleIcon className='w-6 h-6 ml-auto' />
            </p>
          </a>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default User;
