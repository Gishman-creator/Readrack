import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isVisible: window.innerWidth >= 768,
  isExpanded: window.innerWidth >= 768,
};

const SideBarSlice = createSlice({
  name: 'sidebar', // Ensure the name matches what you use in the component selector
  initialState,
  reducers: {
    toggleVisibility: (state) => {
      if (window.innerWidth < 768) {
        state.isVisible = !state.isVisible;
      }
    },
    toggleExpansion: (state) => {
      if (window.innerWidth >= 768) {
        state.isExpanded = !state.isExpanded;
        // console.log(state.isExpanded);
      }
    },
    setVisibility: (state, action) => {
      state.isVisible = action.payload;
    },
    setExpansion: (state, action) => {
      state.isExpanded = action.payload;
    },
  },
});

export const { toggleVisibility, toggleExpansion, setVisibility, setExpansion } = SideBarSlice.actions;

export default SideBarSlice.reducer;
