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

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return 'Unknown date';
  }
};