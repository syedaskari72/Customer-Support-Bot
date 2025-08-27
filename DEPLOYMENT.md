# Deployment Guide

This guide will help you deploy the Customer Support AI Chatbot to production.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file with the following variables:

```env
# AI Provider (choose one)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_api_key_here
# OR
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
MEMORY_PROVIDER=supabase
```

### 2. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and run the SQL from `supabase-schema.sql`
4. Verify tables are created: `user_sessions` and `conversations`

### 3. API Keys

#### OpenAI Setup
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add it to your environment variables

#### Anthropic Setup (Alternative)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add it to your environment variables

### 4. Local Development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Test the Setup

```bash
node test-setup.js
```

## 🌐 Production Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env.local`
   - Make sure to set `NEXT_PUBLIC_APP_URL` to your Vercel domain

### Railway

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Add Environment Variables**
   - Add all variables from your `.env.local`
   - Deploy automatically

### Netlify

1. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**
   - Add all variables from your `.env.local`

## 🔧 Configuration

### Rate Limiting

Adjust rate limits in `src/lib/rate-limiter.ts`:

```typescript
// For production, consider these limits:
export const chatRateLimiter = new RateLimiter(30, 60000); // 30 req/min
export const apiRateLimiter = new RateLimiter(200, 60000); // 200 req/min
```

### AI Provider Configuration

Switch between providers by changing the `AI_PROVIDER` environment variable:

```env
AI_PROVIDER=openai    # Use OpenAI GPT-4
# OR
AI_PROVIDER=anthropic # Use Anthropic Claude
```

### Database Configuration

For production, consider:
- Enabling Row Level Security (RLS) in Supabase
- Setting up database backups
- Monitoring database performance

## 🛡️ Security Checklist

- [ ] Environment variables are secure and not exposed
- [ ] Rate limiting is enabled
- [ ] Input validation is working
- [ ] Content filtering is active
- [ ] HTTPS is enabled in production
- [ ] Database RLS policies are configured
- [ ] API keys have appropriate permissions

## 📊 Monitoring

### Supabase Monitoring
- Monitor database usage in Supabase dashboard
- Set up alerts for high usage
- Review query performance

### Application Monitoring
- Monitor API response times
- Track error rates
- Monitor rate limit hits

### AI Provider Monitoring
- Track API usage and costs
- Monitor response quality
- Set up usage alerts

## 🔍 Troubleshooting

### Common Issues

1. **"Rate limit exceeded" errors**
   - Increase rate limits in production
   - Implement user-specific rate limiting

2. **Database connection errors**
   - Verify Supabase credentials
   - Check database URL format
   - Ensure service role key has correct permissions

3. **AI API errors**
   - Verify API key is correct
   - Check API quota and billing
   - Monitor API status pages

4. **CORS errors**
   - Ensure `NEXT_PUBLIC_APP_URL` is correct
   - Check Supabase CORS settings

### Debug Mode

Enable debug logging by adding:

```env
NODE_ENV=development
DEBUG=true
```

## 📈 Scaling Considerations

### Database Scaling
- Monitor conversation table growth
- Implement data archiving for old conversations
- Consider read replicas for high traffic

### AI API Scaling
- Implement response caching
- Use streaming responses for better UX
- Consider multiple AI provider fallbacks

### Application Scaling
- Use CDN for static assets
- Implement Redis for session storage
- Consider horizontal scaling

## 🔄 Updates and Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor AI model updates
- Review and update FAQ database
- Analyze conversation patterns

### Backup Strategy
- Database: Automated Supabase backups
- Code: Git repository with tags
- Environment: Secure backup of environment variables

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review environment variable setup
3. Verify all API keys are valid
4. Test with the provided test script

## 🎯 Performance Optimization

### Frontend
- Enable Next.js image optimization
- Use dynamic imports for large components
- Implement proper caching headers

### Backend
- Optimize database queries
- Implement response caching
- Use connection pooling

### AI Responses
- Cache common FAQ responses
- Implement response streaming
- Optimize prompt engineering

## 🔐 Security Best Practices

1. **API Security**
   - Use HTTPS only
   - Implement proper CORS
   - Validate all inputs

2. **Database Security**
   - Enable RLS policies
   - Use service role key securely
   - Regular security audits

3. **AI Security**
   - Content filtering
   - Input sanitization
   - Response validation

## 📋 Launch Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] API keys tested and working
- [ ] Rate limiting configured
- [ ] Security measures in place
- [ ] Monitoring set up
- [ ] Test script passes
- [ ] Documentation updated
- [ ] Backup strategy implemented
- [ ] Performance optimized
