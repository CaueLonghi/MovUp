/**
 * Utility functions for data formatting
 */

/**
 * Formats time in seconds to human-readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '0s';
  
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

/**
 * Formats percentage to string with specified decimal places
 * @param {number} percentage - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (percentage, decimals = 1) => {
  if (percentage === null || percentage === undefined) return '0%';
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Formats file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formats frame number with leading zeros
 * @param {number} frameNumber - Frame number
 * @param {number} digits - Number of digits (default: 6)
 * @returns {string} Formatted frame number
 */
export const formatFrameNumber = (frameNumber, digits = 6) => {
  if (!frameNumber) return '000000';
  return frameNumber.toString().padStart(digits, '0');
};

/**
 * Formats date to Brazilian format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formats severity score to percentage
 * @param {number} score - Severity score (0-1)
 * @returns {string} Formatted percentage
 */
export const formatSeverityScore = (score) => {
  if (!score || score < 0 || score > 1) return '0%';
  return formatPercentage(score * 100);
};
