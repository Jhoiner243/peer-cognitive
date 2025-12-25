# Peer Cognitive API

**Peer Cognitive API** is the robust backend service for the Peer Cognitive platform, built with [NestJS](https://nestjs.com/). It provides the essential endpoints and processing logic to support the frontend application and handle cognitive tasks.

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [Running the App](#running-the-app)
-   [Test](#test)
-   [Technology Stack](#technology-stack)

## Prerequisites

Before you begin, ensure you have met the following requirements:

-   **Node.js**: The active LTS version is recommended.
-   **pnpm**: We use pnpm for efficient package management.

## Installation

To install the project dependencies, navigate to the `server-cognit` directory and run:

```bash
pnpm install
```

## Running the App

### Development

To start the application in development mode with hot-reload enabled:

```bash
pnpm run start:dev
```

### Production

To build and start the application for production:

```bash
pnpm run build
pnpm run start:prod
```

## Test

To run the automated tests for the API:

```bash
# specialized unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

## Technology Stack

-   **Framework**: [NestJS](https://nestjs.com/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Testing**: [Jest](https://jestjs.io/)
-   **Validation**: `class-validator`, `class-transformer`
