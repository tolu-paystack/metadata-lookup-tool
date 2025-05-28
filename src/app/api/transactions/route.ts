import { NextRequest, NextResponse } from "next/server";

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
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    metadata: Record<string, unknown>;
    customer_code: string;
  };
}

// Define the response structure from Paystack
interface PaystackResponse {
  status: boolean;
  message: string;
  data: PaystackTransaction[];
  meta: {
    total: number;
    skipped: number;
    perPage: number;
    page: number;
    pageCount: number;
  };
}

// Define our API response structure
interface ApiResponse {
  success: boolean;
  data?: {
    transactions: PaystackTransaction[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = searchParams.get("page") || "1";
    const actionId = searchParams.get("actionId");

    // Validate inputs
    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Parse ISO format dates
    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);

    // Format dates for Paystack API in ISO format
    const from = fromDate.toISOString();
    const to = toDate.toISOString();

    // Get Paystack API key from environment variable
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY environment variable is not set");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Construct the URL with query parameters
    const perPage = 50; // Ensure we always request exactly 50 per page
    const apiUrl = new URL("https://api.paystack.co/transaction");
    apiUrl.searchParams.append("perPage", perPage.toString());
    apiUrl.searchParams.append("page", page);

    if (from) apiUrl.searchParams.append("from", from);
    if (to) apiUrl.searchParams.append("to", to);

    // Make the request to Paystack API
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Paystack API error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch transactions: ${
            errorData.message || response.statusText
          }`,
        },
        { status: response.status }
      );
    }

    // Parse the response data
    const responseData: PaystackResponse = await response.json();

    // If actionId is provided, filter the transactions
    let filteredTransactions = responseData.data;
    let total = responseData.meta.total;

    if (actionId && actionId.trim() !== "") {
      // Filter transactions that have the actionId in metadata.custom_fields
      filteredTransactions = responseData.data.filter((transaction) => {
        // Check if metadata and custom_fields exist
        if (!transaction.metadata?.custom_fields || !Array.isArray(transaction.metadata.custom_fields)) {
          return false;
        }

        // Look specifically for a custom field with display_name or variable_name equal to "Action ID"
        return transaction.metadata.custom_fields.some((field) => 
          field && 
          typeof field === "object" && 
          "value" in field && 
          (field.display_name === "Action ID" || field.variable_name === "Action ID") && 
          field.value === actionId
        );
      });

      // Update the total count
      total = filteredTransactions.length;
    }

    // Calculate pagination based on filtered results
    const totalPages = Math.ceil(total / perPage);

    // Return successful response with filtered data and updated pagination
    const apiResponse: ApiResponse = {
      success: true,
      data: {
        transactions: filteredTransactions,
        pagination: {
          total: total,
          totalPages: totalPages,
          currentPage: parseInt(page),
          perPage: perPage,
        },
      },
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
