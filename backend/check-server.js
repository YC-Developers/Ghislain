const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/',
  method: 'GET'
};

console.log('Checking if server is running on port 5000...');

const req = http.request(options, (res) => {
  console.log(`Server is running! Status code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    // Just consume the data
  });
  
  res.on('end', () => {
    console.log('Response received from server');
  });
});

req.on('error', (e) => {
  console.error('Server is not running or not accessible:');
  console.error(`Error: ${e.message}`);
  console.error('Please make sure the server is running with: npm start');
});

req.end();
