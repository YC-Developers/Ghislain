import React from 'react';
import ValidationError from './ValidationError';

/**
 * Reusable form input component with validation
 * @param {Object} props
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Whether the input is required
 * @param {string} props.error - Error message
 * @param {Object} props.validation - Validation rules
 * @param {Object} props.rest - Additional props to pass to the input
 */
const FormInput = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  validation,
  ...rest
}) => {
  // Determine if the input has an error
  const hasError = !!error;
  
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`appearance-none block w-full px-3 py-2 border ${
            hasError ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none ${
            hasError
              ? 'focus:ring-red-500 focus:border-red-500'
              : 'focus:ring-blue-500 focus:border-blue-500'
          } sm:text-sm`}
          {...rest}
        />
      </div>
      <ValidationError message={error} fieldId={id} />
    </div>
  );
};

export default FormInput;
