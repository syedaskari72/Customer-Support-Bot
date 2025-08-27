export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: unknown;
}

export class InputValidator {
  /**
   * Validate and sanitize chat message
   */
  static validateMessage(message: unknown): ValidationResult {
    if (!message) {
      return { isValid: false, error: 'Message is required' };
    }

    if (typeof message !== 'string') {
      return { isValid: false, error: 'Message must be a string' };
    }

    const trimmed = message.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length > 1000) {
      return { isValid: false, error: 'Message is too long (max 1000 characters)' };
    }

    // Check for potentially harmful content
    const harmfulPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(trimmed)) {
        return { isValid: false, error: 'Message contains potentially harmful content' };
      }
    }

    // Sanitize the message
    const sanitized = trimmed
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return { isValid: true, sanitizedValue: sanitized };
  }

  /**
   * Validate user ID
   */
  static validateUserId(userId: unknown): ValidationResult {
    if (!userId) {
      return { isValid: false, error: 'User ID is required' };
    }

    if (typeof userId !== 'string') {
      return { isValid: false, error: 'User ID must be a string' };
    }

    const trimmed = userId.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'User ID cannot be empty' };
    }

    // UUID format validation (loose)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(trimmed)) {
      return { isValid: false, error: 'Invalid User ID format' };
    }

    return { isValid: true, sanitizedValue: trimmed };
  }

  /**
   * Validate session ID
   */
  static validateSessionId(sessionId: unknown): ValidationResult {
    if (!sessionId) {
      return { isValid: true, sanitizedValue: undefined }; // Session ID is optional
    }

    if (typeof sessionId !== 'string') {
      return { isValid: false, error: 'Session ID must be a string' };
    }

    const trimmed = sessionId.trim();
    
    if (trimmed.length === 0) {
      return { isValid: true, sanitizedValue: undefined };
    }

    // UUID format validation (loose)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(trimmed)) {
      return { isValid: false, error: 'Invalid Session ID format' };
    }

    return { isValid: true, sanitizedValue: trimmed };
  }

  /**
   * Validate query parameters for conversation history
   */
  static validateConversationQuery(params: URLSearchParams): ValidationResult {
    const userId = params.get('userId');
    const sessionId = params.get('sessionId');
    const limit = params.get('limit');

    // Validate user ID
    const userIdValidation = this.validateUserId(userId);
    if (!userIdValidation.isValid) {
      return userIdValidation;
    }

    // Validate session ID (optional)
    const sessionIdValidation = this.validateSessionId(sessionId);
    if (!sessionIdValidation.isValid) {
      return sessionIdValidation;
    }

    // Validate limit
    let parsedLimit = 20; // default
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return { isValid: false, error: 'Limit must be a number between 1 and 100' };
      }
      parsedLimit = limitNum;
    }

    return {
      isValid: true,
      sanitizedValue: {
        userId: userIdValidation.sanitizedValue,
        sessionId: sessionIdValidation.sanitizedValue,
        limit: parsedLimit,
      }
    };
  }

  /**
   * Validate request body for chat endpoint
   */
  static validateChatRequest(body: unknown): ValidationResult {
    if (!body || typeof body !== 'object') {
      return { isValid: false, error: 'Request body must be a valid JSON object' };
    }

    const { message, userId, sessionId } = body as {
      message: unknown;
      userId: unknown;
      sessionId?: unknown;
    };

    // Validate message
    const messageValidation = this.validateMessage(message);
    if (!messageValidation.isValid) {
      return messageValidation;
    }

    // Validate user ID
    const userIdValidation = this.validateUserId(userId);
    if (!userIdValidation.isValid) {
      return userIdValidation;
    }

    // Validate session ID (optional)
    const sessionIdValidation = this.validateSessionId(sessionId);
    if (!sessionIdValidation.isValid) {
      return sessionIdValidation;
    }

    return {
      isValid: true,
      sanitizedValue: {
        message: messageValidation.sanitizedValue,
        userId: userIdValidation.sanitizedValue,
        sessionId: sessionIdValidation.sanitizedValue,
      }
    };
  }
}

/**
 * Content filter to detect inappropriate content
 */
export class ContentFilter {
  private static readonly INAPPROPRIATE_PATTERNS = [
    // Add patterns for inappropriate content
    /\b(spam|scam|fraud)\b/gi,
    /\b(hack|exploit|vulnerability)\b/gi,
    // Add more patterns as needed
  ];

  static isAppropriate(text: string): boolean {
    for (const pattern of this.INAPPROPRIATE_PATTERNS) {
      if (pattern.test(text)) {
        return false;
      }
    }
    return true;
  }

  static filterContent(text: string): string {
    let filtered = text;
    
    // Replace inappropriate content with asterisks
    for (const pattern of this.INAPPROPRIATE_PATTERNS) {
      filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
    }
    
    return filtered;
  }
}
