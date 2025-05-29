/**
 * Logger utility for the Employee Management System
 * Centralizes logging and provides consistent formatting
 */

// Log levels
const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

// Current environment
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Format log message with timestamp and additional context
 */
const formatLogMessage = (message, context = {}) => {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    message,
    ...context
  };
};

/**
 * Log a debug message (only in development)
 */
export const debug = (message, context = {}) => {
  if (isDevelopment) {
    const formattedMessage = formatLogMessage(message, context);
    console.debug('[DEBUG]', formattedMessage);
  }
};

/**
 * Log an info message
 */
export const info = (message, context = {}) => {
  const formattedMessage = formatLogMessage(message, context);
  console.info('[INFO]', formattedMessage);
};

/**
 * Log a warning message
 */
export const warn = (message, context = {}) => {
  const formattedMessage = formatLogMessage(message, context);
  console.warn('[WARNING]', formattedMessage);
};

/**
 * Log an error message
 */
export const error = (message, error = null, context = {}) => {
  const formattedMessage = formatLogMessage(message, {
    ...context,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined
    } : undefined
  });
  console.error('[ERROR]', formattedMessage);
};

/**
 * Log a validation error
 */
export const validationError = (fieldName, value, message, formData = {}) => {
  error(`Validation error for field: ${fieldName}`, null, {
    field: fieldName,
    value,
    message,
    formData: isDevelopment ? formData : undefined
  });
};

/**
 * Log an API error
 */
export const apiError = (endpoint, method, errorObj, requestData = {}) => {
  let errorMessage = 'API request failed';
  let errorDetails = {};
  
  if (errorObj.response) {
    // The server responded with an error status code
    errorMessage = `API error: ${errorObj.response.status} ${errorObj.response.statusText}`;
    errorDetails = {
      status: errorObj.response.status,
      statusText: errorObj.response.statusText,
      data: errorObj.response.data,
      headers: isDevelopment ? errorObj.response.headers : undefined
    };
  } else if (errorObj.request) {
    // The request was made but no response was received
    errorMessage = 'Network error: No response received';
    errorDetails = {
      request: isDevelopment ? errorObj.request : 'Request sent but no response received'
    };
  } else {
    // Something happened in setting up the request
    errorMessage = `Request setup error: ${errorObj.message}`;
  }
  
  error(errorMessage, errorObj, {
    endpoint,
    method,
    requestData: isDevelopment ? requestData : undefined,
    ...errorDetails
  });
};

export default {
  debug,
  info,
  warn,
  error,
  validationError,
  apiError,
  LOG_LEVELS
};
