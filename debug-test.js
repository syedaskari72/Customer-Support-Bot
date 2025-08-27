// Simple debug test to check what's failing
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testChatAPI() {
  try {
    console.log('Testing chat API...');
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello',
        userId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      console.log('✅ Chat API working!');
    } else {
      console.log('❌ Chat API failed');
    }
  } catch (error) {
    console.error('❌ Error testing chat API:', error.message);
  }
}

async function testHealth() {
  try {
    console.log('Testing health API...');
    
    const response = await fetch('http://localhost:3000/api/health');
    
    console.log('Health status:', response.status);
    
    const data = await response.text();
    console.log('Health response:', data);
    
  } catch (error) {
    console.error('❌ Error testing health API:', error.message);
  }
}

async function runTests() {
  await testHealth();
  console.log('---');
  await testChatAPI();
}

runTests().catch(console.error);
