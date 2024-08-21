import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        activeTab: 'Series'
    },
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        }
    },
});

export const { setActiveTab } = userSlice.actions;
export default userSlice.reducer;