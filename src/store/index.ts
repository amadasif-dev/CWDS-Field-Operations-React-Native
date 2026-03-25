import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import jobsReducer from './slices/jobsSlice';
import attendanceReducer from './slices/attendanceSlice';
import inspectionReducer from './slices/inspectionSlice';
import appReducer from './slices/appSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    attendance: attendanceReducer,
    inspection: inspectionReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['attendance/setSignature', 'inspection/addOverviewPhoto'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
