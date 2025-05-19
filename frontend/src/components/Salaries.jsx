import { useState, useEffect } from 'react';
import axios from 'axios';

const Salaries = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    employeeNumber: '',
    grossSalary: '',
    totalDeduction: '',
    netSalary: '',
    month: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salariesRes, employeesRes] = await Promise.all([
          axios.get('/api/salaries'),
          axios.get('/api/employees')
        ]);
        setSalaries(salariesRes.data);
        setEmployees(employeesRes.data);
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
    
    if (name === 'grossSalary' || name === 'totalDeduction') {
      const grossSalary = name === 'grossSalary' ? parseFloat(value) || 0 : parseFloat(formData.grossSalary) || 0;
      const totalDeduction = name === 'totalDeduction' ? parseFloat(value) || 0 : parseFloat(formData.totalDeduction) || 0;
      const netSalary = Math.max(0, grossSalary - totalDeduction).toFixed(2);
      
      setFormData({
        ...formData,
        [name]: value,
        netSalary
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode) {
        // Update existing salary record
        const response = await axios.put(`/api/salaries/${formData.id}`, {
          grossSalary: formData.grossSalary,
          totalDeduction: formData.totalDeduction,
          netSalary: formData.netSalary,
          month: formData.month
        });
        
        // Update the salaries list
        setSalaries(salaries.map(salary => 
          salary.id === formData.id ? { ...salary, ...response.data.salary } : salary
        ));
      } else {
        // Create new salary record
        const response = await axios.post('/api/salaries', formData);
        
        // Add the new salary to the list
        const newSalary = response.data.salary;
        const employee = employees.find(emp => emp.employeeNumber === parseInt(newSalary.employeeNumber));
        
        setSalaries([...salaries, {
          ...newSalary,
          firstName: employee?.firstName,
          lastName: employee?.lastName,
          position: employee?.position,
          departmentName: employee?.departmentName
        }]);
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving salary record:', error);
      setError(error.response?.data?.message || 'Failed to save salary record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (salary) => {
    setFormData({
      id: salary.id,
      employeeNumber: salary.employeeNumber,
      grossSalary: salary.grossSalary,
      totalDeduction: salary.totalDeduction,
      netSalary: salary.netSalary,
      month: salary.month
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this salary record?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.delete(`/api/salaries/${id}`);
      setSalaries(salaries.filter(salary => salary.id !== id));
    } catch (error) {
      console.error('Error deleting salary record:', error);
      setError(error.response?.data?.message || 'Failed to delete salary record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      employeeNumber: '',
      grossSalary: '',
      totalDeduction: '',
      netSalary: '',
      month: ''
    });
    setEditMode(false);
    setShowForm(false);
  };

  if (loading && salaries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Salary Records</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
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
                Add Salary Record
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
                  {editMode ? 'Edit Salary Record' : 'New Salary Record'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {editMode 
                    ? 'Update the salary information for this employee.' 
                    : 'Add a new salary record to the system.'}
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-6 gap-6">
                    {!editMode && (
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="employeeNumber" className="form-label">
                          Employee
                        </label>
                        <select
                          id="employeeNumber"
                          name="employeeNumber"
                          required
                          className="form-input"
                          value={formData.employeeNumber}
                          onChange={handleChange}
                        >
                          <option value="">Select an employee</option>
                          {employees.map((employee) => (
                            <option key={employee.employeeNumber} value={employee.employeeNumber}>
                              {`${employee.firstName} ${employee.lastName} - ${employee.position}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="month" className="form-label">
                        Month (YYYY-MM)
                      </label>
                      <input
                        type="month"
                        name="month"
                        id="month"
                        required
                        className="form-input"
                        value={formData.month}
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

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="totalDeduction" className="form-label">
                        Total Deduction
                      </label>
                      <input
                        type="number"
                        name="totalDeduction"
                        id="totalDeduction"
                        required
                        min="0"
                        step="0.01"
                        className="form-input"
                        value={formData.totalDeduction}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="netSalary" className="form-label">
                        Net Salary
                      </label>
                      <input
                        type="number"
                        name="netSalary"
                        id="netSalary"
                        required
                        readOnly
                        className="form-input bg-gray-100"
                        value={formData.netSalary}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="btn-secondary mr-3"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : (editMode ? 'Update' : 'Save')}
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
                  <th scope="col">Employee</th>
                  <th scope="col">Position</th>
                  <th scope="col">Department</th>
                  <th scope="col">Month</th>
                  <th scope="col">Gross Salary</th>
                  <th scope="col">Deduction</th>
                  <th scope="col">Net Salary</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaries.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                      No salary records found. Add a new record to get started.
                    </td>
                  </tr>
                ) : (
                  salaries.map((salary) => (
                    <tr key={salary.id}>
                      <td>{salary.id}</td>
                      <td>{`${salary.firstName} ${salary.lastName}`}</td>
                      <td>{salary.position}</td>
                      <td>{salary.departmentName}</td>
                      <td>{salary.month}</td>
                      <td>${parseFloat(salary.grossSalary).toFixed(2)}</td>
                      <td>${parseFloat(salary.totalDeduction).toFixed(2)}</td>
                      <td>${parseFloat(salary.netSalary).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(salary)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(salary.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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

export default Salaries;
