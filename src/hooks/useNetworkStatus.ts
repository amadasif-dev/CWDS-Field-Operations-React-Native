import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../store';
import { setOnlineStatus } from '../store/slices/appSlice';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const dispatch = useAppDispatch();

  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setIsOnline(true);
      dispatch(setOnlineStatus(true));
    } catch {
      setIsOnline(false);
      dispatch(setOnlineStatus(false));
    }
  }, [dispatch]);

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000);
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  return { isOnline, checkConnectivity };
};
