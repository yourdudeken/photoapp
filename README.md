# Photo App

A self-hosted photo and video capture application with a modern, containerized architecture. This application allows users to capture, upload, and view their media through a web interface, with support for multiple users and flexible storage backends.

## Features

- **Multi-User Support**: Secure user registration and login with JWT-based authentication.
- **Photo and Video Capture**: Capture photos and record videos directly from the browser using the WebRTC and MediaRecorder APIs.
- **Media Gallery**: View your uploaded photos and videos in a gallery.
- **Flexible Storage**: Choose between three storage backends:
  - A local Docker volume (default)
- **Containerized**: The entire application is containerized with Docker and orchestrated with `docker-compose` for easy setup and deployment.
- **PWA Ready**: The client is a Progressive Web App, allowing it to be "installed" on mobile devices.
- **QR Code Login**: A secure, one-time QR code login flow for easy device pairing.

## Architecture

The application is composed of the following services:

- **Frontend**: A React application built with Vite that provides the user interface for capturing and viewing media.
- **Backend**: A Node.js and Express server that handles user authentication, file uploads, and gallery data.
- **Database**: A PostgreSQL database for storing user and media metadata.
- **Storage**:
  - **Local**: The backend can also be configured to store media on a local Docker volume.

## Getting Started

To run the application, you will need to have Docker and `docker-compose` installed.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourdudeken/photoapp.git
    cd photo

2.  **Build and Run**:
    - Open a terminal in the project root and run `docker-compose build` to build the images.
    - Then, run `docker-compose up -d` to start the application in the background.

3.  **Database Setup**:
    - Once the `db` container is running, you will need to create the database tables. You can do this by executing the `server/db/schema.sql` file in the `photoapp` database. You can use a tool like `psql` to connect to the database:
      ```bash
      docker-compose exec -T db psql -U postgres -d photoapp < server/db/schema.sql
      ```

You can now access your application at the domain you configured.

## Storage Options

The application supports three storage backends, which can be configured in the `docker-compose.yml` file by setting the `STORAGE_TYPE` environment variable for the `server` service.

- **`local` (default)**: Stores media in a Docker volume named `media_storage`.

## Native Mobile Strategy

The application is designed to be mobile-friendly and can be "installed" on mobile devices as a Progressive Web App (PWA). For a more native experience, the PWA can be wrapped in a native shell using a tool like Capacitor, which allows it to be distributed through app stores.
