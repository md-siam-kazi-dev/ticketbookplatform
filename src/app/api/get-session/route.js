import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    // Retrieve the session from Stripe using the ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Return the metadata and payment details back to the client
    return NextResponse.json({
      metadata: session.metadata,
      paymentStatus: session.payment_status,
      amount: session.amount_total / 100,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}