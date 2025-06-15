
# Welcome to Regulynx - Your Compliance Management System

**URL**: https://lovable.dev/projects/d23357aa-9dfa-4716-8772-f29155c8dd81

This project is a comprehensive Compliance Management System designed to help organizations manage KYC/AML processes, monitor transactions, analyze risks, and ensure regulatory compliance.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)

## Project Overview

Regulynx is a modern, AI-powered web application for compliance professionals. It provides tools for:
-   **Know Your Customer (KYC)**: Verifying customer identities and assessing risk.
-   **Anti-Money Laundering (AML)**: Monitoring transactions for suspicious activity.
-   **Risk Management**: Using a configurable rule engine to score users and transactions.
-   **Case Management**: Tracking and managing compliance cases.
-   **Reporting**: Generating Suspicious Activity Reports (SARs).

## Key Features

-   **Dashboard**: A central overview of key compliance metrics.
-   **AI Agent**: An AI-powered assistant to help with compliance queries.
-   **News Feed**: Stays up-to-date with relevant compliance news.
-   **KYC Verification**: A dedicated module for managing user verification processes.
-   **Transaction Monitoring**: Real-time monitoring and analysis of transactions.
-   **Risk Analysis**: Advanced tools for risk scoring and pattern detection.
-   **Compliance Case Management**: A system for creating, assigning, and resolving cases.
-   **User Management**: Tools for administrators to manage system users.

## Architecture

The application follows a modern web architecture, separating frontend and backend concerns.

### Frontend

-   **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/) for a fast development experience.
-   **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety.
-   **UI Components**: Built with [shadcn/ui](https://ui.shadcn.com/), a collection of re-usable components.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS approach.
-   **Routing**: [React Router](https://reactrouter.com/) for client-side navigation.
-   **State Management**: [React Context](https://reactjs.org/docs/context.html) for global state (like authentication) and [TanStack Query](https://tanstack.com/query) for managing server state, caching, and data fetching.

### Backend (via Supabase)

-   **Database**: [Supabase](https://supabase.com/) provides a PostgreSQL database for data persistence.
-   **Authentication**: Supabase Auth handles user authentication and management.
-   **APIs**: Business logic is encapsulated in services (`src/services`) that interact with the Supabase database.
-   **Edge Functions**: Serverless functions can be used for custom backend logic that needs to run on the server.

## Directory Structure

The project is organized to promote separation of concerns and maintainability.

```
/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components (UI, layout, features)
│   ├── config/          # Application configuration (e.g., environment variables)
│   ├── context/         # React context providers (e.g., Auth, Compliance)
│   ├── hooks/           # Custom React hooks
│   ├── i18n/            # Internationalization (i18n) files
│   ├── integrations/    # Third-party integrations (e.g., Supabase client)
│   ├── lib/             # Utility functions and libraries
│   ├── pages/           # Top-level page components for each route
│   ├── services/        # Business logic, API calls, data transformation
│   ├── types/           # TypeScript type definitions
│   └── main.tsx         # Main application entry point
├── supabase/            # Supabase migrations and configuration
└── README.md            # This file
```

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) and npm
-   An account with [Lovable](https://lovable.dev) to interact with the AI editor.

### Local Development

If you want to work locally using your own IDE, you can clone this repo and push changes.

```sh
# Step 1: Clone the repository.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies.
npm install

# Step 4: Start the development server.
npm run dev
```

The application will be available at `http://localhost:8080`.

## Configuration

The application's configuration is managed in `src/config/environment.ts`. This file reads from Vite environment variables (`.env` files).

For detailed production deployment configuration, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Testing

This project uses [Vitest](https://vitest.dev/) for unit and component testing, along with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

-   Test files are co-located with the source files they are testing (e.g., `MyComponent.test.tsx`).
-   To run all tests, use the command: `npm test`
-   To run tests in watch mode: `npm run test:watch`
-   To see a UI for test results: `npm run test:ui`

## Deployment

This project can be deployed through the Lovable platform. Click on **Share -> Publish** in the Lovable editor.

For instructions on deploying to other platforms like Vercel, Netlify, or using Docker, please refer to the [DEPLOYMENT.md](./DEPLOYMENT.md) file.
