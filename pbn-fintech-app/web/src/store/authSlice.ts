import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, VerifyPhoneResponse } from '../api/auth';
import { User, AuthState } from '../types';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (phoneNumber: string) => {
    const response = await authApi.login(phoneNumber);
    return response;
  }
);

export const verifyPhone = createAsyncThunk(
  'auth/verifyPhone',
  async ({ phoneNumber, code }: { phoneNumber: string; code: string }) => {
    const response = await authApi.verifyPhone(phoneNumber, code);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ fullName, phoneNumber }: { fullName: string; phoneNumber: string }) => {
    const response = await authApi.register(fullName, phoneNumber);
    return response;
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadFromStorage',
  async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return { token, user };
    }
    throw new Error('No stored credentials');
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authApi.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Login failed';
    });

    // Verify phone
    builder.addCase(verifyPhone.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyPhone.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(verifyPhone.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Verification failed';
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Registration failed';
    });

    // Load from storage
    builder.addCase(loadUserFromStorage.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
