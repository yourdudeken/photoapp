# PhotoApp

A full-stack media management application that allows users to capture photos and videos, view them in a gallery, and authenticate users via QR codes. This project is built as a monorepo containing both the web frontend and the backend server.

## Overview

PhotoApp provides a seamless experience for capturing and managing media. Users can:

-   Create an account and log in securely.
-   Use the **Capture** feature to take photos or record videos directly from the browser.
-   View their media in a responsive **Gallery** with filtering capabilities.
-   Log in to other devices using the **QR Login** feature.
-   Manage their account settings and theme preferences (Dark/Light mode).

## Structure

This project is organized as a monorepo using npm workspaces:

-   **`apps/web`**: The React frontend application.
-   **`apps/server`**: The Node.js/Express backend server.

## Technologies

### Frontend (`apps/web`)

-   **React**: UI library for building the interface.
-   **React Router**: Handling client-side navigation.
-   **Context API**: Managing application state (Theme, Toast notifications).
-   **CSS**: Custom styling with meaningful variable names and responsive design.

### Backend (`apps/server`)

-   **Node.js & Express**: API server.
-   **PostgreSQL**: Relational database for user and media metadata.
-   **Knex.js**: SQL query builder.
-   **Multer**: Middleware for handling file uploads.
-   **JWT**: JSON Web Tokens for secure authentication.

## Prerequisites

-   Node.js (v16 or higher)
-   npm (v8 or higher)
-   PostgreSQL database running locally or accessible via network.
-   (Optional) Docker, if you prefer running services in containers.

## Getting Started

### 1. Installation

Install all dependencies for both the root, server, and web workspaces:

```bash
npm run install:all
```

### 2. Environment Configuration

Create a `.env` file in the root directory and configure the following variables. You can use `.env.example` as a reference if available.

**General**

-   `PORT`: Server port (default: 5000)
-   `CORS_ORIGIN`: URL of the frontend (default: http://localhost:3000)

**Database (PostgreSQL)**

-   `PGHOST`: Database host (default: localhost)
-   `PGUSER`: Database user (default: postgres)
-   `PGPASSWORD`: Database password
-   `PGDATABASE`: Database name (default: photoapp)
-   `PGPORT`: Database port (default: 5433)

**Storage**

-   `STORAGE_TYPE`: 'local' or 's3' (default: local)
-   `LOCAL_MEDIA_PATH`: Path to store media files (default: ./media)

### 3. Database Setup

Ensure your PostgreSQL database is running and the database specified in `PGDATABASE` exists. The application uses Knex for database interactions. You may need to run migrations if provided in the `apps/server` directory.

### 4. Running the Application

To run both the backend server and the frontend client concurrently in development mode:

```bash
npm run dev
```

-   **Frontend**: http://localhost:3000
-   **Backend**: http://localhost:5000

## key Features

### Authentication

-   **Register/Login**: Standard username/password authentication.
-   **QR Login**: Generate a QR code on an authenticated device and scan it with another device to log in instantly.

### Media Capture

-   **Camera Access**: Request permission to access the user's camera.
-   **Photo**: Capture high-quality still images.
-   **Video**: Record video clips with audio.
-   **Aspect Ratios**: Toggle between different aspect ratios (1:1, 4:3, 16:9, etc.) for framing.

### Gallery

-   **Grid View**: Browse all uploaded media in a responsive grid.
-   **Filtering**: Filter by media type (Photos or Videos) or search by name.
-   **Lightbox**: Click on any item to view it in full screen.
-   **Management**: Download or delete media items.

## License

This project is private and proprietary.
