import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-[var(--card)] text-[var(--foreground)] border-b border-[var(--border)]">
      <div className="container mx-auto px-4 flex justify-between items-center h-14">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)]">
              <path d="M4 17L10 11 4 5"></path>
              <path d="M12 19L20 19"></path>
            </svg>
            <span className="font-semibold text-lg">Paystack Lookup</span>
          </Link>
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] text-[var(--foreground)]">
              Transactions
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
