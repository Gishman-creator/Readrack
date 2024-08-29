import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './home/Home';
import SerieDetails from './detailsPages/SerieDetails';
import SideBar from './components/SideBar';
import NavBar from './components/NavBar';
import AuthorDetails from './detailsPages/AuthorDetails';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from './slices/userSlice';
import SearchResults from './search/SearchResults';
import NotFoundPage from '../../pages/NotFoundPage';

function User() {
  const activeTab = useSelector((state) => state.user.activeTab);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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
      <div>
        <Routes>
          <Route path='/' element={<Navigate to='/series' />} />
          <Route path='/series' element={<Home />} />
          <Route path='/authors' element={<Home />} />
          <Route path='/series/:serieId/:serieName?' element={<SerieDetails />} />
          <Route path='/authors/:authorId/:authorName?' element={<AuthorDetails />} />
          <Route path='/search' element={<SearchResults />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default User;
