// features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosUtils from '../../../utils/axiosUtils';

const initialState = {
    isLoggedIn: null,
    isLoading: false,
    error: null,
    accessToken: null,
    refreshToken: null,
    email: '', // Storing email for use in verification
};

// Async thunk for logging in a user
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await axiosUtils('/api/auth/login', 'POST', { email, password });
            return { ...response, email };
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to log in');
        }
    }
);

// Async thunk for signing up a new user
export const signup = createAsyncThunk(
    'auth/signup',
    async ({ firstName, lastName, email, password, role }, { rejectWithValue }) => {
        try {
            const response = await axiosUtils('/api/auth/signup', 'POST', { firstName, lastName, email, password, role });
            return response;
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to sign up');
        }
    }
);

export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async ({ email, code }, { rejectWithValue }) => {
      if (!email || !code) {
        return rejectWithValue('Email or verification code is missing');
      }
  
      try {
        const response = await axiosUtils('/api/auth/verify', 'POST', { email, code });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Verification failed');
      }
    }
  );

export const resendCode = createAsyncThunk(
  'auth/resendCode',
  async (_, { getState, rejectWithValue }) => {
    const { email } = getState().auth;
    try {
      const response = await axiosUtils('/api/auth/resend-code', 'POST', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Resend code failed');
    }
  }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async ({ accessToken, refreshToken }, { rejectWithValue }) => {
        if (!accessToken || !refreshToken) {
            return rejectWithValue('No access or refresh token provided');
        }

        try {
            // Send a request to the logout endpoint with the access token
            await axiosUtils('/api/auth/logout', 'POST', {}, { Authorization: `Bearer ${accessToken}`, 'x-refresh-token': refreshToken });
            return;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to log out');
        }
    }
);


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoginState: (state, action) => {
            state.isLoggedIn = action.payload;
        },
        // Reducer to handle logout
        clearAuthState: (state) => {
            state.isLoggedIn = false;
            state.accessToken = null;
            state.refreshToken = null;
            state.email = '';
            saveAuthState(state);
        },
        // Reducer to set tokens and log in
        setTokens: (state, action) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.isLoggedIn = true;
            state.email = action.payload.email;
            saveAuthState(state);
        },
    },
    extraReducers: (builder) => {
        builder
            // Handling login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isLoggedIn = true;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.email = action.payload.email;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Handling signup
            .addCase(signup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Handling email verification
            .addCase(verifyEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.isLoggedIn = true;
                state.error = null;
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(resendCode.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resendCode.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(resendCode.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoading = false;
                state.isLoggedIn = false;
                state.accessToken = null;
                state.refreshToken = null;
                state.email = '';
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
    },
});

export const { clearAuthState, setTokens, setLoginState } = authSlice.actions;

export default authSlice.reducer;
