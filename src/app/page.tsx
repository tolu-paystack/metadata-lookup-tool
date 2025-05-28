"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SearchForm from "./components/SearchForm";
import TransactionCard from "./components/TransactionCard";
import { fetchTransactionsByDateRange } from "./services/transactionService";
import type { Transaction } from "@/types";

interface StoredSearchParams {
  startDate: string;
  endDate: string;
  actionId?: string;
  page: number;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [searchParams, setSearchParams] = useState<{
    startDate: string;
    endDate: string;
    actionId?: string;
  } | null>(null);

  // Load saved search parameters when the component mounts
  useEffect(() => {
    const loadSavedSearch = async () => {
      // Check if we're in a browser environment
      if (typeof window !== "undefined") {
        const savedSearch = localStorage.getItem("transactionSearchParams");

        if (savedSearch) {
          try {
            const parsedParams = JSON.parse(savedSearch) as StoredSearchParams;
            setSearchParams({
              startDate: parsedParams.startDate,
              endDate: parsedParams.endDate,
              actionId: parsedParams.actionId,
            });
            setCurrentPage(parsedParams.page || 1);

            // Execute the search with saved parameters
            await performSearch(
              parsedParams.startDate,
              parsedParams.endDate,
              parsedParams.page || 1,
              parsedParams.actionId
            );

            setSearchPerformed(true);
          } catch (error) {
            console.error("Error parsing saved search parameters:", error);
            localStorage.removeItem("transactionSearchParams");
          }
        }
      }
    };

    loadSavedSearch();
  }, []);

  // Function to perform search and handle API response
  const performSearch = async (
    startDate: string,
    endDate: string,
    page: number = 1,
    actionId?: string
  ) => {
    setIsLoading(true);

    try {
      const response = await fetchTransactionsByDateRange(
        startDate,
        endDate,
        page,
        actionId
      );

      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.totalPages);
        setTotalResults(response.data.pagination.total);
      } else {
        console.error("Error fetching transactions:", response.error);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error performing search:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async ({
    startDate,
    endDate,
    actionId,
  }: {
    startDate: string;
    endDate: string;
    actionId?: string;
  }) => {
    const newParams = { startDate, endDate, actionId };
    setSearchParams(newParams);
    setCurrentPage(1); // Reset to first page on new search

    // Save search parameters to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "transactionSearchParams",
        JSON.stringify({
          ...newParams,
          page: 1,
        })
      );
    }

    await performSearch(startDate, endDate, 1, actionId);
    setSearchPerformed(true);
  };

  const handlePageChange = async (newPage: number) => {
    if (
      !searchParams ||
      newPage < 1 ||
      newPage > totalPages ||
      newPage === currentPage
    )
      return;

    // Save the new page to localStorage
    if (typeof window !== "undefined" && searchParams) {
      localStorage.setItem(
        "transactionSearchParams",
        JSON.stringify({
          ...searchParams,
          page: newPage,
        })
      );
    }

    setCurrentPage(newPage);
    await performSearch(
      searchParams.startDate,
      searchParams.endDate,
      newPage,
      searchParams.actionId
    );
  };

  // Generate pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageButtons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pageButtons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="px-3 py-2 rounded border border-border disabled:opacity-50"
        aria-label="Previous page"
      >
        &laquo;
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={i === currentPage || isLoading}
          className={`px-3 py-2 rounded ${
            i === currentPage ? "bg-primary text-white" : "border border-border"
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pageButtons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="px-3 py-2 rounded border border-border disabled:opacity-50"
        aria-label="Next page"
      >
        &raquo;
      </button>
    );

    return (
      <div className="flex justify-center space-x-2 mt-6">{pageButtons}</div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="max-w-4xl mx-auto">
          <SearchForm
            onSearch={handleSearch}
            isLoading={isLoading}
            initialValues={searchParams || undefined}
          />

          {searchPerformed && (
            <div className="mt-8">
              {isLoading && transactions.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 card">
                  <p className="text-lg mb-2">No transactions found</p>
                  <p className="text-muted-foreground">
                    No transactions found in the selected date range.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold">Search Results</h2>
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * 50 + 1}-
                        {Math.min(currentPage * 50, totalResults)} of{" "}
                        {totalResults} transaction
                        {totalResults !== 1 ? "s" : ""}
                      </p>
                      {searchParams?.actionId && (
                        <div className="mt-1 inline-flex items-center py-1 px-2 rounded-md bg-primary/10 text-primary text-xs">
                          <span className="mr-1">Filtered by Action ID:</span>
                          <span className="font-medium">
                            {searchParams.actionId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border border-[var(--border)] rounded-md overflow-hidden">
                    {/* Table header */}
                    <div className="flex items-center bg-[var(--secondary)] border-b border-[var(--border)] py-3 px-4 font-medium text-sm text-[var(--secondary-foreground)]">
                      <div className="flex-1 min-w-0">Customer Email</div>

                      <div className="flex-1 min-w-0 hidden md:block">
                        Reference
                      </div>

                      <div className="flex-none w-24 text-center">Status</div>

                      <div className="flex-none w-28 text-right">Amount</div>

                      <div className="flex-1 text-right hidden md:block">
                        Date
                      </div>

                      <div className="flex-none w-8 text-center ml-2">
                        {/* Empty header for actions column */}
                      </div>
                    </div>

                    {/* Table body */}
                    <div>
                      {transactions.map((transaction) => (
                        <TransactionCard
                          key={transaction.id}
                          transaction={transaction}
                        />
                      ))}
                    </div>
                  </div>

                  {renderPagination()}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
