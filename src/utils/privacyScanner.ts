import LogService from "@/utils/LogService";

/**
 * Types of sensitive information that can be detected
 */
export enum SensitiveInfoType {
  API_KEY = 'API_KEY',
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  CREDIT_CARD = 'CREDIT_CARD',
  SSN_US = 'SSN_US',
  SSN_DK = 'SSN_DK', // CPR number (Danish)
  SSN_IT = 'SSN_IT', // Codice Fiscale (Italian)
  EMAIL = 'EMAIL',
  PHONE_NUMBER = 'PHONE_NUMBER',
  PASSWORD = 'PASSWORD',
  PRIVATE_KEY = 'PRIVATE_KEY',
  HEALTH_INFO = 'HEALTH_INFO'
}

/**
 * Result of a privacy scan
 */
export interface PrivacyScanResult {
  hasSensitiveInfo: boolean;
  detectedTypes: SensitiveInfoType[];
  redactedMessage?: string;
}

/**
 * Checks if a string contains API keys or access tokens
 */
export function containsApiKeyOrToken(text: string): boolean {
  // Common API key and token patterns
  const patterns = [
    /['"]?([a-zA-Z0-9_]{20,40})['"]?/g, // Generic API key pattern
    /['"]?(sk-[a-zA-Z0-9]{32,})['"]?/g, // OpenAI API key pattern
    /['"]?(xoxb-[a-zA-Z0-9-]{24,})['"]?/g, // Slack bot token
    /['"]?(ghp_[a-zA-Z0-9]{36,})['"]?/g, // GitHub personal access token
    /['"]?(AKIA[0-9A-Z]{16})['"]?/g, // AWS access key ID
    /['"]?([a-zA-Z0-9/+]{40})['"]?/g, // AWS secret access key
    /['"]?(AIza[0-9A-Za-z-_]{35})['"]?/g, // Google API key
    /['"]?(SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43})['"]?/g, // SendGrid API key
    /bearer\s+[a-zA-Z0-9_\-\.]+/gi, // Bearer token
    /api[_\-]?key\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{10,})['"]?/gi, // API key assignment
    /access[_\-]?token\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{10,})['"]?/gi, // Access token assignment
  ];

  return patterns.some(pattern => pattern.test(text));
}

/**
 * Checks if a string contains credit card numbers
 * Uses Luhn algorithm to validate
 */
export function containsCreditCardNumber(text: string): boolean {
  // Match potential credit card numbers (remove spaces, dashes)
  const ccRegex = /\b(?:\d[ -]*?){13,16}\b/g;
  const potentialCards = text.match(ccRegex);
  
  if (!potentialCards) return false;
  
  // Validate using Luhn algorithm
  return potentialCards.some(card => {
    const digits = card.replace(/\D/g, '');
    
    // Check for common credit card patterns
    const isAmex = /^3[47]\d{13}$/.test(digits);
    const isVisa = /^4\d{12}(?:\d{3})?$/.test(digits);
    const isMastercard = /^5[1-5]\d{14}$/.test(digits);
    const isDiscover = /^6(?:011|5\d{2})\d{12}$/.test(digits);
    
    if (!(isAmex || isVisa || isMastercard || isDiscover)) {
      return false;
    }
    
    // Luhn algorithm validation
    let sum = 0;
    let shouldDouble = false;
    
    // Loop from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  });
}

/**
 * Checks if a string contains US Social Security Numbers
 */
export function containsUSSSN(text: string): boolean {
  // US SSN pattern: XXX-XX-XXXX or XXX XX XXXX
  const ssnRegex = /\b(?:\d{3}[-\s]?\d{2}[-\s]?\d{4})\b/g;
  const matches = text.match(ssnRegex);
  
  if (!matches) return false;
  
  // Additional validation to reduce false positives
  return matches.some(match => {
    const digits = match.replace(/\D/g, '');
    
    // SSN can't be all zeros in any group
    if (/^0{3}|0{2}$|0{4}$/.test(digits)) return false;
    
    // SSN can't be 666 in first group
    if (digits.substring(0, 3) === '666') return false;
    
    // SSN can't start with 9
    if (digits.charAt(0) === '9') return false;
    
    return true;
  });
}

/**
 * Checks if a string contains Danish CPR numbers
 */
export function containsDanishCPR(text: string): boolean {
  // Danish CPR pattern: DDMMYY-XXXX
  const cprRegex = /\b\d{6}[-\s]?\d{4}\b/g;
  const matches = text.match(cprRegex);
  
  if (!matches) return false;
  
  return matches.some(match => {
    const digits = match.replace(/\D/g, '');
    
    // Basic date validation (day between 01-31, month between 01-12)
    const day = parseInt(digits.substring(0, 2));
    const month = parseInt(digits.substring(2, 4));
    
    return day >= 1 && day <= 31 && month >= 1 && month <= 12;
  });
}

/**
 * Checks if a string contains Italian Codice Fiscale
 */
export function containsItalianFiscalCode(text: string): boolean {
  // Italian Codice Fiscale pattern: 16 characters, alphanumeric
  const cfRegex = /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi;
  return cfRegex.test(text);
}

/**
 * Checks if a string contains email addresses
 */
export function containsEmail(text: string): boolean {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return emailRegex.test(text);
}

/**
 * Checks if a string contains phone numbers
 */
export function containsPhoneNumber(text: string): boolean {
  // International format with optional country code
  const phoneRegex = /\b(?:\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}\b/g;
  return phoneRegex.test(text);
}

/**
 * Checks if a string contains what appears to be passwords
 */
export function containsPassword(text: string): boolean {
  const passwordPatterns = [
    /password\s*[:=]\s*['"]([^'"]{6,})['"]?/gi,
    /pwd\s*[:=]\s*['"]([^'"]{6,})['"]?/gi,
    /passw\s*[:=]\s*['"]([^'"]{6,})['"]?/gi,
    /secret\s*[:=]\s*['"]([^'"]{6,})['"]?/gi
  ];
  
  return passwordPatterns.some(pattern => pattern.test(text));
}

/**
 * Checks if a string contains private keys (PEM format)
 */
export function containsPrivateKey(text: string): boolean {
  const privateKeyPatterns = [
    /-----BEGIN (?:RSA|DSA|EC|OPENSSH) PRIVATE KEY-----[^-]*-----END (?:RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/g,
    /-----BEGIN PRIVATE KEY-----[^-]*-----END PRIVATE KEY-----/g
  ];
  
  return privateKeyPatterns.some(pattern => pattern.test(text));
}

/**
 * Checks if a string contains health-related information
 */
export function containsHealthInfo(text: string): boolean {
  // Common health-related terms
  const healthTerms = [
    /\b(?:diagnosis|diagnosed with|medical condition|patient id|health insurance|prescription|treatment plan)\b/gi,
    /\b(?:medical record|patient number|health card|medicare|medicaid)\b/gi,
    /\b(?:blood type|blood test|lab results|medical history)\b/gi
  ];
  
  return healthTerms.some(pattern => pattern.test(text));
}

/**
 * Redacts sensitive information in a message
 */
export function redactSensitiveInfo(text: string): string {
  let redacted = text;
  
  // Redact credit card numbers
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED CREDIT CARD]');
  
  // Redact SSNs (various formats)
  redacted = redacted.replace(/\b(?:\d{3}[-\s]?\d{2}[-\s]?\d{4})\b/g, '[REDACTED SSN]');
  redacted = redacted.replace(/\b\d{6}[-\s]?\d{4}\b/g, '[REDACTED ID NUMBER]');
  redacted = redacted.replace(/\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi, '[REDACTED ID NUMBER]');
  
  // Redact API keys and tokens
  redacted = redacted.replace(/['"]?([a-zA-Z0-9_]{20,40})['"]?/g, '[REDACTED API KEY]');
  redacted = redacted.replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'bearer [REDACTED TOKEN]');
  
  // Redact emails
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED EMAIL]');
  
  // Redact phone numbers
  redacted = redacted.replace(/\b(?:\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}\b/g, '[REDACTED PHONE]');
  
  return redacted;
}

/**
 * Main function to scan a message for sensitive information
 */
export function scanForSensitiveInfo(message: string): PrivacyScanResult {
  try {
    const detectedTypes: SensitiveInfoType[] = [];
    
    // Run all checks
    if (containsApiKeyOrToken(message)) {
      detectedTypes.push(SensitiveInfoType.API_KEY, SensitiveInfoType.ACCESS_TOKEN);
    }
    
    if (containsCreditCardNumber(message)) {
      detectedTypes.push(SensitiveInfoType.CREDIT_CARD);
    }
    
    if (containsUSSSN(message)) {
      detectedTypes.push(SensitiveInfoType.SSN_US);
    }
    
    if (containsDanishCPR(message)) {
      detectedTypes.push(SensitiveInfoType.SSN_DK);
    }
    
    if (containsItalianFiscalCode(message)) {
      detectedTypes.push(SensitiveInfoType.SSN_IT);
    }
    
    if (containsEmail(message)) {
      detectedTypes.push(SensitiveInfoType.EMAIL);
    }
    
    if (containsPhoneNumber(message)) {
      detectedTypes.push(SensitiveInfoType.PHONE_NUMBER);
    }
    
    if (containsPassword(message)) {
      detectedTypes.push(SensitiveInfoType.PASSWORD);
    }
    
    if (containsPrivateKey(message)) {
      detectedTypes.push(SensitiveInfoType.PRIVATE_KEY);
    }
    
    if (containsHealthInfo(message)) {
      detectedTypes.push(SensitiveInfoType.HEALTH_INFO);
    }
    
    const hasSensitiveInfo = detectedTypes.length > 0;
    
    // Create redacted version if sensitive info found
    const redactedMessage = hasSensitiveInfo ? redactSensitiveInfo(message) : undefined;
    
    return {
      hasSensitiveInfo,
      detectedTypes,
      redactedMessage
    };
  } catch (error) {
    LogService.log(error as string, {
      component: 'privacyScanner',
      function: 'scanForSensitiveInfo'
    }, 'error');
    
    // Default to safe in case of error
    return {
      hasSensitiveInfo: false,
      detectedTypes: []
    };
  }
}

/**
 * Privacy transform for message pipeline
 */
export const privacyTransform = {
  name: 'privacy',
  transform: async (ctx: any): Promise<any> => {
    // Skip if privacy scanning is disabled
    if (ctx.metadata.skipPrivacyScan) return ctx;
    
    const scanResult = scanForSensitiveInfo(ctx.message);
    
    if (scanResult.hasSensitiveInfo) {
      // Log the detection (but not the sensitive content itself)
      LogService.log(`Detected sensitive information: ${scanResult.detectedTypes.join(', ')}`, {
        component: 'privacyTransform',
        function: 'transform'
      }, 'warn');
      
      // Store detection result in context
      ctx.metadata.privacyScanResult = scanResult;
      
      // Optionally replace the message with redacted version
      if (ctx.metadata.autoRedactSensitiveInfo && scanResult.redactedMessage) {
        ctx.message = scanResult.redactedMessage;
      }
    }
    
    return ctx;
  }
}; 