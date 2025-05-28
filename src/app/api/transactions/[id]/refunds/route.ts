import { NextRequest, NextResponse } from 'next/server';

// Define the Paystack refund interface
interface PaystackRefund {
  id: number;
  domain: string;
  transaction: number;
  status: string;
  amount: number;
  currency: string;
  channel: string;
  customer_note: string;
  merchant_note: string;
  dispute: number;
  integration: number;
  deducted_amount: number | null;
  settlement: number | null;
  created_at: string;
  updated_at: string;
}

// Define the response structure from Paystack
interface PaystackResponse {
  status: boolean;
  message: string;
  data: PaystackRefund[];
}

// Define our API response structure
interface ApiResponse {
  success: boolean;
  data?: PaystackRefund[];
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const id = (await params).id;
    
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
    // Paystack doesn't have a direct endpoint to get refunds by transaction ID,
    // so we'll fetch all refunds and filter by transaction ID
    const response = await fetch(`https://api.paystack.co/refund`, {
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
          error: `Failed to fetch refunds: ${errorData.message || response.statusText}` 
        },
        { status: response.status }
      );
    }
    
    // Parse the response data
    const responseData: PaystackResponse = await response.json();
    
    // Filter refunds for the specific transaction
    const transactionIdNumber = parseInt(id, 10);
    const filteredRefunds = responseData.data.filter(
      refund => refund.transaction === transactionIdNumber
    );
    
    // Return successful response with data
    const apiResponse: ApiResponse = {
      success: true,
      data: filteredRefunds,
    };
    
    return NextResponse.json(apiResponse);
    
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch refunds' },
      { status: 500 }
    );
  }
}
