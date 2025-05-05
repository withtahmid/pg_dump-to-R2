# PostgreSQL to R2 Backup Service

A TypeScript-based Express service that creates backups of PostgreSQL databases and streams them directly to Cloudflare R2 storage. Built for Docker deployment on Amazon Lightsail.

## Features

-   RESTful API endpoint to trigger database backups
-   Direct streaming from PostgreSQL to R2 (no local storage required)
-   API key authentication for secure access
-   Containerized with Docker for easy deployment
-   Health check endpoint for monitoring
-   Detailed logging for tracking backup status
-   Uses pnpm for efficient package management

## Requirements

-   Node.js 14+ (for local development)
-   pnpm package manager
-   Docker and Docker Compose (for containerized deployment)
-   PostgreSQL client tools
-   Cloudflare R2 storage bucket and credentials
-   PostgreSQL database to backup

## Quick Start

### Local Development

1. **Clone this repository:**

```bash
git clone https://github.com/yourusername/pg-r2-backup-service.git
cd pg-r2-backup-service
```

2. **Install dependencies:**

```bash
# Install pnpm if you don't have it
corepack enable
corepack prepare pnpm@8.9.0 --activate

# Install project dependencies
pnpm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
# Edit the .env file with your credentials
```

4. **Build and start the service:**

```bash
pnpm build
pnpm start
```

For development with automatic reloading:

```bash
pnpm dev
```

### Docker Deployment

1. **Build and start with Docker Compose:**

```bash
docker-compose up -d
```

This will:

-   Build the Docker image with pnpm
-   Start the container with environment variables from your .env file
-   Expose the service on port 3000

## API Usage

### Trigger a Backup

```
POST /api/backup
Header: x-api-key: your-api-key
```

**Response:**

```json
{
    "success": true,
    "message": "Backup process started",
    "filename": "backup_2025-05-04_12-34-56.sql",
    "startTime": "2025-05-04T12:34:56.789Z"
}
```

The backup process will continue in the background. Check the container logs for progress and completion status.

### Health Check

```
GET /health
```

**Response:**

```json
{
    "status": "OK",
    "timestamp": "2025-05-04T12:34:56.789Z"
}
```

## Deployment to Amazon Lightsail

1. **Create a new Lightsail container service**

2. **Push the Docker image to your container service:**

```bash
# Configure AWS CLI with your credentials
aws lightsail push-container-image --service-name your-service-name --label backup-service --image backup-service:latest
```

3. **Deploy using the Lightsail console or CLI, providing your environment variables**

## Logging

The service logs detailed information about the backup process:

-   Backup start/completion
-   Upload progress
-   Errors during the process

Check the logs using:

```bash
# For Docker deployment
docker logs pg-r2-backup-service

# For Lightsail
aws lightsail get-container-log --service-name your-service-name --container-name backup-service
```

## Security Considerations

-   Always use a strong, random API key
-   Consider setting up network rules to restrict access to the service
-   Ensure PostgreSQL credentials have minimal required permissions
-   Keep your R2 credentials secure

## License

MIT
