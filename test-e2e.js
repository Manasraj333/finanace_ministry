const http = require('http');

function request(method, path, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (cookie) options.headers['Cookie'] = cookie;
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let setCookie = res.headers['set-cookie'];
        let parsed;
        try { parsed = JSON.parse(data); } catch(e) { parsed = data; }
        resolve({ status: res.statusCode, data: parsed, cookie: setCookie });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('--- STARTING E2E DATA FLOW TEST ---');
  let citizenCookie, analystCookie, adminCookie;
  
  // 1. Citizen Signup
  console.log('\n1. Citizen Signup');
  const citizenEmail = 'testcitizen' + Date.now() + '@example.com';
  let res = await request('POST', '/api/auth/signup', { email: citizenEmail, password: 'password123', full_name: 'Test Citizen', role: 'public_user' });
  console.log('Signup Response:', res.status);
  
  // 2. Citizen Login
  console.log('\n2. Citizen Login');
  res = await request('POST', '/api/auth/login', { email: citizenEmail, password: 'password123' });
  console.log('Login Response:', res.status);
  citizenCookie = res.cookie[0]; // extract JWT

  // 3. Get Schemes
  console.log('\n3. Fetch Schemes');
  res = await request('GET', '/api/schemes', null, citizenCookie);
  console.log('Schemes returned:', res.data.length);
  const schemeId = res.data[0].id; // or _id
  console.log('Target Scheme ID:', schemeId);

  // 4. Apply for Scheme
  console.log('\n4. Apply for Scheme');
  res = await request('POST', '/api/applications', { scheme_id: schemeId, application_data: { test: 'data' } }, citizenCookie);
  console.log('Application Submit Response:', res.status, res.data);
  const appId = res.data.id || res.data._id || res.data.insertedId;
  console.log('Application ID:', appId);
  
  // 5. Setup Analyst Account
  console.log('\n5. Setup Analyst Account');
  const analystEmail = 'testanalyst' + Date.now() + '@example.com';
  await request('POST', '/api/auth/signup', { email: analystEmail, password: 'password123', full_name: 'Test Analyst', role: 'analyst' });
  res = await request('POST', '/api/auth/login', { email: analystEmail, password: 'password123' });
  analystCookie = res.cookie[0];
  
  // 6. Analyst Reviews Application (Forward to Admin)
  console.log('\n6. Analyst Review Application');
  res = await request('PATCH', `/api/applications/${appId}/review`, { status: 'forwarded_to_admin', review_notes: 'Looks good' }, analystCookie);
  console.log('Analyst Review Response:', res.status, res.data);
  
  // 7. Setup Admin Account
  console.log('\n7. Setup Admin Account');
  const adminEmail = 'testadmin' + Date.now() + '@example.com';
  await request('POST', '/api/auth/signup', { email: adminEmail, password: 'password123', full_name: 'Test Admin', role: 'admin' });
  res = await request('POST', '/api/auth/login', { email: adminEmail, password: 'password123' });
  adminCookie = res.cookie[0];
  
  // 8. Admin Final Approval
  console.log('\n8. Admin Approves Application');
  res = await request('PATCH', `/api/applications/${appId}/review`, { status: 'approved', review_notes: 'Approved by admin' }, adminCookie);
  console.log('Admin Approval Response:', res.status, res.data);
  
  console.log('\n--- E2E TEST COMPLETE ---');
}
run().catch(console.error);
