import { useState, useEffect } from 'react';
import axios from 'axios';
import FormInput from './common/FormInput';
import * as logger from '../utils/logger';
import * as validators from '../utils/validation';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    departmentCode: '',
    departmentName: '',
    grossSalary: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setError('Failed to load departments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'departmentCode':
        if (!validators.isValidDepartmentCode(value)) {
          error = 'Department code must be 2-10 alphanumeric characters or underscores';
          logger.validationError('departmentCode', value, error, formData);
        }
        break;
      case 'departmentName':
        if (!validators.isValidString(value, 2, 100)) {
          error = 'Department name must be between 2 and 100 characters';
          logger.validationError('departmentName', value, error, formData);
        }
        break;
      case 'grossSalary':
        if (!validators.isValidDecimal(value, 0, 1000000, 2)) {
          error = 'Gross salary must be a positive number with up to 2 decimal places';
          logger.validationError('grossSalary', value, error, formData);
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate the field
    const error = validateField(name, value);

    // Update validation errors
    setValidationErrors({
      ...validationErrors,
      [name]: error
    });
  };

  const validateForm = () => {
    // Validate all fields
    const errors = {
      departmentCode: validateField('departmentCode', formData.departmentCode),
      departmentName: validateField('departmentName', formData.departmentName),
      grossSalary: validateField('grossSalary', formData.grossSalary)
    };

    setValidationErrors(errors);

    // Check if there are any errors
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields before submission
    if (!validateForm()) {
      logger.error('Form validation failed', null, { validationErrors, formData });
      setError('Please fix the validation errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      // Create new department
      logger.info('Creating new department', { formData });
      const response = await axios.post('/api/departments', formData);
      setDepartments([...departments, response.data.department]);
      logger.info('Department created successfully', { department: response.data.department });

      resetForm();
    } catch (error) {
      logger.apiError('/api/departments', 'POST', error, formData);
      setError(error.response?.data?.message || 'Failed to create department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Removed edit and delete functionality as per requirements

  const resetForm = () => {
    setFormData({
      departmentCode: '',
      departmentName: '',
      grossSalary: ''
    });
    setValidationErrors({});
    setError('');
    setShowForm(false);
    logger.debug('Form reset');
  };

  if (loading && departments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
              } else {
                resetForm();
                setShowForm(!showForm);
              }
            }}
            className="btn-primary flex items-center"
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Department
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {showForm && (
          <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Department Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add a new department to the system.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
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
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormInput
                        id="departmentName"
                        name="departmentName"
                        label="Department Name"
                        type="text"
                        required
                        value={formData.departmentName}
                        onChange={handleChange}
                        error={validationErrors.departmentName}
                        placeholder="e.g. Information Technology"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormInput
                        id="grossSalary"
                        name="grossSalary"
                        label="Gross Salary"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.grossSalary}
                        onChange={handleChange}
                        error={validationErrors.grossSalary}
                        placeholder="e.g. 50000.00"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="btn-secondary mr-3"
                      onClick={() => resetForm()}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Department Code</th>
                  <th scope="col">Department Name</th>
                  <th scope="col">Gross Salary</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      No departments found. Add a new department to get started.
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department.departmentCode}>
                      <td>{department.departmentCode}</td>
                      <td>{department.departmentName}</td>
                      <td>{parseFloat(department.grossSalary).toFixed(2)} RWF</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Departments;
