const https = require('https');
const http = require('http');

function checkApiHealth() {
  const backendUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
  
  console.log(`Checking API health at: ${backendUrl}`);
  
  const url = new URL(backendUrl);
  const client = url.protocol === 'https:' ? https : http;
  
  return new Promise((resolve, reject) => {
    const req = client.get(`${backendUrl}/store/regions`, (res) => {
      console.log(`API Status: ${res.statusCode}`);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ API is accessible');
        resolve(true);
      } else {
        console.log('❌ API returned error status');
        reject(new Error(`API returned status ${res.statusCode}`));
      }
    });
    
    req.on('error', (error) => {
      console.log('❌ API connection failed:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ API request timeout');
      req.destroy();
      reject(new Error('API request timeout'));
    });
  });
}

// Only run if this script is executed directly
if (require.main === module) {
  checkApiHealth()
    .then(() => {
      console.log('Build can proceed');
      process.exit(0);
    })
    .catch((error) => {
      console.log('Build should be skipped due to API issues');
      console.log('Error:', error.message);
      process.exit(1);
    });
}

module.exports = { checkApiHealth }; 