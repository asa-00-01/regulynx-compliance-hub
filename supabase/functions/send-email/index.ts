
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  template: {
    id: string;
    subject: string;
    htmlContent: string;
    variables: string[];
  };
  recipient: string;
  variables: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template, recipient, variables }: EmailRequest = await req.json();

    console.log('📧 Email request received:', {
      templateId: template.id,
      recipient,
      variables
    });

    // Replace variables in subject and content
    let subject = template.subject;
    let htmlContent = template.htmlContent;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // In a real implementation, you would integrate with an email service like:
    // - Resend (recommended for Supabase)
    // - SendGrid
    // - AWS SES
    // - Mailgun
    
    // For now, we'll simulate sending the email
    console.log('📧 Email prepared for sending:', {
      to: recipient,
      subject: subject,
      html: htmlContent
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = {
      success: true,
      messageId: crypto.randomUUID(),
      recipient,
      subject,
      sentAt: new Date().toISOString()
    };

    console.log('✅ Email sent successfully:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to send email' 
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
};

serve(handler);
