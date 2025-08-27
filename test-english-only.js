// Test English-only functionality
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testMessages = [
  "Hello, I need help with my order",
  "My delivery is late",
  "I want to request a refund",
  "Can you help me track my order?",
  "I have a question about the menu",
  "My payment failed"
];

async function testEnglishOnly() {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  
  console.log('🤖 Testing English-Only Chat Functionality\n');
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`📝 Test ${i + 1}: "${message}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          userId: userId,
        }),
      });

      if (!response.ok) {
        console.log(`❌ Error: ${response.status} ${response.statusText}`);
        const errorData = await response.text();
        console.log(`Error details:`, errorData);
      } else {
        const data = await response.json();
        console.log(`✅ Response: "${data.response}"`);
        console.log(`Intent detected: ${data.metadata?.intent || 'unknown'}`);
      }
    } catch (error) {
      console.log(`❌ Network Error:`, error.message);
    }
    
    console.log('---\n');
    
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 All English-only tests completed!');
}

testEnglishOnly().catch(console.error);
