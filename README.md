# 🧪 User API Tests – Playwright + Docker

Automated API testing suite built with Playwright to validate a multi-environment User Management API.

## Project Structure

```
├── src/
│   ├── clients/          # API clients (UserClient, etc.)
│   ├── config/           # ENV, test data, constants
│   ├── data/             # Static and dynamic test data
│   ├── fixtures/         # Custom Playwright fixtures
│   ├── helpers/          # Assertions, logger, utilities
│   ├── types/            # TypeScript types/interfaces
│   └── tests/            # Test suites
├── playwright-report/    # HTML report (generated after execution)
├── bugs.md               # Known issues / bugs found in the API
├── docker-compose.yml
└── README.md
```

## Getting Started

### 1. Run locally (Node.js required)

```
npm install
npm run test
```

### 2. Run with Docker (recommended)

```
docker compose up --build
```

## Test Report

### Option 1: With Playwright

```
npx playwright show-report
```

### Option 2: Without Node

Open:
http://localhost:8080

## Pull Image

```
docker pull landowolf/users-api-tests:latest
```

## Known Issues

See bugs.md for documented issues, expected vs actual results, and workarounds.

## Configuration

```
BASE_URL=http://api:3000
```

## Design Decisions

- Client abstraction
- Custom assertions
- Test data factories
- Dockerized execution
- Static HTML reports
