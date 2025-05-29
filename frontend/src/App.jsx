import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Departments from './components/Departments';
import Salaries from './components/Salaries';
import Reports from './components/Reports';
import Navbar from './components/Navbar';

// Set default axios settings
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log('Response received:', response.status);
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error - no response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/check-auth');
        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.get('/api/logout');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        <div className="container mx-auto px-4 py-4">
          <Routes>
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/" /> : <Register />}
            />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/"
              element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/register" />}
            />
            <Route
              path="/employees"
              element={isAuthenticated ? <Employees /> : <Navigate to="/register" />}
            />
            <Route
              path="/departments"
              element={isAuthenticated ? <Departments /> : <Navigate to="/register" />}
            />
            <Route
              path="/salaries"
              element={isAuthenticated ? <Salaries /> : <Navigate to="/register" />}
            />
            <Route
              path="/reports"
              element={isAuthenticated ? <Reports /> : <Navigate to="/register" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
