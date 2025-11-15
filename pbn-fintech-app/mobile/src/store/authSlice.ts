import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, STORAGE_KEYS } from '../api';
import { User, LoginPayload, VerifySMSPayload } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

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
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      if (response.success && response.data) {
        // Save user data to AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        return response.data;
      }
      return rejectWithValue(response.message || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const verifySMS = createAsyncThunk(
  'auth/verify',
  async (payload: VerifySMSPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.verify(payload);
      if (response.success && response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        return response.data;
      }
      return rejectWithValue(response.message || 'Verification failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Verification failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        return { user, token };
      }
      return rejectWithValue('No stored auth data');
    } catch (error) {
      return rejectWithValue('Failed to load stored auth');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authApi.logout();
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
        return response.data;
      }
      return rejectWithValue('Failed to fetch profile');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify SMS
    builder
      .addCase(verifySMS.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifySMS.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(verifySMS.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load stored auth
    builder
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      return initialState;
    });

    // Fetch profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
