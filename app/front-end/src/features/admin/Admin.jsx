// Admin.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/SideBar'; // Ensure this path matches your project structure
import Dashboard from './dashboard/Dashboard';
import Catalog from './catalog/Catalog';
import Editor from './UiElements/Editor';
import NavBar from './components/NavBar';
import { toggleVisibility } from './components/SideBarSlice';
import { useDispatch, useSelector } from 'react-redux';
import CatalogCont from './catalog/CatalogCont';


function Admin() {

    const dispatch = useDispatch();
    const { isExpanded } = useSelector((state) => state.sideBar);

    return (
        <div className="flex min-h-full bg-[#e6efdc] font-poppins">
            <Sidebar />
            <div className={`flex-1 bg-[#e6efdc] transition-margin duration-300 w-full ${isExpanded ? 'md:ml-[13.1rem]' : 'md:ml-[4.8rem]'}`}>
                <NavBar />
                <div className="p-4 px-5 bg-[#e6efdc]">
                    <Routes>
                        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="catalog/*" element={<CatalogCont />} />
                        <Route path="editor" element={<Editor />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default Admin;
