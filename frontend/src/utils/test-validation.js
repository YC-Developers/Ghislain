/**
 * Test script for validation and logging
 * Run this in the browser console to test validation functions
 */

import * as validators from './validation';
import * as logger from './logger';

// Test validation functions
const runValidationTests = () => {
  console.group('Running validation tests...');
  
  // Test string validation
  console.group('String validation');
  console.log('Empty string:', validators.isValidString(''));
  console.log('Short string:', validators.isValidString('a', 2));
  console.log('Valid string:', validators.isValidString('Hello'));
  console.log('Long string:', validators.isValidString('a'.repeat(300), 1, 255));
  console.groupEnd();
  
  // Test email validation
  console.group('Email validation');
  console.log('Empty email:', validators.isValidEmail(''));
  console.log('Invalid email (no @):', validators.isValidEmail('test.com'));
  console.log('Invalid email (no domain):', validators.isValidEmail('test@'));
  console.log('Valid email:', validators.isValidEmail('test@example.com'));
  console.groupEnd();
  
  // Test phone validation
  console.group('Phone validation');
  console.log('Empty phone:', validators.isValidPhone(''));
  console.log('Invalid phone (letters):', validators.isValidPhone('123abc'));
  console.log('Valid phone (simple):', validators.isValidPhone('1234567890'));
  console.log('Valid phone (formatted):', validators.isValidPhone('+1 (123) 456-7890'));
  console.groupEnd();
  
  // Test number validation
  console.group('Number validation');
  console.log('Empty number:', validators.isValidNumber(''));
  console.log('Invalid number (letters):', validators.isValidNumber('123abc'));
  console.log('Valid number:', validators.isValidNumber('123'));
  console.log('Valid number (decimal):', validators.isValidNumber('123.45'));
  console.log('Number below min:', validators.isValidNumber('5', 10));
  console.log('Number above max:', validators.isValidNumber('15', 0, 10));
  console.groupEnd();
  
  // Test date validation
  console.group('Date validation');
  console.log('Empty date:', validators.isValidDate(''));
  console.log('Invalid date format:', validators.isValidDate('01/01/2023'));
  console.log('Invalid date (non-existent):', validators.isValidDate('2023-02-31'));
  console.log('Valid date:', validators.isValidDate('2023-01-01'));
  console.groupEnd();
  
  // Test month validation
  console.group('Month validation');
  console.log('Empty month:', validators.isValidMonth(''));
  console.log('Invalid month format:', validators.isValidMonth('01/2023'));
  console.log('Invalid month (out of range):', validators.isValidMonth('2023-13'));
  console.log('Valid month:', validators.isValidMonth('2023-01'));
  console.groupEnd();
  
  // Test department code validation
  console.group('Department code validation');
  console.log('Empty code:', validators.isValidDepartmentCode(''));
  console.log('Invalid code (special chars):', validators.isValidDepartmentCode('IT@DEPT'));
  console.log('Invalid code (too long):', validators.isValidDepartmentCode('IT_DEPARTMENT_LONG'));
  console.log('Valid code:', validators.isValidDepartmentCode('IT_DEPT'));
  console.groupEnd();
  
  // Test decimal validation
  console.group('Decimal validation');
  console.log('Empty decimal:', validators.isValidDecimal(''));
  console.log('Invalid decimal (letters):', validators.isValidDecimal('123.45abc'));
  console.log('Valid decimal:', validators.isValidDecimal('123.45'));
  console.log('Decimal with too many places:', validators.isValidDecimal('123.456', 0, null, 2));
  console.log('Negative decimal:', validators.isValidDecimal('-123.45'));
  console.groupEnd();
  
  console.groupEnd();
};

// Test logger functions
const runLoggerTests = () => {
  console.group('Running logger tests...');
  
  // Test debug logging
  logger.debug('This is a debug message', { context: 'test' });
  
  // Test info logging
  logger.info('This is an info message', { context: 'test' });
  
  // Test warning logging
  logger.warn('This is a warning message', { context: 'test' });
  
  // Test error logging
  logger.error('This is an error message', new Error('Test error'), { context: 'test' });
  
  // Test validation error logging
  logger.validationError('testField', 'invalid value', 'This field is invalid', { formData: { testField: 'invalid value' } });
  
  // Test API error logging
  logger.apiError('/api/test', 'GET', new Error('API error'), { requestData: { id: 123 } });
  
  console.groupEnd();
};

// Export test functions
export const runTests = () => {
  console.group('Validation and Logger Tests');
  runValidationTests();
  runLoggerTests();
  console.groupEnd();
};

export default runTests;
