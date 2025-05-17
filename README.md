# Dimino

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deployment with Docker Compose

This project can be deployed using Docker Compose. Portainer can be used externally for container management.

### Prerequisites

- Docker and Docker Compose installed on your server
- External PostgreSQL database (connection details needed)

### Deployment Steps

1. Clone the repository to your server:
   ```bash
   git clone <repository-url>
   cd dimino
   ```

2. Create a `.env` file based on the `.env.example` template:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your database connection details and other environment variables:
   ```
   DATABASE_URL="postgresql://username:password@hostname:5432/database_name"
   NEXTAUTH_SECRET="your-secure-random-string"
   NEXTAUTH_URL="https://your-domain.com"
   ```

4. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

5. Access the application at `http://your-server-ip:3002` or your configured domain.

### Database Setup

This application uses an external PostgreSQL database. Make sure your database is properly set up and accessible from the Docker container.

To initialize the database with the required schema:

```bash
docker-compose exec app npx prisma migrate deploy
```

To seed the database with initial data (including admin account):

```bash
docker-compose exec app npm run seed
```

### Admin Account

After running the seed command, an admin account will be created with the following credentials:

- Email: admin@dimino.ru
- Password: admin123

**Important:** Change the admin password after the first login for security reasons.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
