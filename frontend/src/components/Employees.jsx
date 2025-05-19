import { useState, useEffect } from 'react';
import axios from 'axios';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeNumber: null,
    firstName: '',
    lastName: '',
    position: '',
    address: '',
    telephone: '',
    gender: '',
    hiredDate: '',
    departmentCode: ''
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, departmentsRes] = await Promise.all([
          axios.get('/api/employees'),
          axios.get('/api/departments')
        ]);
        setEmployees(employeesRes.data);
        setDepartments(departmentsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode) {
        // Update existing employee
        const response = await axios.put(`/api/employees/${formData.employeeNumber}`, formData);
        setEmployees(employees.map(emp =>
          emp.employeeNumber === formData.employeeNumber ? response.data.employee : emp
        ));
      } else {
        // Create new employee
        const response = await axios.post('/api/employees', formData);
        setEmployees([...employees, response.data.employee]);
      }

      resetForm();
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} employee:`, error);
      setError(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} employee. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      employeeNumber: employee.employeeNumber,
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      address: employee.address || '',
      telephone: employee.telephone || '',
      gender: employee.gender || '',
      hiredDate: employee.hiredDate ? employee.hiredDate.split('T')[0] : '',
      departmentCode: employee.departmentCode
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (employeeNumber) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    setLoading(true);

    try {
      await axios.delete(`/api/employees/${employeeNumber}`);
      setEmployees(employees.filter(emp => emp.employeeNumber !== employeeNumber));
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError(error.response?.data?.message || 'Failed to delete employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeNumber: null,
      firstName: '',
      lastName: '',
      position: '',
      address: '',
      telephone: '',
      gender: '',
      hiredDate: '',
      departmentCode: ''
    });
    setEditMode(false);
    setShowForm(false);
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-darkred-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <button
            onClick={() => {
              if (showForm && !editMode) {
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
                Add Employee
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
                  {editMode ? 'Edit Employee' : 'Employee Information'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {editMode
                    ? 'Update the employee information.'
                    : 'Add a new employee to the system.'}
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="firstName" className="form-label">
                        First name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        required
                        className="form-input"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="lastName" className="form-label">
                        Last name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        required
                        className="form-input"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="position" className="form-label">
                        Position
                      </label>
                      <input
                        type="text"
                        name="position"
                        id="position"
                        required
                        className="form-input"
                        value={formData.position}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="departmentCode" className="form-label">
                        Department
                      </label>
                      <select
                        id="departmentCode"
                        name="departmentCode"
                        required
                        className="form-input"
                        value={formData.departmentCode}
                        onChange={handleChange}
                      >
                        <option value="">Select a department</option>
                        {departments.map((dept) => (
                          <option key={dept.departmentCode} value={dept.departmentCode}>
                            {dept.departmentName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="address" className="form-label">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        className="form-input"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="telephone" className="form-label">
                        Telephone
                      </label>
                      <input
                        type="text"
                        name="telephone"
                        id="telephone"
                        className="form-input"
                        value={formData.telephone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="gender" className="form-label">
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        className="form-input"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="hiredDate" className="form-label">
                        Hired Date
                      </label>
                      <input
                        type="date"
                        name="hiredDate"
                        id="hiredDate"
                        className="form-input"
                        value={formData.hiredDate}
                        onChange={handleChange}
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
                      {loading ? 'Saving...' : editMode ? 'Update' : 'Save'}
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
                  <th scope="col">ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Position</th>
                  <th scope="col">Department</th>
                  <th scope="col">Telephone</th>
                  <th scope="col">Gender</th>
                  <th scope="col">Hired Date</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No employees found. Add a new employee to get started.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.employeeNumber}>
                      <td>{employee.employeeNumber}</td>
                      <td>{`${employee.firstName} ${employee.lastName}`}</td>
                      <td>{employee.position}</td>
                      <td>{employee.departmentName}</td>
                      <td>{employee.telephone || '-'}</td>
                      <td>{employee.gender || '-'}</td>
                      <td>
                        {employee.hiredDate
                          ? new Date(employee.hiredDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-darkred-600 hover:text-darkred-900 mr-4 transition-colors duration-200"
                        >
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(employee.employeeNumber)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </span>
                        </button>
                      </td>
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

export default Employees;
