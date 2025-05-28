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
   cp env.example .env
   ```

2. Edit the `.env` file and replace the placeholder with your actual Paystack Secret Key:
   ```
   PAYSTACK_SECRET_KEY=sk_your_actual_secret_key_here
   ```

> **IMPORTANT**: Keep your Paystack Secret Key confidential. Never commit it to version control or share it publicly.

### 2. Build and Run with Docker Compose

To build and start the application:

```bash
docker-compose up -d --build
```

This command:
- Builds the Docker image based on the Dockerfile
- Starts the container in detached mode
- Maps port 3000 on your host to port 3000 in the container

### 3. Accessing the Application

Once the container is running, you can access the application at:

```
http://localhost:3000
```

### 4. Managing the Container

**Stop the container:**
```bash
docker-compose down
```

**View container logs:**
```bash
docker-compose logs -f
```

**Restart the container:**
```bash
docker-compose restart
```

## Troubleshooting

### API Key Issues

If you see errors related to authentication or authorization when using the application, check that:

1. You've set the correct Paystack Secret Key in your `.env` file
2. The API key has the necessary permissions to access transaction data
3. The environment variable is being passed correctly to the container

### Container Won't Start

If the container fails to start:

1. Check the logs: `docker-compose logs`
2. Verify that port 3000 isn't already in use on your host machine
3. Ensure Docker has sufficient resources allocated

## Security Notes

- The Dockerfile is configured to run the application as a non-root user for better security
- Your Paystack API key is passed to the container via environment variables and not baked into the image
- For production use, consider using Docker secrets or a vault solution for managing sensitive credentials

## Customization

To change the port mapping, edit the `docker-compose.yml` file and modify the `ports` section:

```yaml
ports:
  - "YOUR_DESIRED_PORT:3000"
```

## Updating the Application

When new versions of the application are available:

1. Pull the latest code changes
2. Rebuild the Docker image:
   ```bash
   docker-compose up -d --build
   ```
