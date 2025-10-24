/**
 * Utility functions for date formatting
 */

/**
 * Format date from backend to readable string
 * Backend có thể trả về date dạng:
 * - ISO string: "2025-10-23T08:27:31.123Z"
 * - Array: [2025, 10, 23, 8, 27, 31]
 * - Timestamp: 1729670851000
 */
export function formatDate(date: string | number | number[] | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    let dateObj: Date;
    
    if (Array.isArray(date)) {
      // Backend trả về array [year, month, day, hour, minute, second]
      // Month trong Java/backend là 1-indexed, nhưng JS Date là 0-indexed
      const [year, month, day, hour = 0, minute = 0, second = 0] = date;
      dateObj = new Date(year, month - 1, day, hour, minute, second);
    } else if (typeof date === 'number') {
      // Timestamp
      dateObj = new Date(date);
    } else if (typeof date === 'string') {
      // ISO string hoặc date string
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date);
      return 'Invalid date';
    }
    
    // Format date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Invalid date';
  }
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | number | number[] | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    let dateObj: Date;
    
    if (Array.isArray(date)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = date;
      dateObj = new Date(year, month - 1, day, hour, minute, second);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date);
      return 'Invalid date';
    }
    
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting datetime:', error, date);
    return 'Invalid date';
  }
}

/**
 * Format quarter from backend format to display format
 * Backend: "2025-Q1" -> Display: "Q1 2025"
 * Also handles number input: 1 -> "Q1"
 */
export function formatQuarter(quarter: string | number | null | undefined): string {
  if (!quarter && quarter !== 0) return 'N/A';
  
  try {
    // If it's a number, just format it
    if (typeof quarter === 'number') {
      return `Q${quarter}`;
    }
    
    // Convert to string if not already
    const quarterStr = String(quarter);
    
    // Handle format like "2025-Q1"
    if (quarterStr.includes('-Q')) {
      const [year, q] = quarterStr.split('-Q');
      return `Q${q} ${year}`;
    }
    
    // Already in correct format or unknown format
    return quarterStr;
  } catch (error) {
    console.warn('Error formatting quarter:', error, quarter);
    return 'N/A';
  }
}

