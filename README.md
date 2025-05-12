# Trading 212 Crypto Exchange

A full-stack cryptocurrency trading simulator built with React, TanStack Router, TanStack Query, Tailwind CSS, Spring Boot, and PostgreSQL.

---

## Project Overview

This project simulates a real-time crypto trading platform.  
**Key features:**
- Live price updates for multiple cryptocurrencies (via Kraken, Redis, and WebSocket)
- User registration and management
- Buy and sell crypto with instant feedback
- View portfolio holdings and transaction history
- Reset account to initial state
- Robust error handling for all user actions

**Tech stack:**
- **Frontend:** React, TanStack Router, TanStack Query, Tailwind CSS, TypeScript, Vite
- **Backend:** Spring Boot (no ORM, uses SQL queries), PostgreSQL, Redis, WebSocket, custom ingest service

---

## Data Storage

- All persistent data (users, balances, holdings, transactions) is stored in **PostgreSQL**.
- **No ORM is used**; all database access is via SQL queries (see backend source).
- DDL scripts are included in the backend for schema setup.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (for frontend)
- [Docker](https://www.docker.com/) (for full stack)
- [Java 24](https://adoptium.net/) (for backend development)

### Running the Full Stack (Docker)

To run the entire stack (frontend, backend, database, redis, ingest) with Docker:

```bash
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8080](http://localhost:8080)
- PostgreSQL: [localhost:5432](http://localhost:5432)
- Redis: [localhost:6379](http://localhost:6379)

### Running the Frontend Locally

```bash
cd frontend
npm install
npm run start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Building For Production

To build the frontend for production:

```bash
npm run build
```

---


## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.  
See [`src/styles.css`](frontend/src/styles.css) for customizations.

---

## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting.  
Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint).

```bash
npm run lint
npm run format
npm run check
```

---


## Data Fetching

- Uses [TanStack Query](https://tanstack.com/query) (`useQuery`, `useMutation`) for all API data.
- See [`src/hooks/use-ticker-updates.ts`](frontend/src/hooks/use-ticker-updates.ts) for live ticker updates.

---

## Implementation Details

### Crypto Price Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Kraken WebSocket│────►  Ingest Service │────►  Redis Cache     │
│  API            │     │                 │     │                 │
│                 │     └─────────────────┘     └────────┬────────┘
└─────────────────┘                                      │
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React State    │◄────┤  useWebSocket   │◄────┤  Spring Boot    │
│                 │     │  Hook           │     │  WebSocket      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. The Ingest Service connects to Kraken's WebSocket API
2. Price updates are processed and stored in Redis
3. Spring Boot reads from Redis and broadcasts to connected clients
4. Frontend useWebSocket hook maintains connection and updates React state
5. UI components reactively update based on the latest prices

### Trading Operation Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Trade Form     │────►│  useMutation    │────►│  API Controller │
│  Component      │     │  Hook           │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         │
┌─────────────────┐     ┌─────────────────┐     ┌────────▼────────┐
│                 │     │                 │     │                 │
│  Updated UI     │◄────┤  React Query    │◄────┤  Database       │
│                 │     │  Cache          │     │  Transaction    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. User submits a trade through the UI form
2. React Query's useMutation hook sends request to the API
3. API controller validates the trade and executes it in a database transaction against the latest bid/ask prices held in Redis
4. React Query updates its cache with the response
5. UI reactively updates to reflect the new state

### Technical Challenges & Solutions

#### 1. Real-time Price Updates

**Challenge**: Delivering live crypto prices to all connected clients efficiently.

**Solution**: Implemented a multi-stage process:
- Dedicated ingest service to handle Kraken API connection
- Redis as an intermediary cache to decouple services
- WebSocket for efficient client updates
- Custom React hook to manage connection state and reconnection logic


#### 2. State Management

**Challenge**: Maintaining a consistent application state with frequent updates.

**Solution**: 
- Used React Query for server state management
- Implemented optimistic updates for improved UX
- Automatic refetching on relevant mutations
- Custom invalidation logic to keep data fresh

#### 3. Error Handling

**Challenge**: Providing clear error feedback across all application layers.

**Solution**:
- Client-side validation with immediate feedback
- Comprehensive server-side validation with specific error messages
- Global error boundary in React
- Typed error responses from API
- Retry logic for transient failures

---

## Backend

- Spring Boot API (see [`backend/api`](backend/api))
- PostgreSQL for data storage (no ORM, uses SQL queries)
- Redis for real-time ticker data
- Ingest service for fetching live crypto prices

---

## Docker

A `docker-compose.yaml` is provided to run the full stack locally.

---

## Features

- **Live Crypto Prices:** Real-time updates from Kraken via WebSocket and Redis.
- **Trading Simulation:** Buy and sell with market prices and instant feedback.
- **Portfolio Management:** View holdings, balance, and detailed transaction history.
- **Account Reset:** Reset user account and holdings to initial state.
- **Robust Error Handling:** User-friendly error messages for all actions.

## Architecture & Design Decisions

### System Architecture

```
┌─────────────────┐         ┌─────────────────┐      ┌─────────────────┐
│                 │   WS    │                 │      │                 │
│  React Frontend │◄───────►│  Spring Boot    │◄────►│  PostgreSQL     │
│  (TypeScript)   │         │  REST API       │      │  Database       │
│                 │         │                 │      │                 │
└─────────────────┘         └────────┬────────┘      └─────────────────┘
                                     │                        
                                     │                        
                                     ▼                        
                            ┌─────────────────┐               
                            │                 │               
                            │  Redis Cache    │◄─────┐        
                            │                 │      │        
                            └─────────────────┘      │        
                                                     │        
                                                     │        
                                        ┌────────────┴────────┐
                                        │                     │
                                        │  Ingest Service     │
                                        │  (Kraken WS API)    │
                                        │                     │
                                        └─────────────────────┘
```

This architecture allows for horizontal scalability for individual components. I'm using a distributed cache to decouple the microservices.

```
[ Kraken WS Real-time Feed ]
        │
        ▼
[ Ingestion Service ] --> [ Message Bus (Redis Pub/Sub) ]
                                     │
                    ┌────────────────┴───────────────┐
                    ▼                                ▼
         [ Backend Instance 1 ]           [ Backend Instance 2 ]
                   │                                │
           [ Client WS 1, 2 ]              [ Client WS 3, 4, 5 ]
```
