# Customer Support AI Chatbot

A production-ready customer support chatbot built with Next.js, TypeScript, and AI integration. Features conversation memory, multilingual support (English/Hindi/Urdu), and comprehensive FAQ knowledge base for food delivery services.

## 🚀 Features

- **AI-Powered Responses**: Integration with OpenAI and Anthropic APIs
- **Conversation Memory**: Persistent chat history using Supabase
- **Multilingual Support**: English, Hindi, and Urdu language support
- **Context-Aware**: Remembers past conversations and provides relevant responses
- **FAQ Integration**: Comprehensive knowledge base for food delivery services
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Secure input handling and content filtering
- **Session Management**: Multiple conversation sessions per user
- **Responsive UI**: Clean, modern chat interface with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **AI Providers**: OpenAI GPT-4 / Anthropic Claude
- **Database**: Supabase (PostgreSQL)
- **Memory Store**: Supabase for conversation history
- **Icons**: Lucide React
- **Validation**: Custom input validation and sanitization
- **Rate Limiting**: In-memory rate limiting

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- A Supabase account and project
- Either an OpenAI API key or Anthropic API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd customer-support-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment variables in `.env.local`**:
   ```env
   # Choose your AI provider
   AI_PROVIDER=openai  # or "anthropic"
   OPENAI_API_KEY=sk-your_openai_api_key_here
   # OR
   ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here

   # Supabase configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # Memory provider
   MEMORY_PROVIDER=supabase
   ```

5. **Set up Supabase database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL commands from `supabase-schema.sql`

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The application uses Supabase for storing conversation history. Run the provided SQL schema:

```sql
-- See supabase-schema.sql for complete setup
```

Key tables:
- `user_sessions`: Manages user chat sessions
- `conversations`: Stores message history with metadata

## 🔑 API Endpoints

### Chat API
- **POST** `/api/chat`
  - Send messages and receive AI responses
  - Handles context and memory management
  - Rate limited: 20 requests/minute

### Conversations API
- **GET** `/api/conversations`
  - Retrieve conversation history
  - Query params: `userId`, `sessionId`, `limit`

### Sessions API
- **GET** `/api/sessions` - Get user sessions
- **POST** `/api/sessions` - Create new session

## 🌐 Multilingual Support

The chatbot supports three languages:

- **English**: Default language
- **Hindi**: Devanagari script and romanized Hindi
- **Urdu**: Arabic script and romanized Urdu

Language detection is automatic based on:
- Script detection (Devanagari, Arabic)
- Common word patterns
- User preference learning

## 🧠 AI Integration

### Supported Providers

1. **OpenAI** (Default)
   - Model: GPT-4
   - Context-aware responses
   - FAQ integration

2. **Anthropic**
   - Model: Claude-3-Sonnet
   - Alternative to OpenAI
   - Same feature set

### Context Management

The AI uses multiple context sources:
- Recent conversation history
- User profile and preferences
- Relevant FAQ entries
- Historical conversation patterns

## 📚 FAQ Knowledge Base

Comprehensive FAQ system covering:
- Order delays and tracking
- Refund policies
- Payment issues
- Restaurant availability
- Delivery address changes
- Cancellation policies

Each FAQ entry includes:
- Multilingual questions and answers
- Keywords for matching
- Intent classification
- Category organization

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitizes all user inputs
- **Content Filtering**: Blocks inappropriate content
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed on any platform supporting Node.js:
- Netlify
- Railway
- Heroku
- AWS
- Google Cloud

## 🔧 Configuration

### Rate Limiting
```typescript
// Adjust in src/lib/rate-limiter.ts
export const chatRateLimiter = new RateLimiter(20, 60000); // 20 req/min
```

### AI Provider Selection
```env
AI_PROVIDER=openai  # or "anthropic"
```

### Memory Provider
```env
MEMORY_PROVIDER=supabase  # Currently only Supabase supported
```

## 🧪 Testing

Example interactions to test:

1. **English**: "My order is late, what should I do?"
2. **Hindi**: "Mera order late deliver hua tha, ab kya karun?"
3. **Urdu**: "میرا آرڈر دیر سے آیا ہے"

The bot should:
- Detect language automatically
- Provide contextual responses
- Remember conversation history
- Suggest relevant solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the FAQ section
2. Review environment variable setup
3. Verify Supabase configuration
4. Check API key validity

## 🔮 Future Enhancements

- Voice message support
- File upload handling
- Advanced analytics
- Multi-tenant support
- Integration with ticketing systems
- Sentiment analysis
- Auto-escalation to human agents
