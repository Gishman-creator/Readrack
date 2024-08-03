import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './features/user/home/Home';
import User from './features/user/User';
import Admin from './features/admin/Admin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<User />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </Router>
  );
}
