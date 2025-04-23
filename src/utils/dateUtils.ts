export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const postDate = new Date(date);
  const diffTime = Math.abs(now.getTime() - postDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return '1 Day ago';
  } else if (diffDays < 7) {
    return `${diffDays} Days ago`;
  } else if (diffDays < 14) {
    return '1 Week ago';
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} Weeks ago`;
  } else if (diffDays < 60) {
    return '1 Month ago';
  } else {
    return `${Math.floor(diffDays / 30)} Months ago`;
  }
} 