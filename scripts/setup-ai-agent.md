# AI Agent Setup Guide

This guide will help you set up the AI Agent with OpenAI integration.

## Prerequisites

1. Supabase CLI installed
2. OpenAI account with API access
3. Access to your Supabase project

## Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in to your account
3. Navigate to "API Keys" in your account settings
4. Click "Create new secret key"
5. Give it a name (e.g., "Regulynx AI Agent")
6. Copy the generated API key (it starts with `sk-`)

## Step 2: Set Environment Variables

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Scroll down to "Environment Variables"
4. Add the following variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
5. Click "Save"

### Option B: Using Supabase CLI

```bash
# Set the environment variable
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here

# Verify it's set
supabase secrets list
```

## Step 3: Deploy the Edge Function

```bash
# Deploy the AI Agent function
supabase functions deploy ai-agent

# Or deploy all functions
supabase functions deploy
```

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the AI Agent page in your application

3. Toggle "Use Mock Data" to OFF in your environment configuration

4. Send a test message like "How do I file a SAR?"

5. Check the browser console and Supabase function logs for any errors

## Step 5: Monitor Usage

### View Function Logs

```bash
# View real-time logs
supabase functions logs ai-agent --follow

# View recent logs
supabase functions logs ai-agent
```

### Check Database Logs

The AI interactions are logged to the `ai_interactions` table. You can query them:

```sql
-- View recent AI interactions
SELECT 
  user_id,
  message,
  response,
  tools_used,
  confidence,
  processing_time,
  created_at
FROM ai_interactions 
ORDER BY created_at DESC 
LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Make sure you've set the `OPENAI_API_KEY` environment variable
   - Verify the key is correct and starts with `sk-`

2. **"Authorization header required"**
   - Ensure you're logged in to the application
   - Check that the JWT token is being sent correctly

3. **"OpenAI API error"**
   - Check your OpenAI account for billing issues
   - Verify the API key has the correct permissions
   - Check OpenAI's status page for service issues

4. **Function not found**
   - Make sure you've deployed the function: `supabase functions deploy ai-agent`
   - Check that the function name matches exactly

### Testing Locally

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve

# Test with curl (replace with your actual JWT token)
curl -X POST http://localhost:54321/functions/v1/ai-agent \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I file a SAR?"}'
```

## Cost Management

- The function uses GPT-4o-mini which is cost-effective
- Each request is limited to 1000 tokens
- Failed OpenAI requests fall back to mock responses
- Monitor your OpenAI usage in the OpenAI dashboard

## Security Notes

- Never commit your OpenAI API key to version control
- Use environment variables for all sensitive data
- The function validates JWT tokens for authentication
- All interactions are logged for audit purposes

## Next Steps

Once the AI Agent is working:

1. Test various compliance scenarios
2. Monitor response quality and accuracy
3. Adjust the system prompt if needed
4. Consider implementing rate limiting
5. Set up alerts for high usage or errors
