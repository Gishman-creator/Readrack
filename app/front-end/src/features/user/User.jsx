import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home/Home';
import SerieDetails from './SerieDetail/SerieDetails';

function User() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/series/:seriesName' element={<SerieDetails />} />
      </Routes>
    </div>
  );
}

export default User;
