// Test multiple messages to ensure the chat API is working properly
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testMessages = [
  {
    message: "Hello, I need help with my order",
    language: "english"
  },
  {
    message: "Mera order late deliver hua tha",
    language: "hindi"
  },
  {
    message: "I want a refund for my order",
    language: "english"
  },
  {
    message: "میرا آرڈر دیر سے آیا ہے",
    language: "urdu"
  }
];

async function testMultipleMessages() {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  
  console.log('🤖 Testing Multiple Chat Messages\n');
  
  for (let i = 0; i < testMessages.length; i++) {
    const testMessage = testMessages[i];
    console.log(`📝 Test ${i + 1}: ${testMessage.language.toUpperCase()}`);
    console.log(`Message: "${testMessage.message}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage.message,
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
        console.log(`Language detected: ${data.metadata?.language || 'unknown'}`);
        console.log(`Intent detected: ${data.metadata?.intent || 'unknown'}`);
      }
    } catch (error) {
      console.log(`❌ Network Error:`, error.message);
    }
    
    console.log('---\n');
    
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 All tests completed!');
}

testMultipleMessages().catch(console.error);
