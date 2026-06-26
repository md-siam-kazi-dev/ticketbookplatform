import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your private secret key securely on the server
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { title, price, quantity,bookingId,userEmail } = await request.json();

    // Stripe expects amounts in the smallest currency unit (poisha for BDT).
    // If your booking.price is already in total Taka (e.g., 500 Taka), 
    // multiply it by 100 so Stripe charges 500.00 BDT instead of 5.00 BDT.
    const unitAmountInPoisha = Math.round(price * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      metadata: {
    
    bookingId: bookingId, // Make sure you receive this from request.json()
    userEmail: userEmail,
  },
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: title || "Event Ticket Bill",
            },
            unit_amount: unitAmountInPoisha, 
          },
          quantity: quantity || 1,
        },
      ],
      mode: "payment",
      // Stripe will send the user back here
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
    });

    console.log(session)

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}