import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

interface AIRequest {
  message: string;
  context?: {
    userId?: string;
    sessionId?: string;
    conversationHistory?: Array<{
      id: string;
      content: string;
      role: 'user' | 'assistant';
      timestamp: string;
    }>;
    userPreferences?: {
      language?: string;
      expertise?: 'beginner' | 'intermediate' | 'expert';
      focus?: string[];
    };
  };
  timestamp: string;
}

interface AIResponse {
  messageId: string;
  response: string;
  tools: string[];
  confidence: number;
  sources: string[];
  processingTime: number;
}

// Mock AI responses for different categories
const mockResponses = {
  compliance: [
    {
      response: "Based on our compliance database, I can provide guidance on AML compliance. The key areas to focus on include customer due diligence, transaction monitoring, and suspicious activity reporting. Our system flags transactions above $10,000 and monitors for unusual patterns.",
      tools: ['RAG System', 'Compliance Database', 'Regulatory Updates'],
      confidence: 0.92,
      sources: ['AML Guidelines 2024', 'FATF Recommendations', 'Local Regulatory Framework']
    },
    {
      response: "I've analyzed our AML monitoring system and found relevant patterns. For transaction monitoring, the system should flag transactions above $10,000, unusual patterns, and high-risk jurisdictions. We also monitor for structuring and rapid movement of funds.",
      tools: ['AML Monitoring System', 'Risk Engine', 'Transaction Analysis'],
      confidence: 0.88,
      sources: ['Transaction Monitoring Guidelines', 'Risk Assessment Framework', 'Case Studies Database']
    }
  ],
  kyc: [
    {
      response: "For KYC procedures, you'll need to verify identity documents, assess risk level, and conduct enhanced due diligence for high-risk customers. Our system supports document verification, risk scoring, and automated compliance checks.",
      tools: ['KYC Database', 'Document Verification', 'Risk Assessment'],
      confidence: 0.89,
      sources: ['KYC Procedures Manual', 'Identity Verification Standards', 'Enhanced Due Diligence Guidelines']
    },
    {
      response: "I recommend the following approach for customer verification: Start with basic identity verification, then escalate to enhanced due diligence if risk factors are present. Our platform automates much of this process.",
      tools: ['Compliance Framework', 'Identity Verification', 'Risk Escalation'],
      confidence: 0.91,
      sources: ['Customer Verification Standards', 'Risk Escalation Procedures', 'Recent Regulatory Updates']
    }
  ],
  general: [
    {
      response: "I'm here to help with your compliance questions. I can assist with AML monitoring, KYC procedures, risk assessment, regulatory updates, and case management. What specific area would you like to explore?",
      tools: ['RAG System', 'Compliance Database'],
      confidence: 0.85,
      sources: ['General Compliance Guidelines', 'Platform Documentation']
    },
    {
      response: "I can provide guidance on various compliance topics including transaction monitoring, customer due diligence, suspicious activity reporting, and regulatory requirements. Let me know what specific information you need.",
      tools: ['Knowledge Base', 'Regulatory Database'],
      confidence: 0.87,
      sources: ['Compliance Manual', 'Regulatory Guidelines']
    }
  ]
};

// Available tools
const availableTools = [
  'RAG System', 'Compliance Database', 'Risk Engine', 'Regulatory Updates',
  'Case Management', 'AML Monitoring System', 'Transaction Analysis',
  'Customer Profiling', 'Geographic Risk Assessment', 'KYC Database',
  'Document Verification', 'Identity Verification', 'Risk Escalation',
  'Knowledge Base', 'Regulatory Database'
];

// Function to determine response category based on input
const getResponseCategory = (input: string): keyof typeof mockResponses => {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('aml') || lowerInput.includes('anti-money laundering') || 
      lowerInput.includes('transaction') || lowerInput.includes('monitoring')) {
    return 'compliance';
  } else if (lowerInput.includes('kyc') || lowerInput.includes('know your customer') || 
             lowerInput.includes('verification') || lowerInput.includes('customer')) {
    return 'kyc';
  }
  
  return 'general';
};

// Function to generate AI response
const generateAIResponse = (input: string, context?: AIRequest['context']): AIResponse => {
  const startTime = Date.now();
  const category = getResponseCategory(input);
  const responses = mockResponses[category];
  const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Generate random tools used (2-4 tools)
  const toolCount = Math.floor(Math.random() * 3) + 2;
  const shuffledTools = [...availableTools].sort(() => 0.5 - Math.random());
  const usedTools = shuffledTools.slice(0, toolCount);
  
  // Add some randomness to confidence
  const confidence = selectedResponse.confidence + (Math.random() * 0.1 - 0.05);
  const processingTime = Date.now() - startTime;
  
  return {
    messageId: `ai-${Date.now()}`,
    response: selectedResponse.response,
    tools: usedTools,
    confidence: Math.min(confidence, 1.0),
    sources: selectedResponse.sources,
    processingTime
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 AI Agent function called');
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const { message, context, timestamp }: AIRequest = await req.json();
    
    if (!message) {
      throw new Error("Message is required");
    }

    console.log('📝 Processing message:', { message, userId: user.id });

    // Generate AI response
    const response = generateAIResponse(message, context);

    // Log the interaction to database (optional)
    try {
      await supabaseClient
        .from('ai_interactions')
        .insert({
          user_id: user.id,
          message: message,
          response: response.response,
          tools_used: response.tools,
          confidence: response.confidence,
          processing_time: response.processingTime,
          created_at: new Date().toISOString()
        });
    } catch (dbError) {
      console.warn('⚠️ Failed to log interaction to database:', dbError);
      // Don't fail the request if logging fails
    }

    console.log('✅ AI response generated:', {
      messageId: response.messageId,
      tools: response.tools,
      confidence: response.confidence,
      processingTime: response.processingTime
    });

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ AI Agent error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      }
    );
  }
});
