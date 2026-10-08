# Sangli Soybean Advisory - Frontend

This is the frontend application for the Sangli Soybean Advisory system. It is built with React, Vite, TypeScript, and Tailwind CSS. It communicates with the FastAPI backend.

## Tech Stack
- React 18 + Vite
- TypeScript
- Tailwind CSS v4
- React Router DOM
- React Query (TanStack Query)
- React Hook Form + Zod
- Recharts
- i18next (English, Marathi, Hindi)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Variables:
   Copy `.env.example` to `.env` if you need to change the backend URL.
   ```
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```
   By default, it uses `http://127.0.0.1:8000`.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Pointing to a Deployed Backend
To point the app to a deployed backend, create a `.env` file in the root of the `frontend` folder and set the variable:
```
VITE_API_BASE_URL=https://your-deployed-backend-url.com
```
Then run `npm run build`.
