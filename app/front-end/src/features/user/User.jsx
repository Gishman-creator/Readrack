import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home/Home';
import SerieDetails from './detailsPages/SerieDetails';
import SideBar from './components/SideBar';
import NavBar from './components/NavBar';

function User() {
  return (
    <div className='block min-h-screen bg-white'>
      <NavBar />
      <div>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/serie/:serieId/:serieName' element={<SerieDetails />} />
          <Route path='/author/:authorId/:authorName' element={<SerieDetails />} />
        </Routes>
      </div>
    </div>
  );
}

export default User;
