const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5175', 'http://localhost:3000'], // React app's possible addresses
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

      // Create Department table
      const createDepartmentTable = `
        CREATE TABLE IF NOT EXISTS department (
          departmentCode VARCHAR(10) PRIMARY KEY,
          departmentName VARCHAR(100) NOT NULL,
          grossSalary DECIMAL(10, 2) NOT NULL
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
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new admin user
      const insertAdminQuery = "INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')";
      db.query(insertAdminQuery, [username, hashedPassword], (err, result) => {
        if (err) {
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

  if (!departmentCode || !departmentName || !grossSalary) {
    return res.status(400).json({ message: 'Department code, name, and gross salary are required' });
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

  if (!firstName || !lastName || !position || !departmentCode) {
    return res.status(400).json({ message: 'First name, last name, position, and department code are required' });
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

  if (!employeeNumber || !grossSalary || !totalDeduction || !netSalary || !month) {
    return res.status(400).json({ message: 'All salary fields are required' });
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

  if (!grossSalary || !totalDeduction || !netSalary || !month) {
    return res.status(400).json({ message: 'All salary fields are required' });
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