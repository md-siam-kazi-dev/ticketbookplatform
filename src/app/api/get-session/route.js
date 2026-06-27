import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request) {
  try {
    // 1. Extract the session_id from the URL
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    // 2. Defensive check: Ensure session_id was actually passed
    if (!sessionId) {
      return NextResponse.json(
        { error: "Query parameter 'session_id' is required" },
        { status: 400 }
      );
    }

    // 3. Defensive check: Ensure your Stripe Key is loaded
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY is missing from your .env file!");
      return NextResponse.json(
        { error: "Internal server configuration error" },
        { status: 500 }
      );
    }

    // 4. Initialize Stripe inside the handler to prevent initialization crashes
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // 5. Fetch the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 6. Return the critical details back to your client side
    return NextResponse.json({
      success: true,
      transactionId: session.payment_intent, // This is your pi_... ID
      bookingId: session.metadata?.bookingId,
      userEmail: session.metadata?.userEmail,
      status: session.payment_status,
    });

  } catch (error) {
    // This will print the EXACT reason for the 500 error in your terminal
    console.error("💥 Stripe Route Crash:", error.message);
    
    return NextResponse.json(
      { error: error.message || "Failed to retrieve session" },
      { status: 500 }
    );
  }
}