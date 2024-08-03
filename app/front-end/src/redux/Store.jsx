// store.js

import { configureStore } from '@reduxjs/toolkit';
import SideBarReducer from '../features/admin/components/SideBarSlice';

const Store = configureStore({
  reducer: {
    sideBar: SideBarReducer,
  },
});

export default Store;
