"use client";

import { useState } from "react";

interface SearchFormProps {
  onSearch: (params: {
    startDate: string;
    endDate: string;
    actionId?: string;
  }) => void;
  isLoading?: boolean;
  initialValues?: {
    startDate?: string;
    endDate?: string;
    actionId?: string;
    startTime?: string;
    endTime?: string;
  };
}

export default function SearchForm({
  onSearch,
  isLoading = false,
  initialValues,
}: SearchFormProps) {
  // Extract date and time from ISO strings if they exist in initialValues
  const extractDateAndTime = (
    isoString?: string
  ): { date: string; time: string } => {
    if (!isoString) return { date: "", time: "" };

    try {
      // Handle both ISO strings and date-only strings
      const dateObj = new Date(isoString);

      if (isNaN(dateObj.getTime())) {
        return { date: "", time: "" };
      }

      // Extract date part (YYYY-MM-DD)
      const date = dateObj.toISOString().split("T")[0];

      // Extract time part (HH:MM)
      let time = "00:00";
      if (isoString.includes("T")) {
        const hours = dateObj.getHours().toString().padStart(2, "0");
        const minutes = dateObj.getMinutes().toString().padStart(2, "0");
        time = `${hours}:${minutes}`;
      }

      return { date, time };
    } catch {
      // Return empty strings on error parsing date
      console.error("Error parsing date:", isoString);
      return { date: "", time: "" };
    }
  };

  // Extract values from initialValues or use defaults
  let initialStartDate = "";
  let initialStartTime = "00:00";
  let initialEndDate = "";
  let initialEndTime = "23:59";

  if (initialValues?.startDate) {
    const extracted = extractDateAndTime(initialValues.startDate);
    initialStartDate = extracted.date;
    initialStartTime = extracted.time;
  }

  if (initialValues?.endDate) {
    const extracted = extractDateAndTime(initialValues.endDate);
    initialEndDate = extracted.date;
    initialEndTime = extracted.time;
  }

  // Date states
  const [startDate, setStartDate] = useState(initialStartDate || "");
  const [endDate, setEndDate] = useState(initialEndDate || "");
  const [startTime, setStartTime] = useState(initialStartTime || "00:00");
  const [endTime, setEndTime] = useState(initialEndTime || "23:59");
  const [actionId, setActionId] = useState(initialValues?.actionId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format dates with ISO strings
    let formattedStartDate = "";
    let formattedEndDate = "";

    // Check if dates are the same
    const sameDay = startDate === endDate && startDate !== "";

    if (startDate) {
      // If dates are the same, use beginning of day for start
      const startTimeToUse = sameDay ? "00:00" : startTime;
      formattedStartDate = `${startDate}T${startTimeToUse}:00`;
    }

    if (endDate) {
      // If dates are the same, use end of day for end
      const endTimeToUse = sameDay ? "23:59" : endTime;
      formattedEndDate = `${endDate}T${endTimeToUse}:59`;
    }

    // Only include actionId if it's not empty
    const searchParams = {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      ...(actionId ? { actionId } : {}),
    };

    onSearch(searchParams);
  };

  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split("T")[0];

  // Calculate default date range (last 30 days)
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] shadow-sm mx-auto overflow-hidden gap-2">
      <div className="p-4 bg-[var(--primary)] text-white">
        <h2 className="text-lg font-semibold flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Find Transactions
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-6">
          {/* Action ID Field */}
          <div className="flex-1 min-w-0">
            <label
              htmlFor="actionId"
              className="block text-sm font-medium mb-1 text-[var(--foreground)]"
            >
              Action ID
            </label>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]"
              >
                <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <input
                id="actionId"
                type="text"
                className="pl-10 w-full bg-white border border-[var(--border)] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                value={actionId}
                onChange={(e) => setActionId(e.target.value)}
                placeholder="Enter action ID"
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="flex-1 min-w-0">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium mb-1 text-[var(--foreground)]"
            >
              From <span className="text-[var(--destructive)]">*</span>
            </label>
            <div className="flex gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]"
                  >
                    <rect
                      width="18"
                      height="18"
                      x="3"
                      y="4"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input
                    id="startDate"
                    type="date"
                    className="pl-10 w-full bg-white border border-[var(--border)] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(--foreground)]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={today}
                    placeholder={getDefaultStartDate()}
                    required
                  />
                </div>
              </div>
              <div className="w-32">
                <input
                  id="startTime"
                  type="time"
                  className="w-full bg-white border border-[var(--border)] rounded-md py-2 px-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(--foreground)]"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={startDate === endDate && startDate !== ""}
                  title={
                    startDate === endDate && startDate !== ""
                      ? "Using beginning of day for same-day search"
                      : ""
                  }
                />
              </div>
            </div>
          </div>

          {/* End Date */}
          <div className="flex-1 min-w-0">
            <label
              htmlFor="endDate"
              className="block text-sm font-medium mb-1 text-[var(--foreground)]"
            >
              To <span className="text-[var(--destructive)]">*</span>
            </label>
            <div className="flex gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]"
                  >
                    <rect
                      width="18"
                      height="18"
                      x="3"
                      y="4"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input
                    id="endDate"
                    type="date"
                    className="pl-10 w-full bg-white border border-[var(--border)] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(--foreground)]"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={today}
                    min={startDate}
                    required
                  />
                </div>
              </div>
              <div className="w-32">
                <input
                  id="endTime"
                  type="time"
                  className="w-full bg-white border border-[var(--border)] rounded-md py-2 px-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(--foreground)]"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={startDate === endDate && startDate !== ""}
                  title={
                    startDate === endDate && startDate !== ""
                      ? "Using end of day for same-day search"
                      : ""
                  }
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-1">
            <button
              type="submit"
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-md py-2 px-6 flex items-center space-x-2 transition-colors h-10 w-full md:w-auto"
              disabled={isLoading || !startDate || !endDate}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Conditional Helper Text */}
        {startDate === endDate && startDate !== "" && (
          <div className="mt-2 text-xs text-[var(--primary)] bg-[var(--primary)]/5 p-2 rounded">
            <span className="font-medium">Note:</span> Using full day (00:00 -
            23:59) for same-day search
          </div>
        )}
      </form>
    </div>
  );
}
