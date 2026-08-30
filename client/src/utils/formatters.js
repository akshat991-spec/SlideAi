import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '';
  try {
    return format(new Date(date), fmt);
  } catch {
    return '';
  }
};

export const truncate = (str, length = 60) => {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '…' : str;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const statusColor = (status) => {
  switch (status) {
    case 'completed':  return 'text-green-600 bg-green-50';
    case 'generating': return 'text-primary-600 bg-primary-50';
    case 'failed':     return 'text-red-600 bg-red-50';
    case 'draft':      return 'text-gray-600 bg-gray-100';
    default:           return 'text-gray-600 bg-gray-100';
  }
};

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};
