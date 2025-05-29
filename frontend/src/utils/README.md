# Frontend Validation and Logging System

This directory contains utilities for form validation and error logging in the Employee Management System.

## Validation

The `validation.js` file provides functions for validating different types of input:

- `isValidString`: Validates string length
- `isValidEmail`: Validates email format
- `isValidPhone`: Validates phone number format
- `isValidNumber`: Validates numeric values with optional min/max
- `isValidInteger`: Validates integer values with optional min/max
- `isValidDate`: Validates date in YYYY-MM-DD format
- `isValidMonth`: Validates month in YYYY-MM format
- `isValidDepartmentCode`: Validates department code format
- `isValidGender`: Validates gender values
- `isValidDecimal`: Validates decimal values with precision control

### Usage Example

```jsx
import * as validators from '../utils/validation';

// Validate a string
const isValid = validators.isValidString(value, 2, 100);

// Validate a department code
const isValidCode = validators.isValidDepartmentCode(code);

// Validate a decimal value (e.g., money)
const isValidAmount = validators.isValidDecimal(amount, 0, 1000000, 2);
```

## Logging

The `logger.js` file provides functions for consistent logging:

- `debug`: Log debug messages (only in development)
- `info`: Log informational messages
- `warn`: Log warning messages
- `error`: Log error messages with stack trace
- `validationError`: Log validation errors with field context
- `apiError`: Log API errors with request details

### Usage Example

```jsx
import * as logger from '../utils/logger';

// Log a validation error
logger.validationError('departmentCode', value, 'Invalid department code', formData);

// Log an API error
logger.apiError('/api/departments', 'POST', error, formData);

// Log general information
logger.info('Department created successfully', { department });
```

## Form Components

The common components directory includes reusable form components with built-in validation:

- `FormInput.jsx`: Input component with validation display
- `ValidationError.jsx`: Component to display validation errors

### Usage Example

```jsx
import FormInput from './common/FormInput';

// In your component render
<FormInput
  id="departmentCode"
  name="departmentCode"
  label="Department Code"
  type="text"
  required
  value={formData.departmentCode}
  onChange={handleChange}
  error={validationErrors.departmentCode}
  placeholder="e.g. IT_DEPT"
/>
```

## Testing Validation and Logging

You can test the validation and logging functions using the `test-validation.js` script:

1. Open your browser console
2. Import the test script:
   ```js
   import runTests from './utils/test-validation';
   ```
3. Run the tests:
   ```js
   runTests();
   ```

This will run a series of tests on all validation functions and log the results to the console.

## Best Practices

1. **Always validate user input** before submission
2. **Log validation errors** to help with debugging
3. **Use the FormInput component** for consistent validation display
4. **Check the browser console** for validation and error logs
5. **Add detailed context** to error logs to aid debugging
