import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("ERROR: No stripe-signature header");
      return new Response(JSON.stringify({ error: "No signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret || "");
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: err.message });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Webhook event received", { type: event.type });

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      
      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseClient);
        break;
      
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabaseClient);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionEvent(subscription: Stripe.Subscription, supabaseClient: any) {
  logStep("Processing subscription event", { 
    subscriptionId: subscription.id, 
    status: subscription.status,
    customerId: subscription.customer 
  });

  try {
    // Get customer email
    const customer = await subscription.customer as Stripe.Customer;
    const email = customer.email;
    
    if (!email) {
      logStep("ERROR: No email found for customer", { customerId: subscription.customer });
      return;
    }

    // Get user by email
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      logStep("ERROR: User not found", { email, error: userError });
      return;
    }

    // Determine subscription tier from price
    const priceId = subscription.items.data[0].price.id;
    const price = await subscription.items.data[0].price as Stripe.Price;
    const amount = price.unit_amount || 0;
    
    let subscriptionTier = null;
    if (amount <= 9900) {
      subscriptionTier = "Starter";
    } else if (amount <= 29900) {
      subscriptionTier = "Professional";
    } else {
      subscriptionTier = "Enterprise";
    }

    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const isActive = subscription.status === 'active';

    // Update or insert subscription record
    const { error: upsertError } = await supabaseClient
      .from('subscribers')
      .upsert({
        email: email,
        user_id: userData.id,
        stripe_customer_id: subscription.customer as string,
        subscribed: isActive,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (upsertError) {
      logStep("ERROR: Failed to update subscription", { error: upsertError });
      return;
    }

    logStep("Subscription updated successfully", { 
      email, 
      tier: subscriptionTier, 
      status: subscription.status,
      endDate: subscriptionEnd 
    });
  } catch (error) {
    logStep("ERROR: Failed to process subscription event", { error: error.message });
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription, supabaseClient: any) {
  logStep("Processing subscription cancellation", { subscriptionId: subscription.id });

  try {
    const customer = await subscription.customer as Stripe.Customer;
    const email = customer.email;
    
    if (!email) {
      logStep("ERROR: No email found for customer", { customerId: subscription.customer });
      return;
    }

    // Update subscription to inactive
    const { error: updateError } = await supabaseClient
      .from('subscribers')
      .update({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    if (updateError) {
      logStep("ERROR: Failed to cancel subscription", { error: updateError });
      return;
    }

    logStep("Subscription cancelled successfully", { email });
  } catch (error) {
    logStep("ERROR: Failed to process subscription cancellation", { error: error.message });
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabaseClient: any) {
  logStep("Processing successful payment", { invoiceId: invoice.id });
  // Payment succeeded - subscription should already be active
  // This is mainly for logging purposes
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabaseClient: any) {
  logStep("Processing failed payment", { invoiceId: invoice.id });
  
  try {
    const customer = await invoice.customer as Stripe.Customer;
    const email = customer.email;
    
    if (!email) {
      logStep("ERROR: No email found for customer", { customerId: invoice.customer });
      return;
    }

    // Update subscription to reflect payment failure
    const { error: updateError } = await supabaseClient
      .from('subscribers')
      .update({
        subscribed: false,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    if (updateError) {
      logStep("ERROR: Failed to update subscription for payment failure", { error: updateError });
      return;
    }

    logStep("Payment failure processed", { email });
  } catch (error) {
    logStep("ERROR: Failed to process payment failure", { error: error.message });
  }
}
