import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isOnline: boolean;
  isAppReady: boolean;
  unreadNotifications: number;
}

const initialState: AppState = {
  isOnline: true,
  isAppReady: false,
  unreadNotifications: 0,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setAppReady: (state, action: PayloadAction<boolean>) => {
      state.isAppReady = action.payload;
    },
    setUnreadNotifications: (state, action: PayloadAction<number>) => {
      state.unreadNotifications = action.payload;
    },
  },
});

export const { setOnlineStatus, setAppReady, setUnreadNotifications } =
  appSlice.actions;
export default appSlice.reducer;
