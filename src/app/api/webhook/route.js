import { NextResponse } from "next/server";
import Stripe from "stripe";
// Import your database connections / models here
// import { db } from "@/lib/db"; 
// import { Booking, Transaction } from "@/models";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;

  try {
    // Verify that the event actually came from Stripe safely
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook Signature verification failed:`, err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the completed checkout session event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Extract metadata passed during checkout creation
    const { bookingId, userEmail } = session.metadata;
    const amountPaid = session.amount_total / 100; // Convert poisha back to Taka
    const transactionId = session.payment_intent;   // Stripe's unique payment tracking ID

    try {
      console.log(`🔔 Processing payment for Booking: ${bookingId}`);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/paidbooking`,{
        method:'PATCH',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            isPaid:true,
            paymentDate:new Date(),
            transactionId,
            bookingId,
        })
      })

     
      console.log(`✅ Database successfully updated for booking ${bookingId}`);
    } catch (dbError) {
      console.error("❌ Database update failed:", dbError);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}