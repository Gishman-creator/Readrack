// store.js

import { configureStore } from '@reduxjs/toolkit';
import SideBarReducer from '../features/admin/components/SideBarSlice';
import authReducer from '../features/authentication/slices/authSlice';
import catalogReducer from '../features/admin/slices/catalogSlice'
import userReducer from '../features/user/slices/userSlice';

const Store = configureStore({
  reducer: {
    sideBar: SideBarReducer,
    auth: authReducer, // Add authReducer to the store
    catalog: catalogReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default Store;
