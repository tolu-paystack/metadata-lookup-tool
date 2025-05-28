export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  customer_code: string;
}

export interface TransactionMetadata {
  action_id?: string;
  custom_fields?: {
    name: string;
    value: string;
  }[];
  [key: string]: string | number | boolean | object | null | undefined; // Allow for additional fields in metadata including undefined
}

export interface Transaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'fail' | 'pending' | 'abandoned';
  metadata: TransactionMetadata;
  customer: Customer;
  created_at: string;
  paid_at: string | null;
  channel: string;
}

export interface Refund {
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
