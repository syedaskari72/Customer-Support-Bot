export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  intent: string;
}

export const FAQ_DATABASE: FAQItem[] = [
  {
    id: 'delivery-delay-1',
    category: 'delivery',
    question: 'My order is late, what should I do?',
    answer: 'I understand your frustration with the delayed order. Let me help you track it and provide a solution. You can get a refund or free delivery credit for future orders.',
    keywords: ['late', 'delay', 'slow', 'delayed', 'taking long'],
    intent: 'delivery_delay'
  },
  {
    id: 'refund-policy-1',
    category: 'refund',
    question: 'How do I get a refund for my order?',
    answer: 'You can request a refund within 24 hours of order placement. Refunds are processed within 3-5 business days. For immediate assistance, I can initiate the refund process for you right now.',
    keywords: ['refund', 'money back', 'return', 'reimburse', 'compensation'],
    intent: 'refund_request'
  },
  {
    id: 'order-tracking-1',
    category: 'tracking',
    question: 'How can I track my order?',
    answer: 'You can track your order in real-time through our app or website. I can also provide you with the current status and estimated delivery time right now.',
    keywords: ['track', 'where', 'status', 'location', 'progress'],
    intent: 'order_tracking'
  },
  {
    id: 'cancel-order-1',
    category: 'cancellation',
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order within 5 minutes of placing it. After that, cancellation depends on the restaurant preparation status. I can help you cancel it right now if it\'s still possible.',
    keywords: ['cancel', 'stop', 'abort', 'remove'],
    intent: 'cancellation'
  },
  {
    id: 'payment-issue-1',
    category: 'payment',
    question: 'My payment failed, what should I do?',
    answer: 'Don\'t worry! Payment failures can happen due to network issues or bank problems. You can try again with the same payment method or use a different one. Your order is still reserved for 10 minutes.',
    keywords: ['payment', 'failed', 'transaction', 'billing', 'charge'],
    intent: 'payment_issue'
  },
  {
    id: 'restaurant-closed-1',
    category: 'restaurant',
    question: 'The restaurant is showing as closed, but I want to order',
    answer: 'I understand your disappointment. Restaurants have specific operating hours and may close early due to high demand or other reasons. I can suggest similar restaurants that are currently open and accepting orders.',
    keywords: ['closed', 'not available', 'unavailable', 'shut'],
    intent: 'restaurant_availability'
  },
  {
    id: 'delivery-address-1',
    category: 'delivery',
    question: 'Can I change my delivery address?',
    answer: 'You can change your delivery address within 5 minutes of placing the order, provided the new address is within our delivery zone. After that, changes may not be possible as the restaurant starts preparing your order.',
    keywords: ['address', 'location', 'change', 'update', 'modify'],
    intent: 'address_change'
  }
];

export class FAQMatcher {
  /**
   * Find relevant FAQ items based on user message
   */
  static findRelevantFAQs(message: string): FAQItem[] {
    const lowerMessage = message.toLowerCase();
    const matchedFAQs: Array<{ faq: FAQItem; score: number }> = [];

    FAQ_DATABASE.forEach(faq => {
      let score = 0;

      // Check keyword matches
      faq.keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          score += 3;
        }
      });

      // Check question matches
      const questionWords = faq.question.toLowerCase().split(' ');
      questionWords.forEach(word => {
        if (lowerMessage.includes(word) && word.length > 3) {
          score += 1;
        }
      });

      // Check answer matches
      const answerWords = faq.answer.toLowerCase().split(' ');
      answerWords.forEach(word => {
        if (lowerMessage.includes(word) && word.length > 4) {
          score += 0.5;
        }
      });

      if (score > 0) {
        matchedFAQs.push({ faq, score });
      }
    });

    // Return top 3 most relevant FAQs
    return matchedFAQs
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.faq);
  }

  /**
   * Generate context string from relevant FAQs
   */
  static generateFAQContext(faqs: FAQItem[]): string {
    if (faqs.length === 0) {
      return '';
    }

    let context = '\n\nRelevant FAQ Information:\n';
    faqs.forEach((faq, index) => {
      context += `${index + 1}. ${faq.category.toUpperCase()}: ${faq.answer}\n`;
    });

    return context;
  }
}
