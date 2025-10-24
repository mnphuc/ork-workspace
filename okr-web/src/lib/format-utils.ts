/**
 * Utility functions for formatting text
 */

/**
 * Format status text from backend format to display format
 * Backend: "NOT_STARTED", "ON_TRACK", "AT_RISK", etc.
 * Display: "Not Started", "On Track", "At Risk", etc.
 */
export function formatStatus(status: string): string {
  if (!status) return '';
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get CSS classes for status badge
 */
export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'not_started': return 'bg-gray-100 text-gray-800';
    case 'at_risk': return 'bg-red-100 text-red-800';
    case 'behind': return 'bg-yellow-100 text-yellow-800';
    case 'on_track': return 'bg-green-100 text-green-800';
    case 'closed': return 'bg-blue-100 text-blue-800';
    case 'abandoned': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

