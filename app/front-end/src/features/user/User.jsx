import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import SerieDetails from './pages/SerieDetail/SerieDetails';

function User() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/series/:seriesName' element={<SerieDetails />} />
      </Routes>
    </Router>
  );
}

export default User;
