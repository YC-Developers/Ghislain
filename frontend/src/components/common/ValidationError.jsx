import React from 'react';

/**
 * Component to display validation errors
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {string} props.fieldId - ID of the field with error (for accessibility)
 */
const ValidationError = ({ message, fieldId }) => {
  if (!message) return null;
  
  return (
    <div className="mt-1 text-sm text-red-600" id={`${fieldId}-error`} aria-live="polite">
      {message}
    </div>
  );
};

export default ValidationError;
