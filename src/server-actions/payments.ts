"use server";
const stripe = require("stripe")(process.env.NEXT_PUBLIC_STRIPE_SECRECT_KEY);

export const createPaymentIntent = async (amount: number) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: "usd",
      description: "Car Rental Payment",
    });
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create payment intent",
    };
  }
};
