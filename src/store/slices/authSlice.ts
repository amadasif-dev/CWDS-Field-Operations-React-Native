import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../api';
import type { User } from '../../types/models';
import type { LoginRequest } from '../../types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginRequest, { rejectWithValue }) => {
    try {
      // TODO: Uncomment when API is ready
      // const response = await authService.login(payload);
      // const user: User = {
      //   ...response.data.user,
      //   role: response.data.user.role as User['role'],
      //   token: response.data.token,
      //   refreshToken: response.data.refreshToken,
      // };

      // Mock user for development
      const user: User = {
        id: 'dev-001',
        name: 'Dev Technician',
        email: payload.email,
        phone: '555-0100',
        role: 'technician',
        token: 'mock-token-dev',
        refreshToken: 'mock-refresh-dev',
      };

      await AsyncStorage.setItem('auth_token', user.token);
      await AsyncStorage.setItem('refresh_token', user.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch {
    // Logout even if API fails
  }
  await AsyncStorage.removeItem('auth_token');
  await AsyncStorage.removeItem('refresh_token');
  await AsyncStorage.removeItem('user');
});

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async () => {
    const userJson = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('auth_token');
    if (userJson && token) {
      return JSON.parse(userJson) as User;
    }
    return null;
  },
);

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
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Restore session
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isInitialized = true;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
