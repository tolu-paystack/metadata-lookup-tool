import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paystack Transaction Lookup Tool",
  description: "Search Paystack transactions by metadata",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
