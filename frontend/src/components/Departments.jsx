import { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [editMode, setEditMode] = useState(false);

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
        // Update existing department
        const response = await axios.put(`/api/departments/${formData.departmentCode}`, formData);
        setDepartments(departments.map(dept =>
          dept.departmentCode === formData.departmentCode ? response.data.department : dept
        ));
      } else {
        // Create new department
        const response = await axios.post('/api/departments', formData);
        setDepartments([...departments, response.data.department]);
      }

      resetForm();
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} department:`, error);
      setError(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} department. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setFormData({
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      grossSalary: department.grossSalary
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (departmentCode) => {
    if (!confirm('Are you sure you want to delete this department?')) {
      return;
    }

    setLoading(true);

    try {
      await axios.delete(`/api/departments/${departmentCode}`);
      setDepartments(departments.filter(dept => dept.departmentCode !== departmentCode));
    } catch (error) {
      console.error('Error deleting department:', error);
      setError(error.response?.data?.message || 'Failed to delete department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      departmentCode: '',
      departmentName: '',
      grossSalary: ''
    });
    setEditMode(false);
    setShowForm(false);
  };

  if (loading && departments.length === 0) {
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
          <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
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
                  {editMode ? 'Edit Department' : 'Department Information'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {editMode
                    ? 'Update the department information.'
                    : 'Add a new department to the system.'}
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="departmentCode" className="form-label">
                        Department Code
                      </label>
                      <input
                        type="text"
                        name="departmentCode"
                        id="departmentCode"
                        required
                        className="form-input"
                        value={formData.departmentCode}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="departmentName" className="form-label">
                        Department Name
                      </label>
                      <input
                        type="text"
                        name="departmentName"
                        id="departmentName"
                        required
                        className="form-input"
                        value={formData.departmentName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="grossSalary" className="form-label">
                        Gross Salary
                      </label>
                      <input
                        type="number"
                        name="grossSalary"
                        id="grossSalary"
                        required
                        min="0"
                        step="0.01"
                        className="form-input"
                        value={formData.grossSalary}
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
                  <th scope="col">Department Code</th>
                  <th scope="col">Department Name</th>
                  <th scope="col">Gross Salary</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No departments found. Add a new department to get started.
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department.departmentCode}>
                      <td>{department.departmentCode}</td>
                      <td>{department.departmentName}</td>
                      <td>{parseFloat(department.grossSalary).toFixed(2)} RWF</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(department)}
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
                          onClick={() => handleDelete(department.departmentCode)}
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

export default Departments;
