const http = require('http');

console.log('Testing connection to backend server...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/',
  method: 'GET',
  timeout: 3000 // 3 seconds timeout
};

const req = http.request(options, (res) => {
  console.log(`Server responded with status code: ${res.statusCode}`);
  console.log('Connection successful!');
  
  res.on('data', (chunk) => {
    // Just consume the data
  });
  
  res.on('end', () => {
    console.log('Response received completely');
  });
});

req.on('error', (e) => {
  console.error('Connection failed:');
  console.error(`Error: ${e.message}`);
  console.error('\nPossible solutions:');
  console.error('1. Make sure the backend server is running with: node server.js');
  console.error('2. Check if port 5000 is already in use by another application');
  console.error('3. Try changing the port in server.js and App.jsx if needed');
});

req.on('timeout', () => {
  console.error('Connection timed out after 3 seconds');
  req.destroy();
});

req.end();
