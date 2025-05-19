import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Reports = () => {
  const [month, setMonth] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReport, setShowReport] = useState(false);
  const printRef = useRef();

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const generateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowReport(false);

    try {
      const response = await axios.get(`/api/reports/monthly/${month}`);
      setReportData(response.data.reportData);
      setShowReport(true);
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.response?.data?.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <html>
        <head>
          <title>Monthly Payroll Report - ${month}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1, h2 { text-align: center; }
            .report-header { margin-bottom: 20px; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
  };

  const calculateTotals = () => {
    return reportData.reduce(
      (totals, record) => {
        return {
          grossSalary: totals.grossSalary + parseFloat(record.grossSalary),
          totalDeduction: totals.totalDeduction + parseFloat(record.totalDeduction),
          netSalary: totals.netSalary + parseFloat(record.netSalary)
        };
      },
      { grossSalary: 0, totalDeduction: 0, netSalary: 0 }
    );
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Monthly Payroll Reports</h1>
        
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <form onSubmit={generateReport}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="month" className="form-label">
                  Select Month
                </label>
                <input
                  type="month"
                  id="month"
                  name="month"
                  required
                  className="form-input"
                  value={month}
                  onChange={handleMonthChange}
                />
              </div>
            </div>
            <div className="mt-6 flex">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {showReport && reportData.length > 0 && (
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payroll Report for {month}
                  </h2>
                  <button
                    onClick={handlePrint}
                    className="btn-primary flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                  </button>
                </div>

                <div ref={printRef}>
                  <div className="report-header">
                    <h1 className="text-2xl font-bold text-center">Employee Payroll Management System</h1>
                    <h2 className="text-xl font-semibold text-center text-gray-700 mt-2">
                      Monthly Payroll Report - {month}
                    </h2>
                  </div>

                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th scope="col">Employee Name</th>
                          <th scope="col">Position</th>
                          <th scope="col">Department</th>
                          <th scope="col">Gross Salary</th>
                          <th scope="col">Deduction</th>
                          <th scope="col">Net Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((record, index) => (
                          <tr key={index}>
                            <td>{`${record.firstName} ${record.lastName}`}</td>
                            <td>{record.position}</td>
                            <td>{record.departmentName}</td>
                            <td className="text-right">${parseFloat(record.grossSalary).toFixed(2)}</td>
                            <td className="text-right">${parseFloat(record.totalDeduction).toFixed(2)}</td>
                            <td className="text-right">${parseFloat(record.netSalary).toFixed(2)}</td>
                          </tr>
                        ))}
                        {/* Summary row */}
                        {reportData.length > 0 && (
                          <tr className="font-bold bg-gray-100">
                            <td colSpan="3" className="text-right">Total:</td>
                            <td className="text-right">${calculateTotals().grossSalary.toFixed(2)}</td>
                            <td className="text-right">${calculateTotals().totalDeduction.toFixed(2)}</td>
                            <td className="text-right">${calculateTotals().netSalary.toFixed(2)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 text-sm text-gray-500">
                    <p>Report generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showReport && reportData.length === 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">No data!</strong>
            <span className="block sm:inline"> No salary records found for the selected month.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
