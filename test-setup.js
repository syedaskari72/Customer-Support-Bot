/**
 * Simple test script to verify the chatbot setup
 * Run with: node test-setup.js
 */

const { v4: uuidv4 } = require('uuid');

// Test data
const testUserId = uuidv4();
const testSessionId = uuidv4();

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
    message: "میرا آرڈر دیر سے آیا ہے",
    language: "urdu"
  },
  {
    message: "I want a refund for my order",
    language: "english"
  }
];

async function testChatAPI() {
  console.log('🤖 Testing Customer Support Chatbot Setup\n');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  console.log(`Testing against: ${baseUrl}`);
  console.log(`Test User ID: ${testUserId}`);
  console.log(`Test Session ID: ${testSessionId}\n`);

  for (let i = 0; i < testMessages.length; i++) {
    const testMessage = testMessages[i];
    console.log(`📝 Test ${i + 1}: ${testMessage.language.toUpperCase()}`);
    console.log(`Message: "${testMessage.message}"`);
    
    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage.message,
          userId: testUserId,
          sessionId: testSessionId,
        }),
      });

      if (!response.ok) {
        console.log(`❌ Error: ${response.status} ${response.statusText}`);
        const errorData = await response.json();
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
    
    // Wait 1 second between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testConversationHistory() {
  console.log('📚 Testing Conversation History API\n');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(
      `${baseUrl}/api/conversations?userId=${testUserId}&sessionId=${testSessionId}&limit=10`
    );

    if (!response.ok) {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.log(`Error details:`, errorData);
    } else {
      const data = await response.json();
      console.log(`✅ Retrieved ${data.conversations.length} conversation(s)`);
      
      if (data.conversations.length > 0) {
        console.log('Recent conversations:');
        data.conversations.slice(-3).forEach((conv, index) => {
          console.log(`  ${index + 1}. User: "${conv.message}"`);
          console.log(`     Bot: "${conv.response}"`);
        });
      }
    }
  } catch (error) {
    console.log(`❌ Network Error:`, error.message);
  }
  
  console.log('---\n');
}

async function testSessionAPI() {
  console.log('🔗 Testing Session API\n');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    // Test creating a new session
    const createResponse = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
      }),
    });

    if (!createResponse.ok) {
      console.log(`❌ Create Session Error: ${createResponse.status}`);
    } else {
      const createData = await createResponse.json();
      console.log(`✅ Created new session: ${createData.sessionId}`);
    }

    // Test getting user sessions
    const getResponse = await fetch(`${baseUrl}/api/sessions?userId=${testUserId}`);

    if (!getResponse.ok) {
      console.log(`❌ Get Sessions Error: ${getResponse.status}`);
    } else {
      const getData = await getResponse.json();
      console.log(`✅ Retrieved ${getData.sessions.length} session(s) for user`);
    }
  } catch (error) {
    console.log(`❌ Network Error:`, error.message);
  }
  
  console.log('---\n');
}

async function runTests() {
  console.log('🚀 Starting Customer Support Chatbot Tests\n');
  
  // Check if server is running
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const healthCheck = await fetch(baseUrl);
    if (!healthCheck.ok) {
      console.log('❌ Server is not responding. Make sure to run "npm run dev" first.');
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server. Make sure to run "npm run dev" first.');
    console.log(`Trying to connect to: ${baseUrl}`);
    return;
  }

  console.log('✅ Server is running\n');

  // Run tests
  await testSessionAPI();
  await testChatAPI();
  await testConversationHistory();
  
  console.log('🎉 Test suite completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Set up your environment variables (.env.local)');
  console.log('2. Configure Supabase database using supabase-schema.sql');
  console.log('3. Add your OpenAI or Anthropic API key');
  console.log('4. Test the web interface at http://localhost:3000');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testChatAPI,
  testConversationHistory,
  testSessionAPI,
  runTests
};
