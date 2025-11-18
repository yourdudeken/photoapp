# PhotoApp

A self-hosted photo and video capture application with a modern, containerized architecture. This application allows users to capture, upload, and view their media through a beautiful web interface, with support for multiple users and flexible storage backends.

## ✨ Features

### 🎨 Modern UI
- **Dark Mode Support**: Toggle between light and dark themes with smooth transitions
- **Professional Design**: Modern glassmorphism effects, vibrant gradients, and premium typography using Inter font
- **Responsive Layout**: Fully responsive design that works seamlessly on desktop, tablet, and mobile devices
- **Toast Notifications**: Non-intrusive notifications for user actions

### 👤 Multi-User Support
- **Secure Authentication**: User registration and login with JWT-based authentication
- **User Dashboard**: Overview of your media library with statistics
- **User Profile Menu**: Easy access to settings and account management

### 📸 Photo and Video Capture
- **Browser-Based Capture**: Capture photos and record videos directly from the browser using WebRTC and MediaRecorder APIs
- **Camera Controls**: 
  - Flip between front and back cameras
  - Start/stop camera
  - Real-time video preview
- **Upload Progress**: Visual progress indicators during media upload

### 🖼️ Enhanced Media Gallery
- **Search & Filter**: Search media by name and filter by type (photos/videos)
- **Lightbox View**: Click any media to view in full-screen lightbox
- **Delete Media**: Remove unwanted photos and videos
- **Download Media**: Download individual media files
- **Grid Layout**: Beautiful responsive grid layout with hover effects

### 🔐 QR Code Login
- **Quick Device Pairing**: Generate QR codes for easy login on other devices
- **Secure Tokens**: One-time QR code login flow

### 💾 Storage
- **Local Storage**: Uses Docker volumes for persistent media storage
- **Automatic Setup**: Database and volumes are created automatically on first run

### 🐳 Containerized
- **Docker Compose**: The entire application is containerized and orchestrated with `docker-compose` for easy setup and deployment
- **Automatic Database Initialization**: Database schema is created automatically when containers start

## 🏗️ Architecture

The application is composed of the following services:

- **Frontend**: A React application with modern UI components and state management
- **Backend**: A Node.js and Express server that handles user authentication, file uploads, and gallery data
- **Database**: A PostgreSQL database for storing user and media metadata
- **Storage**: Local Docker volume for media files

## 🚀 Getting Started

### Prerequisites
- Docker
- Docker Compose

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourdudeken/photoapp.git
   cd photoapp
   ```

2. **Start the application**:
   ```bash
   docker-compose up --build
   ```

   This single command will:
   - Build all Docker images
   - Create the PostgreSQL database
   - Initialize the database schema automatically
   - Create persistent volumes for data and media
   - Start all services

3. **Access the application**:
   - Open your browser and navigate to `http://localhost` (or `http://localhost:3000` for development)
   - Create an account to get started

### Environment Variables

The application uses the following default environment variables (configured in `docker-compose.yml`):

- `POSTGRES_USER`: postgres
- `POSTGRES_PASSWORD`: postgres
- `POSTGRES_DB`: photoapp
- `STORAGE_TYPE`: local
- `LOCAL_MEDIA_PATH`: /media

You can customize these by editing the `docker-compose.yml` file.

## 📱 Usage

### Creating an Account
1. Navigate to the login page
2. Click "Sign up" to create a new account
3. Enter your username and password
4. Click "Create Account"

### Capturing Media
1. Navigate to the "Capture" page
2. Click "Start Camera" to activate your device camera
3. Use "Flip Camera" to switch between front/back cameras (on mobile)
4. Click "Take Picture" to capture a photo
5. Click "Start Recording" to begin video recording
6. Click "Stop Recording" to end the recording
7. Media is automatically uploaded with progress indication

### Viewing Your Gallery
1. Navigate to the "Gallery" page
2. Use the search bar to find specific media
3. Filter by "All", "Photos", or "Videos"
4. Click any media item to view it in full-screen lightbox
5. Hover over media to see download and delete options

### Settings
1. Click on your profile in the header
2. Select "Settings"
3. Toggle between light and dark themes
4. View your account information
5. Logout when needed

## 🎨 UI Features

### Dark Mode
The application includes a beautiful dark mode that can be toggled from:
- The theme toggle button in the header (🌙/☀️)
- The Settings page

### Dashboard
The dashboard provides:
- Total media count
- Number of photos
- Number of videos
- Preview of recent media

### Toast Notifications
Non-intrusive notifications appear for:
- Successful uploads
- Login/logout actions
- Errors and warnings
- Delete confirmations

## 🔧 Development

### Project Structure
```
photoapp/
├── apps/
│   ├── web/          # React frontend
│   │   └── src/
│   │       ├── App.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Gallery.jsx
│   │       ├── Capture.jsx
│   │       ├── Settings.jsx
│   │       ├── Lightbox.jsx
│   │       ├── ThemeContext.jsx
│   │       └── ToastContext.jsx
│   └── server/       # Node.js backend
│       ├── routes/
│       ├── models/
│       └── db/
├── infra/
│   └── docker/
└── docker-compose.yml
```

### Running in Development Mode
```bash
npm run dev
```

This will start both the frontend and backend in development mode with hot reloading.

## 🐳 Docker Volumes

The application creates the following persistent volumes:
- `dbdata`: PostgreSQL database data
- `media`: Uploaded photos and videos

These volumes ensure your data persists even when containers are stopped or removed.

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- User-specific media access
- Token-based API authorization

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ by the PhotoApp team
