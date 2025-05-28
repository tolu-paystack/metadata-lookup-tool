import { NextRequest, NextResponse } from 'next/server';

// Define the Paystack transaction interface
interface PaystackTransaction {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: Record<string, unknown>;
  log: {
    time_spent: number;
    attempts: number;
    authentication: string;
    errors: number;
    success: boolean;
    mobile: boolean;
    input: Array<unknown>;
    channel: string;
    history: Array<{
      type: string;
      message: string;
      time: number;
    }>;
  };
  fees: number;
  fees_split: number | null;
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
    account_name: string | null;
  };
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    metadata: Record<string, unknown>;
    customer_code: string;
  };
  plan: Record<string, unknown> | null;
  subaccount: Record<string, unknown> | null;
  split: Record<string, unknown> | null;
  order_id: string | null;
  requested_amount: number;
  pos_transaction_data: Record<string, unknown> | null;
}

// Define the response structure from Paystack
interface PaystackResponse {
  status: boolean;
  message: string;
  data: PaystackTransaction;
}

// Define our API response structure
interface ApiResponse {
  success: boolean;
  data?: PaystackTransaction;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    
    // Validate input
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    // Get Paystack API key from environment variable
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Make the request to Paystack API
    const response = await fetch(`https://api.paystack.co/transaction/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Paystack API error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch transaction: ${errorData.message || response.statusText}` 
        },
        { status: response.status }
      );
    }
    
    // Parse the response data
    const responseData: PaystackResponse = await response.json();
    
    // Return successful response with data
    const apiResponse: ApiResponse = {
      success: true,
      data: responseData.data,
    };
    
    return NextResponse.json(apiResponse);
    
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}
