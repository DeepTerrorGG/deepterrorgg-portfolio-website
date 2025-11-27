
import { NextResponse } from 'next/server';
import coinbase from 'coinbase-commerce-node';

const { Client, resources } = coinbase;

// Ensure COINBASE_API_KEY is set in your environment variables
const apiKey = process.env.COINBASE_API_KEY;

if (!apiKey) {
  console.error("CRITICAL: COINBASE_API_KEY is not set.");
} else {
  Client.init(apiKey);
}

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Payment service is not configured.' },
      { status: 503 } // Service Unavailable
    );
  }

  try {
    const { name, description, amount } = await request.json();

    if (!name || !description || !amount) {
      return NextResponse.json(
        { error: 'Missing required charge information.' },
        { status: 400 }
      );
    }
    
    // In a real app, you would associate this charge with a user or session
    const chargeData = {
      name: name,
      description: description,
      local_price: {
        amount: amount,
        currency: 'USD',
      },
      pricing_type: 'fixed_price' as 'fixed_price',
      // You would typically include redirect URLs and metadata here
      // redirect_url: 'https://yourapp.com/payment-success',
      // cancel_url: 'https://yourapp.com/payment-cancelled',
      // metadata: { customer_id: 'user123' },
    };

    const charge = await resources.Charge.create(chargeData);
    
    // Instead of returning the charge directly, we return a 402 error
    // with the necessary payment info, following the x402 standard.
    return NextResponse.json(
      {
        error: 'Payment required to proceed.',
        hosted_url: charge.hosted_url,
        code: charge.code,
      },
      { status: 402 } // HTTP 402 Payment Required
    );

  } catch (error: any) {
    console.error('Coinbase Commerce API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment charge.' },
      { status: 500 }
    );
  }
}
