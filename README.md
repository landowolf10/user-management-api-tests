# User API Tests – Playwright + Docker

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

### Option 2: Without Node (recommended)

Open in your browser:
http://localhost:8080

### Online Report (CI/CD)

The latest test report is automatically published via GitHub Pages:

https://landowolf10.github.io/user-management-api-tests/

## Pull Image

```
docker pull landowolf/users-api-tests:latest
```

## CI/CD Pipeline

This project includes a fully automated pipeline using GitHub Actions that:

- Runs tests using a Dockerized environment  
- Executes tests against the API  
- Generates the Playwright HTML report  
- Uploads the report as an artifact  
- Publishes the report to GitHub Pages  

## Known Issues

See bugs.md for documented issues including expected vs actual behavior and reproduction steps.

### Handling Known Bugs

Some tests are intentionally configured to NOT fail the pipeline when hitting known issues.

### Why?

- Prevents false negatives  
- Keeps pipeline stable  
- Maintains visibility of defects  
- Separates test failures from product bugs 

## Configuration

```
BASE_URL=http://api:3000
```

## Design Decisions

- Client abstraction
- Custom assertions
- Dockerized execution
- Static HTML reports