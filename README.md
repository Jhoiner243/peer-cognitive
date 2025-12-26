# Peer Cognitive

Welcome to **Peer Cognitive**, a comprehensive monorepo project designed to integrate advanced cognitive processing capabilities with a modern frontend interface.

## Project Structure

This repository is organized as a monorepo containing the following main components:

-   **`nain-pilot-front`**: The frontend application built with [Next.js](https://nextjs.org/). It serves as the user interface for interacting with the cognitive services.
-   **`server-cognit`**: The backend API service built with [NestJS](https://nestjs.com/). It handles the core logic, data processing, and AI integrations.

## Getting Started

To get started with the project, you will need to set up both the frontend and backend environments.

### Prerequisites

-   **Node.js**: Ensure you have a compatible version of Node.js installed.
-   **pnpm**: This project uses `pnpm` as the package manager.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd peer-cognitive
    ```

2.  **Install dependencies**:
    Since this is a monorepo, you may need to install dependencies for each package individually or use a workspace management tool if configured.

    *   **Frontend**:
        ```bash
        cd nain-pilot-front
        pnpm install
        ```

    *   **Backend**:
        ```bash
        cd server-cognit
        pnpm install
        ```

## Running the Project

Please refer to the specific README files in each directory for detailed instructions on running the development servers:

-   [Frontend Documentation](./nain-pilot-front/README.md)
-   [Backend Documentation](./server-cognit/README.md)
