import { Platform, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export { SCREEN_WIDTH, SCREEN_HEIGHT };

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateStr: string): string => {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
};

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: '#D4A843',
    assigned: '#0EA5E9',
    in_progress: '#1A5FB4',
    completed: '#16A34A',
    on_hold: '#6B7A95',
    cancelled: '#DC2626',
    draft: '#6B7A95',
    submitted: '#16A34A',
    approved: '#16A34A',
  };
  return map[status] ?? '#6B7A95';
};

export const getPriorityColor = (priority: string): string => {
  const map: Record<string, string> = {
    low: '#16A34A',
    medium: '#D4A843',
    high: '#DC2626',
    urgent: '#DC2626',
  };
  return map[priority] ?? '#6B7A95';
};

export const capitalize = (str: string): string => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
