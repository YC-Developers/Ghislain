const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Validation helper functions
const validators = {
  // String validation
  isValidString: (value, minLength = 1, maxLength = 255) => {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  },

  // Email validation
  isValidEmail: (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone number validation
  isValidPhone: (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    // Allow digits, spaces, dashes, parentheses, and plus sign
    const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
    return phoneRegex.test(phone) && phone.trim().length >= 7;
  },

  // Number validation
  isValidNumber: (value, min = null, max = null) => {
    if (value === null || value === undefined) return false;
    const num = Number(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
  },

  // Integer validation
  isValidInteger: (value, min = null, max = null) => {
    if (value === null || value === undefined) return false;
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
  },

  // Date validation (YYYY-MM-DD)
  isValidDate: (dateStr) => {
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
  },

  // Month validation (YYYY-MM)
  isValidMonth: (monthStr) => {
    if (!monthStr || typeof monthStr !== 'string') return false;

    // Check format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(monthStr)) return false;

    // Check if it's a valid month
    const [year, month] = monthStr.split('-').map(Number);
    return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
  },

  // Department code validation
  isValidDepartmentCode: (code) => {
    if (!code || typeof code !== 'string') return false;
    // Allow alphanumeric characters and underscores, 2-10 characters
    const codeRegex = /^[A-Za-z0-9_]{2,10}$/;
    return codeRegex.test(code);
  },

  // Gender validation
  isValidGender: (gender) => {
    if (!gender || typeof gender !== 'string') return false;
    const validGenders = ['Male', 'Female', 'Other'];
    return validGenders.includes(gender);
  },

  // Decimal validation (for money)
  isValidDecimal: (value, min = 0, max = null, precision = 2) => {
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
  }
};

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // React app's possible addresses
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'epms_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'EPMS'
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');

  // Create database if it doesn't exist
  db.query('CREATE DATABASE IF NOT EXISTS EPMS', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }

    console.log('Database EPMS created or already exists');

    // Use the EPMS database
    db.query('USE EPMS', (err) => {
      if (err) {
        console.error('Error using EPMS database:', err);
        return;
      }

      // Create Users table (admin only)
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin') NOT NULL DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create Department table
      const createDepartmentTable = `
        CREATE TABLE IF NOT EXISTS department (
          departmentCode VARCHAR(10) PRIMARY KEY,
          departmentName VARCHAR(100) NOT NULL,
          grossSalary DECIMAL(10, 2) NOT NULL
        )
      `;

      // Create Employee table
      const createEmployeeTable = `
        CREATE TABLE IF NOT EXISTS employee (
          employeeNumber INT AUTO_INCREMENT PRIMARY KEY,
          firstName VARCHAR(50) NOT NULL,
          lastName VARCHAR(50) NOT NULL,
          position VARCHAR(100) NOT NULL,
          address VARCHAR(255),
          telephone VARCHAR(20),
          gender ENUM('Male', 'Female', 'Other'),
          hiredDate DATE,
          departmentCode VARCHAR(10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (departmentCode) REFERENCES department(departmentCode) ON DELETE SET NULL
        )
      `;

      // Create Salary table
      const createSalaryTable = `
        CREATE TABLE IF NOT EXISTS salary (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employeeNumber INT NOT NULL,
          grossSalary DECIMAL(10, 2) NOT NULL,
          totalDeduction DECIMAL(10, 2) NOT NULL,
          netSalary DECIMAL(10, 2) NOT NULL,
          month VARCHAR(7) NOT NULL, /* Format: YYYY-MM */
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (employeeNumber) REFERENCES employee(employeeNumber) ON DELETE CASCADE
        )
      `;

      // Execute table creation queries in the correct order (Department first, then Employee, then Salary)
      db.query(createUsersTable, (err) => {
        if (err) console.error('Error creating users table:', err);
        else console.log('Users table created or already exists');
      });

      db.query(createDepartmentTable, (err) => {
        if (err) console.error('Error creating department table:', err);
        else {
          console.log('Department table created or already exists');

          db.query(createEmployeeTable, (err) => {
            if (err) console.error('Error creating employee table:', err);
            else {
              console.log('Employee table created or already exists');

              db.query(createSalaryTable, (err) => {
                if (err) console.error('Error creating salary table:', err);
                else console.log('Salary table created or already exists');
              });
            }
          });
        }
      });

      // Check if any admin user exists
      const checkAdminQuery = "SELECT * FROM users";
      db.query(checkAdminQuery, (err, results) => {
        if (err) {
          console.error('Error checking for admin users:', err);
          return;
        }

        if (results.length === 0) {
          console.log('No admin users found. System will start with registration page.');
        } else {
          console.log('Admin user already exists. Registration is disabled.');
        }
      });
    });
  });
});

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Please login' });
};

// API Routes

// Health check endpoint
app.get('/', (_, res) => {
  res.json({ status: 'ok', message: 'Employee Payroll Management System API is running' });
});

// Auth Routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Set user session
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });
});

app.get('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/check-auth', (req, res) => {
  if (req.session.user) {
    return res.json({
      isAuthenticated: true,
      user: req.session.user
    });
  }
  res.json({ isAuthenticated: false });
});

// Initial admin registration endpoint
app.post('/api/register-admin', async (req, res) => {
  // Check if any admin already exists
  const checkAdminQuery = "SELECT * FROM users";
  db.query(checkAdminQuery, async (err, results) => {
    if (err) {
      console.error('Error checking for admin users:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    // If admin already exists, prevent registration
    if (results.length > 0) {
      return res.status(403).json({ message: 'Admin already exists. Registration is disabled.' });
    }

    // Proceed with registration for the first admin
    const { username, password } = req.body;

    // Validate input
    if (!validators.isValidString(username, 3, 50)) {
      return res.status(400).json({ message: 'Username must be between 3 and 50 characters' });
    }

    if (!validators.isValidString(password, 6, 100)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new admin user
      const insertAdminQuery = "INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')";
      db.query(insertAdminQuery, [username, hashedPassword], (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username already exists' });
          }
          console.error('Error creating admin user:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        // Return success
        res.status(201).json({
          message: 'Admin registration successful. Please login.',
          userId: result.insertId
        });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
});

// Department Routes
app.post('/api/departments', isAuthenticated, (req, res) => {
  const { departmentCode, departmentName, grossSalary } = req.body;

  // Validate department code
  if (!validators.isValidDepartmentCode(departmentCode)) {
    return res.status(400).json({
      message: 'Department code must be 2-10 alphanumeric characters or underscores'
    });
  }

  // Validate department name
  if (!validators.isValidString(departmentName, 2, 100)) {
    return res.status(400).json({
      message: 'Department name must be between 2 and 100 characters'
    });
  }

  // Validate gross salary
  if (!validators.isValidDecimal(grossSalary, 0, 1000000, 2)) {
    return res.status(400).json({
      message: 'Gross salary must be a positive number with up to 2 decimal places'
    });
  }

  const query = 'INSERT INTO department (departmentCode, departmentName, grossSalary) VALUES (?, ?, ?)';
  db.query(query, [departmentCode, departmentName, grossSalary], (err, _) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Department code already exists' });
      }
      console.error('Error creating department:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({
      message: 'Department created successfully',
      department: { departmentCode, departmentName, grossSalary }
    });
  });
});

app.get('/api/departments', isAuthenticated, (_, res) => {
  const query = 'SELECT * FROM department ORDER BY departmentName';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Employee Routes
app.post('/api/employees', isAuthenticated, (req, res) => {
  const { firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode } = req.body;

  // Validate first name
  if (!validators.isValidString(firstName, 2, 50)) {
    return res.status(400).json({ message: 'First name must be between 2 and 50 characters' });
  }

  // Validate last name
  if (!validators.isValidString(lastName, 2, 50)) {
    return res.status(400).json({ message: 'Last name must be between 2 and 50 characters' });
  }

  // Validate position
  if (!validators.isValidString(position, 2, 100)) {
    return res.status(400).json({ message: 'Position must be between 2 and 100 characters' });
  }

  // Validate department code
  if (!validators.isValidDepartmentCode(departmentCode)) {
    return res.status(400).json({ message: 'Invalid department code format' });
  }

  // Validate address (optional)
  if (address !== undefined && address !== null && !validators.isValidString(address, 0, 255)) {
    return res.status(400).json({ message: 'Address must not exceed 255 characters' });
  }

  // Validate telephone (optional)
  if (telephone !== undefined && telephone !== null && !validators.isValidPhone(telephone)) {
    return res.status(400).json({ message: 'Invalid telephone number format' });
  }

  // Validate gender (optional)
  if (gender !== undefined && gender !== null && !validators.isValidGender(gender)) {
    return res.status(400).json({ message: 'Gender must be Male, Female, or Other' });
  }

  // Validate hired date (optional)
  if (hiredDate !== undefined && hiredDate !== null && !validators.isValidDate(hiredDate)) {
    return res.status(400).json({ message: 'Hired date must be in YYYY-MM-DD format' });
  }

  const query = `
    INSERT INTO employee
    (firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ message: 'Department code does not exist' });
        }
        console.error('Error creating employee:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.status(201).json({
        message: 'Employee created successfully',
        employee: {
          employeeNumber: result.insertId,
          firstName,
          lastName,
          position,
          address,
          telephone,
          gender,
          hiredDate,
          departmentCode
        }
      });
    }
  );
});

app.get('/api/employees', isAuthenticated, (_, res) => {
  const query = `
    SELECT e.*, d.departmentName, d.grossSalary as departmentGrossSalary
    FROM employee e
    LEFT JOIN department d ON e.departmentCode = d.departmentCode
    ORDER BY e.lastName, e.firstName
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/api/employees/:employeeNumber', isAuthenticated, (req, res) => {
  const { employeeNumber } = req.params;

  const query = `
    SELECT e.*, d.departmentName, d.grossSalary as departmentGrossSalary
    FROM employee e
    LEFT JOIN department d ON e.departmentCode = d.departmentCode
    WHERE e.employeeNumber = ?
  `;

  db.query(query, [employeeNumber], (err, results) => {
    if (err) {
      console.error('Error fetching employee:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(results[0]);
  });
});

// Salary Routes
app.post('/api/salaries', isAuthenticated, (req, res) => {
  const { employeeNumber, grossSalary, totalDeduction, netSalary, month } = req.body;

  // Validate employee number
  if (!validators.isValidInteger(employeeNumber, 1)) {
    return res.status(400).json({ message: 'Employee number must be a positive integer' });
  }

  // Validate gross salary
  if (!validators.isValidDecimal(grossSalary, 0, 1000000, 2)) {
    return res.status(400).json({ message: 'Gross salary must be a positive number with up to 2 decimal places' });
  }

  // Validate total deduction
  if (!validators.isValidDecimal(totalDeduction, 0, parseFloat(grossSalary), 2)) {
    return res.status(400).json({ message: 'Total deduction must be a positive number not exceeding gross salary' });
  }

  // Validate net salary
  const expectedNetSalary = parseFloat(grossSalary) - parseFloat(totalDeduction);
  if (Math.abs(parseFloat(netSalary) - expectedNetSalary) > 0.01) {
    return res.status(400).json({ message: 'Net salary must equal gross salary minus total deduction' });
  }

  // Validate month
  if (!validators.isValidMonth(month)) {
    return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
  }

  const query = `
    INSERT INTO salary
    (employeeNumber, grossSalary, totalDeduction, netSalary, month)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [employeeNumber, grossSalary, totalDeduction, netSalary, month],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ message: 'Employee does not exist' });
        }
        console.error('Error creating salary record:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.status(201).json({
        message: 'Salary record created successfully',
        salary: {
          id: result.insertId,
          employeeNumber,
          grossSalary,
          totalDeduction,
          netSalary,
          month
        }
      });
    }
  );
});

app.get('/api/salaries', isAuthenticated, (_, res) => {
  const query = `
    SELECT s.*, e.firstName, e.lastName, e.position, d.departmentName
    FROM salary s
    JOIN employee e ON s.employeeNumber = e.employeeNumber
    JOIN department d ON e.departmentCode = d.departmentCode
    ORDER BY s.month DESC, e.lastName, e.firstName
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching salaries:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

app.put('/api/salaries/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { grossSalary, totalDeduction, netSalary, month } = req.body;

  // Validate ID
  if (!validators.isValidInteger(id, 1)) {
    return res.status(400).json({ message: 'Invalid salary record ID' });
  }

  // Validate gross salary
  if (!validators.isValidDecimal(grossSalary, 0, 1000000, 2)) {
    return res.status(400).json({ message: 'Gross salary must be a positive number with up to 2 decimal places' });
  }

  // Validate total deduction
  if (!validators.isValidDecimal(totalDeduction, 0, parseFloat(grossSalary), 2)) {
    return res.status(400).json({ message: 'Total deduction must be a positive number not exceeding gross salary' });
  }

  // Validate net salary
  const expectedNetSalary = parseFloat(grossSalary) - parseFloat(totalDeduction);
  if (Math.abs(parseFloat(netSalary) - expectedNetSalary) > 0.01) {
    return res.status(400).json({ message: 'Net salary must equal gross salary minus total deduction' });
  }

  // Validate month
  if (!validators.isValidMonth(month)) {
    return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
  }

  const query = `
    UPDATE salary
    SET grossSalary = ?, totalDeduction = ?, netSalary = ?, month = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [grossSalary, totalDeduction, netSalary, month, id],
    (err, result) => {
      if (err) {
        console.error('Error updating salary record:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Salary record not found' });
      }

      res.json({
        message: 'Salary record updated successfully',
        salary: {
          id,
          grossSalary,
          totalDeduction,
          netSalary,
          month
        }
      });
    }
  );
});

app.delete('/api/salaries/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!validators.isValidInteger(id, 1)) {
    return res.status(400).json({ message: 'Invalid salary record ID' });
  }

  const query = 'DELETE FROM salary WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting salary record:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json({ message: 'Salary record deleted successfully' });
  });
});

// Report Routes
app.get('/api/reports/monthly/:month', isAuthenticated, (req, res) => {
  const { month } = req.params;

  // Validate month format
  if (!validators.isValidMonth(month)) {
    return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
  }

  const query = `
    SELECT
      e.firstName,
      e.lastName,
      e.position,
      d.departmentName,
      s.grossSalary,
      s.totalDeduction,
      s.netSalary,
      s.month
    FROM salary s
    JOIN employee e ON s.employeeNumber = e.employeeNumber
    JOIN department d ON e.departmentCode = d.departmentCode
    WHERE s.month = ?
    ORDER BY d.departmentName, e.lastName, e.firstName
  `;

  db.query(query, [month], (err, results) => {
    if (err) {
      console.error('Error generating monthly report:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({
      month,
      reportData: results
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});