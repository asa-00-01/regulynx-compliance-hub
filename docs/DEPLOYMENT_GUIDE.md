# AI Agent Edge Function Deployment Guide

## Current Issue
The AI Agent is experiencing CORS errors because the Edge Function is not deployed. Here's how to fix it:

## Quick Fix (Temporary)
The application now automatically falls back to mock responses when the Edge Function is unavailable. You can continue using the AI Agent with mock data while we deploy the function.

## Deploy the Edge Function

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Select your project

2. **Navigate to Edge Functions**
   - Go to "Edge Functions" in the left sidebar
   - Click "Create a new function"

3. **Create the Function**
   - **Name**: `ai-agent`
   - **Import method**: "Import from file"
   - Upload the file: `supabase/functions/ai-agent/index.ts`

4. **Set Environment Variables**
   - Go to Settings > API
   - Scroll to "Environment Variables"
   - Add: `OPENAI_API_KEY` = your OpenAI API key

5. **Deploy**
   - Click "Deploy" to make the function live

### Option 2: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   # Windows (using PowerShell)
   powershell -Command "iwr https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe -OutFile $env:APPDATA\supabase\supabase.exe"
   
   # Or download manually from: https://github.com/supabase/cli/releases
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Set environment variables**
   ```bash
   supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Deploy the function**
   ```bash
   supabase functions deploy ai-agent
   ```

## Test the Deployment

1. **Check if the function is deployed**
   - Go to your Supabase Dashboard > Edge Functions
   - You should see `ai-agent` in the list

2. **Test the function**
   - In your app, toggle "Use Mock Data" to OFF
   - Send a message in the AI Agent
   - Check the browser console for success messages

3. **View logs**
   - In Supabase Dashboard > Edge Functions > ai-agent > Logs
   - Or use CLI: `supabase functions logs ai-agent`

## Troubleshooting

### CORS Errors
- The function is now deployed with proper CORS headers
- If you still get CORS errors, the function might not be deployed correctly

### Function Not Found
- Make sure the function name is exactly `ai-agent`
- Check that it's deployed in the correct project

### Authentication Errors
- Ensure you're logged into the application
- Check that JWT tokens are being sent correctly

### OpenAI Errors
- Verify your OpenAI API key is correct
- Check your OpenAI account for billing issues
- The function will fall back to mock responses if OpenAI fails

## Current Status
✅ **Fixed**: CORS headers and error handling  
✅ **Fixed**: Automatic fallback to mock responses  
⏳ **Pending**: Edge Function deployment  
⏳ **Pending**: OpenAI API key configuration  

## Next Steps
1. Deploy the Edge Function using one of the methods above
2. Add your OpenAI API key to the environment variables
3. Test the integration
4. Monitor the function logs for any issues

The application will work with mock data until the Edge Function is deployed, so you can continue development and testing.
