// Comprehensive button and functionality test script
const testEndpoints = [
  // Authentication tests
  { method: 'POST', url: '/api/auth/admin-login', data: { username: 'admin', password: 'admin123', role: 'admin' }, description: 'Admin login' },
  { method: 'POST', url: '/api/auth/client-login', data: { clientId: 'swanson.robert', password: 'Camputer69!' }, description: 'Client login' },
  
  // Client portal actions
  { method: 'POST', url: '/api/check-ins', data: { clientId: 1, location: '21.3099,-157.8581', notes: 'Test check-in', biometricData: 'test', biometricType: 'facial', gpsAccuracy: 'high-precision' }, description: 'Client check-in submit' },
  { method: 'POST', url: '/api/payments', data: { clientId: 1, amount: '100.00', paymentMethod: 'credit_card', notes: 'Test payment' }, description: 'Client payment upload' },
  { method: 'POST', url: '/api/messages', data: { clientId: 1, subject: 'Test message', message: 'Testing communication' }, description: 'Client message send' },
  
  // Admin dashboard actions
  { method: 'GET', url: '/api/clients', description: 'Admin view clients' },
  { method: 'GET', url: '/api/payments', description: 'Admin view payments' },
  { method: 'GET', url: '/api/check-ins', description: 'Admin view check-ins' },
  { method: 'POST', url: '/api/clients/1/confirm-payment/1', data: { confirmedBy: 'admin' }, description: 'Admin confirm payment' },
  { method: 'POST', url: '/api/alerts/1/acknowledge', data: { acknowledgedBy: 'admin' }, description: 'Admin acknowledge alert' },
  
  // Skip bail monitoring
  { method: 'GET', url: '/api/admin/skip-bail-risk', description: 'Admin view skip bail risk' },
  { method: 'GET', url: '/api/admin/location/patterns?clientId=1', description: 'Admin view location patterns' },
  { method: 'GET', url: '/api/admin/location/frequent/1?days=30', description: 'Admin view frequent locations' },
  
  // Audit and compliance
  { method: 'GET', url: '/api/admin/audit-logs', description: 'Admin view audit logs' },
  { method: 'POST', url: '/api/admin/compliance-report', data: { startDate: '2024-01-01', endDate: '2024-12-31' }, description: 'Admin generate compliance report' },
  
  // Court dates and notifications
  { method: 'GET', url: '/api/court-dates', description: 'View court dates' },
  { method: 'POST', url: '/api/court-dates/1/acknowledge', data: { clientId: 1 }, description: 'Client acknowledge court date' },
  { method: 'GET', url: '/api/notifications', description: 'View notifications' },
  { method: 'POST', url: '/api/notifications/1/acknowledge', data: { acknowledgedBy: 'admin' }, description: 'Acknowledge notification' }
];

console.log('Testing all endpoints for button functionality and data communication...\n');

async function testEndpoint(test) {
  try {
    const options = {
      method: test.method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (test.data) {
      options.body = JSON.stringify(test.data);
    }
    
    const response = await fetch(`http://localhost:5000${test.url}`, options);
    const status = response.status;
    const result = status < 400 ? 'PASS' : 'FAIL';
    
    console.log(`${result}: ${test.description} - Status: ${status}`);
    
    if (status >= 400) {
      const errorText = await response.text();
      console.log(`  Error: ${errorText.substring(0, 100)}`);
    }
    
    return { test: test.description, status, result };
  } catch (error) {
    console.log(`ERROR: ${test.description} - ${error.message}`);
    return { test: test.description, status: 'ERROR', result: 'FAIL' };
  }
}

// This would be run in a proper test environment
console.log('Test framework ready. Run individual tests as needed.');