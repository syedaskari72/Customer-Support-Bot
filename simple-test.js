// Simple test for the simple chat API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSimpleChat() {
  try {
    console.log('Testing simple chat API...');
    
    const response = await fetch('http://localhost:3000/api/simple-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, I need help with my order',
      }),
    });

    console.log('Response status:', response.status);
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      console.log('✅ Simple chat API working!');
    } else {
      console.log('❌ Simple chat API failed');
    }
  } catch (error) {
    console.error('❌ Error testing simple chat API:', error.message);
  }
}

testSimpleChat().catch(console.error);
