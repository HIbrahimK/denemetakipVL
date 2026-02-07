/**
 * Test script to verify health endpoints work locally
 * Run with: node test-health.js
 */

const http = require('http');

const testEndpoint = (path, description) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:8080${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ ${description} (${res.statusCode}):`, json);
          resolve(true);
        } catch (e) {
          console.log(`✅ ${description} (${res.statusCode}):`, data);
          resolve(true);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}:`, err.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`⏰ ${description}: Timeout`);
      resolve(false);
    });
  });
};

async function testHealthEndpoints() {
  console.log('🔍 Testing health endpoints on localhost:8080...\n');
  
  const tests = [
    ['/', 'Root endpoint'],
    ['/alive', 'Liveness check'],
    ['/health', 'Health check'],
    ['/ready', 'Readiness check']
  ];
  
  for (const [path, description] of tests) {
    await testEndpoint(path, description);
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between tests
  }
  
  console.log('\n✅ Health endpoint tests complete!');
}

// Add a delay to allow the server to start up
setTimeout(() => {
  testHealthEndpoints().catch(console.error);
}, 2000);