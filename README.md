# Photo App

A self-hosted photo and video capture application with a modern, containerized architecture. This application allows users to capture, upload, and view their media through a web interface, with support for multiple users and flexible storage backends.

## Features

- **Multi-User Support**: Secure user registration and login with JWT-based authentication.
- **Photo and Video Capture**: Capture photos and record videos directly from the browser using the WebRTC and MediaRecorder APIs.
- **Media Gallery**: View your uploaded photos and videos in a gallery.
- **Flexible Storage**: Choose between three storage backends:
  - A local Docker volume (default)
  - A mounted NAS path
  - An S3-compatible object store (like MinIO or AWS S3)
- **Containerized**: The entire application is containerized with Docker and orchestrated with `docker-compose` for easy setup and deployment.
- **HTTPS via Traefik**: Includes a Traefik reverse proxy for automatic HTTPS with Let's Encrypt.
- **PWA Ready**: The client is a Progressive Web App, allowing it to be "installed" on mobile devices.
- **QR Code Login**: A secure, one-time QR code login flow for easy device pairing.

## Architecture

The application is composed of the following services:

- **Frontend**: A React application built with Vite that provides the user interface for capturing and viewing media.
- **Backend**: A Node.js and Express server that handles user authentication, file uploads, and gallery data.
- **Database**: A PostgreSQL database for storing user and media metadata.
- **Storage**:
  - **MinIO**: An optional S3-compatible object store for media files.
  - **Local/NAS**: The backend can also be configured to store media on a local Docker volume or a mounted NAS path.
- **Traefik**: A reverse proxy that handles routing and automatic HTTPS.

## Getting Started

To run the application, you will need to have Docker and `docker-compose` installed.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourdudeken/photoapp.git
    cd photoapp
    ```

2.  **Update Configuration**:
    - In `docker-compose.yml`, replace `photoapp.example.com` with your domain.
    - In `traefik/traefik.yml`, replace `you@example.com` with your email address for Let's Encrypt.

3.  **Build and Run**:
    - Open a terminal in the project root and run `docker-compose build` to build the images.
    - Then, run `docker-compose up -d` to start the application in the background.

4.  **Database Setup**:
    - Once the `db` container is running, you will need to create the database tables. You can do this by executing the `server/db/schema.sql` file in the `photoapp` database. You can use a tool like `psql` to connect to the database:
      ```bash
      docker-compose exec -T db psql -U postgres -d photoapp < server/db/schema.sql
      ```

You can now access your application at the domain you configured.

## Storage Options

The application supports three storage backends, which can be configured in the `docker-compose.yml` file by setting the `STORAGE_TYPE` environment variable for the `server` service.

- **`local` (default)**: Stores media in a Docker volume named `media_storage`.
- **NAS Mount**: To use a NAS, mount your NAS export on the host machine (e.g., to `/mnt/nas/photoapp_media`) and then update the `volumes` section for the `server` service in `docker-compose.yml`:
  ```yaml
  volumes:
    - /mnt/nas/photoapp_media:/app/media
  ```
- **`s3`**: Stores media in an S3-compatible object store. When using this option, you will need to configure the S3-related environment variables in `docker-compose.yml`.

## Native Mobile Strategy

The application is designed to be mobile-friendly and can be "installed" on mobile devices as a Progressive Web App (PWA). For a more native experience, the PWA can be wrapped in a native shell using a tool like Capacitor, which allows it to be distributed through app stores.
