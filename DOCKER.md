# Docker Setup for Paystack Transaction Lookup Tool

This document provides instructions for setting up and running the Paystack Transaction Lookup Tool using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your system
- A valid Paystack API Secret Key

## Getting Started

### 1. Set Up Environment Variables

First, you need to set up your environment variables with your Paystack API key:

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder with your actual Paystack Secret Key:
   ```
   PAYSTACK_SECRET_KEY=sk_your_actual_secret_key_here
   ```

### 2. Build and Run with Docker Compose

To build and start the application:

```bash
docker-compose up -d --build
```

This command:

- Builds the Docker image based on the Dockerfile
- Starts the container in detached mode
- Maps port 3001 on your host to port 3001 in the container

### 3. Accessing the Application

Once the container is running, you can access the application at:

```
http://localhost:3001
```
