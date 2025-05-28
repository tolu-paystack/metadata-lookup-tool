# Paystack Transaction Lookup Tool

A modern web application for searching and viewing Paystack transaction details using transaction metadata. This tool allows merchants to easily search for transactions by date range and Action ID.

## Features

- **Transaction Search**: Filter transactions by date range with precise time selection
- **Action ID Filtering**: Find transactions associated with specific Action IDs in metadata
- **Detailed Transaction View**: View comprehensive information about each transaction
- **Paystack Dashboard Integration**: Direct links to view transactions in the Paystack dashboard
- **Refund Information**: View and manage refund details for transactions

## Environment Setup

Before running the application, create a `.env.local` file in the root directory with the following variables:

```
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
```

## Getting Started

### Local Development

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Production Build

To create a production build:

```bash
npm run build
npm start
```

## Docker Deployment

This application can be easily deployed using Docker. For detailed instructions, see the [Docker Setup Guide](./DOCKER.md).

Quick start:

```bash
# Copy the environment example
cp env.example .env

# Add your Paystack Secret Key to the .env file

# Build and run with Docker Compose
docker-compose up -d --build
```

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org) with TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: Paystack API
- **Containerization**: Docker

## Action ID Format

This tool looks for Action IDs in transaction metadata with the following structure:

```javascript
metadata: {
  "custom_fields": [
    {
      "display_name": "Action ID",
      "variable_name": "Action ID",
      "value": "ACT-123"  // The actual action ID
    }
  ]
}
```
