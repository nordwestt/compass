import { scanForSensitiveInfo, SensitiveInfoType } from './privacyScanner';

// Test function
function testPrivacyScanner() {
  console.log('Testing Privacy Scanner...');
  
  // Test cases
  const testCases = [
    {
      name: 'API Key',
      text: 'My OpenAI API key is sk-1234567890abcdefghijklmnopqrstuvwxyz',
      expectedType: SensitiveInfoType.API_KEY
    },
    {
      name: 'Credit Card',
      text: 'My credit card number is 4111 1111 1111 1111',
      expectedType: SensitiveInfoType.CREDIT_CARD
    },
    {
      name: 'US SSN',
      text: 'My social security number is 123-45-6789',
      expectedType: SensitiveInfoType.SSN_US
    },
    {
      name: 'Danish CPR',
      text: 'My CPR number is 010190-1234',
      expectedType: SensitiveInfoType.SSN_DK
    },
    {
      name: 'Italian Fiscal Code',
      text: 'My codice fiscale is RSSMRA80A01H501U',
      expectedType: SensitiveInfoType.SSN_IT
    },
    {
      name: 'Email',
      text: 'Contact me at user@example.com',
      expectedType: SensitiveInfoType.EMAIL
    },
    {
      name: 'Phone Number',
      text: 'Call me at +1 (555) 123-4567',
      expectedType: SensitiveInfoType.PHONE_NUMBER
    },
    {
      name: 'Password',
      text: 'password = "supersecret123"',
      expectedType: SensitiveInfoType.PASSWORD
    },
    {
      name: 'Private Key',
      text: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA1b7mDL3FXcH4HPDFzZ...\n-----END RSA PRIVATE KEY-----',
      expectedType: SensitiveInfoType.PRIVATE_KEY
    },
    {
      name: 'Health Info',
      text: 'My diagnosis is Type 2 Diabetes and my patient ID is 12345',
      expectedType: SensitiveInfoType.HEALTH_INFO
    },
    {
      name: 'Clean Text',
      text: 'This is a normal message with no sensitive information.',
      expectedType: null
    }
  ];
  
  // Run tests
  for (const test of testCases) {
    const result = scanForSensitiveInfo(test.text);
    const passed = test.expectedType === null 
      ? !result.hasSensitiveInfo
      : result.detectedTypes.includes(test.expectedType);
    
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
    
    if (!passed) {
      console.log(`  Expected: ${test.expectedType || 'No sensitive info'}`);
      console.log(`  Actual: ${result.detectedTypes.join(', ') || 'No sensitive info'}`);
    }
    
    if (result.hasSensitiveInfo) {
      console.log(`  Redacted: ${result.redactedMessage}`);
    }
  }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.addEventListener('load', testPrivacyScanner);
} else {
  // Node.js environment
  testPrivacyScanner();
} 