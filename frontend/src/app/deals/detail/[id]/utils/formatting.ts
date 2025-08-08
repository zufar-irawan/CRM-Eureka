// utils/formatting.ts - Formatting utility functions

export const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const getFirstChar = (value: any, fallback: string = ''): string => {
  const str = safeString(value);
  return str.length > 0 ? str.charAt(0).toUpperCase() : fallback;
};

export const displayValue = (value: any, fallback: string = 'Not specified'): string => {
  const str = safeString(value);
  return str.length > 0 ? str : fallback;
};

export const formatCurrency = (value: any, currency: string = 'USD'): string => {
  const num = parseFloat(String(value || 0));
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatPercentage = (value: any): string => {
  const num = parseFloat(String(value || 0));
  return `${num.toFixed(0)}%`;
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTimeAgo = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  
  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  
  return formatDate(dateString);
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

export const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  
  const diffInSeconds = (date.getTime() - now.getTime()) / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;
  const diffInDays = diffInHours / 24;
  
  if (Math.abs(diffInDays) > 1) {
    return rtf.format(Math.round(diffInDays), 'day');
  } else if (Math.abs(diffInHours) > 1) {
    return rtf.format(Math.round(diffInHours), 'hour');
  } else {
    return rtf.format(Math.round(diffInMinutes), 'minute');
  }
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  // Simple phone formatting - can be enhanced based on requirements
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }
  return phone;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};