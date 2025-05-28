import Link from 'next/link';
import type { Transaction } from '@/types';

interface TransactionCardProps {
  transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  // Format the amount to currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount / 100); // Paystack amounts are in kobo
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Link href={`/transactions/${transaction.id}`} className="block">
      <div className="flex items-center border-b border-[var(--border)] hover:bg-[var(--accent)] transition-colors py-3 px-4 cursor-pointer">
        <div className="flex-1 min-w-0 truncate">
          <span className="font-medium">{transaction.customer.email}</span>
        </div>
        
        <div className="flex-1 min-w-0 truncate hidden md:block">
          <span className="text-sm">{transaction.reference}</span>
        </div>
        
        <div className="flex-none w-24 text-center">
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
        
        <div className="flex-none w-28 text-right">
          <span className="font-medium">{formatAmount(transaction.amount)}</span>
        </div>
        
        <div className="flex-1 text-sm text-[var(--muted-foreground)] text-right hidden md:block">
          {formatDate(transaction.created_at)}
        </div>
        
        <div className="flex-none w-8 text-center text-[var(--muted-foreground)] ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </div>
      </div>
    </Link>
  );
}
