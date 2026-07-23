# Contributing to z01k-events

Thanks for your interest in contributing to z01k-events. This project is built to be welcoming to new contributors, whether you want to fix a bug, improve the UI, or add a new feature.

## Ways to contribute

You can help in several ways:

- report bugs and share ideas through GitHub issues
- improve documentation and onboarding flow
- refine the UI and user experience
- add or improve features in the event experience
- help with accessibility, performance, and code quality

## Before you start

1. Fork the repository and create a branch from `main`.
2. Make sure you have Node.js installed locally.
3. Install dependencies with `npm install`.
4. Create the required environment variables before running the app.

## Local development setup

### 1. Install dependencies

```bash
npm install

or bun install
```

### 2. Configure environment variables

This project uses Supabase. Create a local environment file with the values for your own Supabase project:

```bash
cp .env.example .env.local
```

Then fill in the values below:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_URL=your-supabase-url
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

If you are only working on the frontend experience, the Vite Supabase variables are the minimum requirement. Server-side functions may need the service-role key as well.

### 3. Start the app

```bash
npm run dev
```

### 4. Verify your changes

Before opening a pull request, run:

```bash
npm run build
npm run lint
```

## Contribution workflow

- keep changes focused and easy to review
- write clear commit messages
- update documentation when behavior or setup changes
- include screenshots for UI changes when helpful
- open a pull request with a short summary, context, and any testing notes

## Pull request checklist

- the change is scoped to a single concern
- the app still builds locally
- linting passes
- the PR description explains the motivation and outcome

Thank you for helping make z01k-events better.
