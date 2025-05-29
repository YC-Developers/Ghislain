/**
 * Validation utility functions for the Employee Management System
 */

// String validation
export const isValidString = (value, minLength = 1, maxLength = 255) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

// Email validation
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.trim().length >= 7;
};

// Number validation
export const isValidNumber = (value, min = null, max = null) => {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

// Integer validation
export const isValidInteger = (value, min = null, max = null) => {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

// Date validation (YYYY-MM-DD)
export const isValidDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  
  // Check format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  
  // Check if the date string matches the parsed date
  // This ensures values like "2023-02-31" are rejected
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` === dateStr;
};

// Month validation (YYYY-MM)
export const isValidMonth = (monthStr) => {
  if (!monthStr || typeof monthStr !== 'string') return false;
  
  // Check format
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(monthStr)) return false;
  
  // Check if it's a valid month
  const [year, month] = monthStr.split('-').map(Number);
  return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
};

// Department code validation
export const isValidDepartmentCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  // Allow alphanumeric characters and underscores, 2-10 characters
  const codeRegex = /^[A-Za-z0-9_]{2,10}$/;
  return codeRegex.test(code);
};

// Gender validation
export const isValidGender = (gender) => {
  if (!gender || typeof gender !== 'string') return false;
  const validGenders = ['Male', 'Female', 'Other'];
  return validGenders.includes(gender);
};

// Decimal validation (for money)
export const isValidDecimal = (value, min = 0, max = null, precision = 2) => {
  if (value === null || value === undefined) return false;
  
  // Convert to number and check if it's valid
  const num = Number(value);
  if (isNaN(num)) return false;
  
  // Check range
  if (num < min) return false;
  if (max !== null && num > max) return false;
  
  // Check precision (number of decimal places)
  const decimalStr = num.toString();
  const decimalParts = decimalStr.split('.');
  if (decimalParts.length > 1 && decimalParts[1].length > precision) {
    return false;
  }
  
  return true;
};

/**
 * Validation logger - logs validation errors to console and returns error messages
 * @param {Object} data - The data to validate
 * @param {Object} validations - Object with field names as keys and validation functions as values
 * @returns {Object} - Object with isValid flag and errors object
 */
export const validateAndLog = (data, validations) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, validation] of Object.entries(validations)) {
    const { isValid: fieldValid, message } = validation(data[field]);
    
    if (!fieldValid) {
      errors[field] = message;
      isValid = false;
      console.error(`Validation error for ${field}: ${message}`, { value: data[field] });
    }
  }
  
  if (!isValid) {
    console.error('Form validation failed:', errors);
  }
  
  return { isValid, errors };
};
