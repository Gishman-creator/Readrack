// store.js

import { configureStore } from '@reduxjs/toolkit';
import SideBarReducer from '../features/admin/components/SideBarSlice';
import authReducer from '../features/authentication/slices/authSlice';
import tabReducer from '../features/admin/slices/tabSlice'

const Store = configureStore({
  reducer: {
    sideBar: SideBarReducer,
    auth: authReducer, // Add authReducer to the store
    tabs: tabReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default Store;
