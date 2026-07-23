# z01k-events

z01k-events is a modern event platform built with React, Vite, TanStack Router/Start, and Supabase. The project is designed to help organizers publish events, collect registrations, and manage simple content experience for attendees.

## What this project includes

- a public-facing event landing experience
- event cards and detail pages
- a registration flow backed by Supabase
- an admin experience for managing event content and gallery items
- a polished UI built with Tailwind CSS and reusable shadcn-style components

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm (or bun if you prefer)

### Install and run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Update the values in your local environment file with your own Supabase credentials before starting the app.

### Verify the build

```bash
npm run build
npm run lint
```

## Contributing

Contributions are welcome. Please start by reading [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, workflow expectations, and pull request guidance.

If you would like to help but are not sure where to start, a good entry point is:

- fixing a small bug or UI issue
- improving documentation
- polishing accessibility and responsiveness
- adding tests or improving local development ergonomics

## Community and recognition

- See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution process.
- See [CONTRIBUTORS.md](CONTRIBUTORS.md) to learn how contributors are recognized.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
