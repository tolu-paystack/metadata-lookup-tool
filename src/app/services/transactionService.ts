import type { Transaction, Refund } from "@/types";

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

interface TransactionsListResponse {
  success: boolean;
  data?: {
    transactions: Transaction[];
    pagination: PaginationData;
  };
  error?: string;
}

interface SingleTransactionResponse {
  success: boolean;
  data?: Transaction;
  error?: string;
}

interface RefundsResponse {
  success: boolean;
  data?: Refund[];
  error?: string;
}

/**
 * Fetches a list of transactions based on date range with pagination
 * and optionally filters by Action ID
 */
export async function fetchTransactionsByDateRange(
  startDate: string,
  endDate: string,
  page: number = 1,
  actionId?: string
): Promise<TransactionsListResponse> {
  try {
    // Build the query string with date range, pagination, and optional actionId
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (actionId) queryParams.append("actionId", actionId);
    queryParams.append("page", page.toString());

    // Make the request to our API endpoint
    const response = await fetch(`/api/transactions?${queryParams.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch transactions");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Fetches a single transaction by ID
 */
export async function fetchTransactionById(
  id: string | number
): Promise<SingleTransactionResponse> {
  try {
    // Make the request to our API endpoint
    const response = await fetch(`/api/transactions/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch transaction");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Fetches refunds for a transaction
 */
export async function fetchRefundsByTransactionId(
  id: string | number
): Promise<RefundsResponse> {
  try {
    // Make the request to our API endpoint
    const response = await fetch(`/api/transactions/${id}/refunds`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch refunds");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching refunds for transaction ${id}:`, error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
