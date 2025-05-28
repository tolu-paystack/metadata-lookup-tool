"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { fetchTransactionById, fetchRefundsByTransactionId } from '@/app/services/transactionService';
import type { Transaction, Refund } from '@/types';

export default function TransactionDetail() {
  const params = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundsLoading, setRefundsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch transaction and refund data
  const fetchData = async () => {
    if (!params.id) return;
    
    try {
      // Fetch transaction details
      const transactionResponse = await fetchTransactionById(params.id.toString());
      if (transactionResponse.success && transactionResponse.data) {
        setTransaction(transactionResponse.data);
      }
      setLoading(false);
      
      // Fetch refunds for this transaction
      const refundsResponse = await fetchRefundsByTransactionId(params.id.toString());
      if (refundsResponse.success && refundsResponse.data) {
        setRefunds(refundsResponse.data);
      }
      setRefundsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setRefundsLoading(false);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Function to handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  // Fetch data on initial load
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);
  // We're deliberately excluding fetchData from dependencies to avoid infinite loops
  // while still allowing the function to be called from the refresh button

  // Format currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount / 100); // Paystack amounts are in kobo
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Transaction Not Found</h2>
              <p className="mb-6">The transaction you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link href="/" className="btn-primary">
                Back to Transactions
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="text-[var(--primary)] hover:underline flex items-center group">
              <div className="mr-2 p-1 rounded-full bg-[var(--secondary)] group-hover:bg-[var(--primary)]/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span>Back to Transactions</span>
            </Link>
            
            <button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-[var(--secondary)] hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors disabled:opacity-50"
              aria-label="Refresh transaction data"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

          <div className="border border-[var(--border)] rounded-md shadow-sm bg-[var(--card)] mb-6">
            <div className="p-6 flex justify-between items-start border-b border-[var(--border)]">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-xl font-semibold">Transaction #{transaction.id}</h1>
                  <span className={`badge ${
                    transaction.status === 'success' 
                      ? 'bg-[var(--success)]/10 text-[var(--success)]' 
                      : transaction.status === 'failed' || transaction.status === 'fail'
                      ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]'
                      : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                  }`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Reference: <span className="font-mono">{transaction.reference}</span>
                </p>
                <div className="mt-2">
                  <a 
                    href={`https://dashboard.paystack.com/#/transactions/${transaction.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-[var(--primary)] hover:underline gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    View on Paystack Dashboard
                  </a>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatAmount(transaction.amount)}</p>
                <p className="text-[var(--muted-foreground)] text-sm">{formatDate(transaction.created_at)}</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="flex items-center text-base font-semibold mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)] mr-2">
                    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                    <line x1="2" x2="22" y1="10" y2="10"></line>
                  </svg>
                  Transaction Details
                </h2>
                <div className="space-y-4">
                  <div className="border-b border-[var(--border)] pb-3">
                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">Currency</p>
                    <p className="font-medium">{transaction.currency}</p>
                  </div>
                  <div className="border-b border-[var(--border)] pb-3">
                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">Payment Channel</p>
                    <p className="font-medium">{transaction.channel}</p>
                  </div>
                  <div className="border-b border-[var(--border)] pb-3">
                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">Created At</p>
                    <p className="font-medium">{formatDate(transaction.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">Paid At</p>
                    <p className="font-medium">{formatDate(transaction.paid_at)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="flex items-center text-base font-semibold mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)] mr-2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Customer Information
                </h2>
                <div className="space-y-4">
                  <div className="border-b border-[var(--border)] pb-3">
                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">Name</p>
                    <p className="font-medium">{transaction.customer.first_name} {transaction.customer.last_name}</p>
                  </div>
                  <div className="border-b border-[var(--border)] pb-3">
                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">Email</p>
                    <p className="font-medium">{transaction.customer.email}</p>
                  </div>
                  <div className="border-b border-[var(--border)] pb-3">
                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">Phone</p>
                    <p className="font-medium">{transaction.customer.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">Customer Code</p>
                    <p className="font-mono text-sm">{transaction.customer.customer_code}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)] mr-2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <h2 className="text-lg font-semibold">Refunds</h2>
            </div>

            {refundsLoading ? (
              <div className="border border-[var(--border)] rounded-md bg-[var(--card)] shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)] mx-auto"></div>
                <p className="mt-4 text-[var(--muted-foreground)]">Loading refunds...</p>
              </div>
            ) : refunds && refunds.length > 0 ? (
              <div className="border border-[var(--border)] rounded-md bg-[var(--card)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[var(--secondary)]">
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-foreground)] uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-foreground)] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-foreground)] uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-foreground)] uppercase tracking-wider">Transaction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {refunds.map((refund) => (
                        <tr key={refund.id} className="hover:bg-[var(--accent)] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{formatAmount(refund.amount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge ${
                              refund.status === 'success' 
                                ? 'bg-[var(--success)]/10 text-[var(--success)]' 
                                : refund.status === 'failed' || refund.status === 'fail'
                                ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]'
                                : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                            }`}>
                              {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(refund.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{String(refund.transaction)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="border border-[var(--border)] rounded-md bg-[var(--card)] shadow-sm p-12 text-center">
                <div className="bg-[var(--secondary)] rounded-full p-3 inline-flex mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted-foreground)]">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p className="mt-4 text-[var(--muted-foreground)]">No refunds found for this transaction</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">When a customer requests a refund, it will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
