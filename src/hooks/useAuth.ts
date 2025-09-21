import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { AuthApi } from '../api/authApi';

interface User {
  name: string;
  email: string;
  role: string;
  facilityID: string;
  status: string;
  fabricEnrollmentID: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await AuthApi.logIn(credentials.email, credentials.password);
      const { token } = response;
      await SecureStore.setItemAsync('userToken', token);
      console.log('Login successful, token stored:', token);
      const userProfile = await AuthApi.getUserProfile();
      await SecureStore.setItemAsync('userProfile', JSON.stringify(userProfile));
      await SecureStore.setItemAsync('facilityID', userProfile.facilityID);
      return { user: userProfile, token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  },
);

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthApi.getUserProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      SecureStore.deleteItemAsync('userToken');
      SecureStore.deleteItemAsync('userProfile');
      SecureStore.deleteItemAsync('facilityID');
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.status = 'succeeded';
          state.user = action.payload.user;
          state.token = action.payload.token;
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(getUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
