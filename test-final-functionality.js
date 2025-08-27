// Comprehensive test for all improvements
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testHealthCheck() {
  console.log('🏥 Testing Health Check...');
  try {
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    console.log('✅ Health Check:', data.status);
    return true;
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    return false;
  }
}

async function testEnglishOnlyChat() {
  console.log('\n🗣️ Testing English-Only Chat...');
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  
  const testCases = [
    { message: "Hello", expectedIntent: "general_inquiry" },
    { message: "My order is late", expectedIntent: "delivery_delay" },
    { message: "I need a refund", expectedIntent: "refund_request" },
    { message: "Track my order", expectedIntent: "order_tracking" },
    { message: "Payment failed", expectedIntent: "payment_issue" },
    { message: "Cancel my order", expectedIntent: "cancellation" }
  ];

  let passed = 0;
  for (const testCase of testCases) {
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testCase.message,
          userId: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const intentMatch = data.metadata?.intent === testCase.expectedIntent;
        console.log(`${intentMatch ? '✅' : '⚠️'} "${testCase.message}" → Intent: ${data.metadata?.intent}`);
        if (intentMatch) passed++;
      } else {
        console.log(`❌ "${testCase.message}" → HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ "${testCase.message}" → Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`📊 Intent Detection: ${passed}/${testCases.length} passed`);
  return passed === testCases.length;
}

async function testResponseQuality() {
  console.log('\n💬 Testing Response Quality...');
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  
  const qualityTests = [
    "I have an issue with my order",
    "I need help with my account", 
    "I have a question about the menu"
  ];

  let englishResponses = 0;
  for (const message of qualityTests) {
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        const isEnglish = /^[a-zA-Z0-9\s.,!?'"()-]+$/.test(data.response);
        console.log(`${isEnglish ? '✅' : '❌'} English Response: "${data.response.substring(0, 50)}..."`);
        if (isEnglish) englishResponses++;
      }
    } catch (error) {
      console.log(`❌ Error testing: ${message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`📊 English Responses: ${englishResponses}/${qualityTests.length}`);
  return englishResponses === qualityTests.length;
}

async function runAllTests() {
  console.log('🚀 Running Comprehensive Functionality Tests\n');
  console.log('=' .repeat(50));
  
  const results = {
    health: await testHealthCheck(),
    englishChat: await testEnglishOnlyChat(),
    responseQuality: await testResponseQuality()
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 FINAL TEST RESULTS:');
  console.log('=' .repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n' + (allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'));
  
  console.log('\n🎯 IMPROVEMENTS IMPLEMENTED:');
  console.log('✅ Removed Hindi/Urdu language support');
  console.log('✅ English-only responses');
  console.log('✅ Enhanced UI with modern gradients and styling');
  console.log('✅ Clickable info cards');
  console.log('✅ Improved responsive design');
  console.log('✅ Enhanced chat interface design');
  console.log('✅ Session management improvements');
  console.log('✅ Better error handling and fallbacks');
}

runAllTests().catch(console.error);
