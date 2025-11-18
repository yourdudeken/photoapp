# PhotoApp

A self-hosted photo and video capture application with a modern, responsive web interface. Built with React, Node.js, Express, and PostgreSQL.

## ✨ Features

### 🎨 Modern UI
- **Dark/Light Mode**: Toggle between themes with persistence
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Professional Design**: Glassmorphism effects, gradients, and smooth animations
- **Toast Notifications**: Non-intrusive feedback for user actions

### 👤 Multi-User Support
- **Secure Authentication**: JWT-based login and registration
- **User Dashboard**: Overview of media library with statistics
- **User Profile Menu**: Easy access to settings and account management

### 📸 Photo Capture
- **Browser-Based**: Capture photos directly from device camera
- **Camera Controls**: Flip between front/back cameras (mobile)
- **Upload Progress**: Real-time progress tracking
- **High Quality**: PNG format with original camera resolution

### 🎥 Video Recording
- **Audio + Video**: Records both video and audio
- **Codec Auto-Detection**: Automatically selects best supported codec
- **Supported Formats**: WebM (VP9/VP8 + Opus) or MP4
- **Upload Progress**: Real-time progress tracking
- **Max Size**: 200MB per video

### 🖼️ Enhanced Gallery
- **Search**: Filter media by filename
- **Filter by Type**: View all, photos only, or videos only
- **Lightbox Viewer**: Full-screen media viewing
- **Delete Media**: Remove unwanted items with confirmation
- **Download Media**: Download photos and videos
- **Responsive Grid**: Adapts from 1 to 4 columns based on screen size

### ⚙️ Settings
- **Theme Toggle**: Switch between light and dark modes
- **Account Info**: View username and account details
- **Logout**: Secure session termination

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18, React Router 7
- **Backend**: Node.js, Express
- **Database**: PostgreSQL 15
- **Storage**: Local filesystem (Docker volume support)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Upload**: Multer with FormData
- **Camera**: MediaDevices API
- **Recording**: MediaRecorder API with codec fallback

### Project Structure
```
photoapp/
├── apps/
│   ├── server/              # Backend (Port 5000)
│   │   ├── server.js        # Express server
│   │   ├── routes/
│   │   │   ├── auth.js      # Authentication endpoints
│   │   │   ├── uploads.js   # Media upload endpoint
│   │   │   └── gallery.js   # Gallery CRUD endpoints
│   │   ├── storage/
│   │   │   └── adapter.js   # Storage abstraction layer
│   │   ├── db/
│   │   │   └── schema.sql   # Database schema
│   │   └── media/           # Uploaded files (local dev)
│   │
│   └── web/                 # Frontend (Port 3000)
│       ├── src/
│       │   ├── App.jsx      # Main app with routing
│       │   ├── App.css      # Responsive styles
│       │   ├── Dashboard.jsx
│       │   ├── Gallery.jsx
│       │   ├── Capture.jsx
│       │   ├── Settings.jsx
│       │   ├── Lightbox.jsx
│       │   ├── ThemeContext.jsx
│       │   └── ToastContext.jsx
│       └── package.json     # Includes proxy config
│
├── docker-compose.yml       # Production deployment
├── package.json             # Monorepo workspace config
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourdudeken/photoapp.git
   cd photoapp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the database**:
   ```bash
   docker-compose up -d db
   ```
   
   The database will be available at `localhost:5433` (port 5433 to avoid conflicts with local PostgreSQL).

4. **Start development servers**:
   ```bash
   npm run dev
   ```
   
   This starts:
   - Backend on http://localhost:5000
   - Frontend on http://localhost:3000

5. **Open the app**:
   Navigate to http://localhost:3000

### Production Deployment

```bash
docker-compose up --build -d
```

This will:
- Build optimized frontend
- Start backend server
- Initialize database automatically
- Serve on port 80

## 🎯 Usage

### Create Account
1. Open http://localhost:3000
2. Click "Sign up"
3. Enter username and password
4. Click "Create Account"

### Capture Photos
1. Navigate to "Capture" page
2. Click "Start Camera"
3. Grant camera permission when prompted
4. Click "Take Picture"
5. Photo uploads automatically
6. View in Gallery

### Record Videos
1. Navigate to "Capture" page
2. Click "Start Camera"
3. Grant camera and microphone permissions
4. Click "Start Recording"
5. Speak or make noise
6. Click "Stop Recording"
7. Video uploads automatically with audio
8. View and play in Gallery

### Manage Gallery
- **Search**: Type in search box to filter by filename
- **Filter**: Click "Photos" or "Videos" to filter by type
- **View**: Click any media to open in lightbox
- **Download**: Hover and click download button
- **Delete**: Hover and click delete button (with confirmation)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (optional, defaults work for local dev):

```env
# Server
PORT=5000
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=photoapp
PGPORT=5433
STORAGE_TYPE=local
LOCAL_MEDIA_PATH=./media
JWT_SECRET=your-secret-key-here

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Database Configuration

**Local Development:**
- Host: localhost
- Port: 5433 (Docker mapped)
- Database: photoapp
- User: postgres
- Password: postgres

**Production (Docker):**
- Host: db (container name)
- Port: 5432 (internal)
- Database: photoapp
- User: postgres
- Password: postgres

### Storage Configuration

By default, media is stored locally in `apps/server/media/`. For S3-compatible storage, set:

```env
STORAGE_TYPE=s3
S3_BUCKET=your-bucket
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
S3_ENDPOINT=https://s3.amazonaws.com
```

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register
Body: { "username": "user", "password": "pass" }
Response: { "user": { "id": 1, "username": "user" } }

POST /api/auth/login
Body: { "username": "user", "password": "pass" }
Response: { "token": "jwt-token", "user": {...} }
```

### Media Upload
```
POST /api/upload/file
Headers: Authorization: Bearer <token>
Body: FormData with 'media' file
Response: { "id": 1, "filename": "..." }
```

### Gallery
```
GET /api/gallery?userId=<id>
Response: [{ "id": 1, "filename": "...", "url": "...", ... }]

DELETE /api/gallery/:id
Headers: Authorization: Bearer <token>
Response: { "success": true }
```

## 🎨 Features in Detail

### Video Recording Codec Support

The app automatically detects and uses the best supported codec:

1. **VP9 + Opus** (best quality, Chrome/Firefox)
2. **VP8 + Opus** (good quality, wide support)
3. **H264 + Opus** (fallback)
4. **WebM** (generic fallback)
5. **MP4** (Safari/iOS)
6. **Browser default** (last resort)

### Responsive Breakpoints

- **Desktop** (>1024px): Full navigation, 3-4 column gallery
- **Tablet** (768px-1024px): Compact layout, 2-3 column gallery
- **Mobile** (<768px): Hamburger menu, 1-2 column gallery

### Dark Mode

- Toggle via header button (🌙/☀️)
- Toggle via Settings page
- Persists across sessions
- Smooth transitions
- All components support both themes

## 🐛 Troubleshooting

### Port Conflicts

If port 5432 is already in use (local PostgreSQL):
- The app uses port 5433 for Docker PostgreSQL
- Update `PGPORT` in server.js if needed

### Camera/Microphone Permissions

If camera or microphone doesn't work:
1. Check browser permissions
2. Use HTTPS in production (required for camera API)
3. Grant permissions when prompted

### Video Recording Issues

**"Failed to start recording":**
- Refresh the page
- Check browser console for codec info
- Try different browser (Chrome/Firefox recommended)

**No audio in video:**
- Grant microphone permission
- Check system microphone settings
- Verify microphone is not muted

### Database Connection Issues

```bash
# Check database status
docker-compose ps db

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Upload Failures

```bash
# Check media directory exists
ls -la apps/server/media/

# Create if missing
mkdir -p apps/server/media
chmod 755 apps/server/media
```

## 🔒 Security

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **CORS**: Configured for allowed origins
- **Input Validation**: Server-side validation
- **File Size Limits**: 200MB max upload
- **User Isolation**: Users can only access their own media

## 📊 Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  content_type VARCHAR(100),
  storage_type VARCHAR(50),
  s3_key VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚧 Development

### Adding Dependencies

**Frontend:**
```bash
npm install <package> --workspace=web
```

**Backend:**
```bash
npm install <package> --workspace=server
```

### Running Tests

```bash
# Frontend tests
npm test --workspace=web

# Backend tests
npm test --workspace=server
```

### Building for Production

```bash
# Build frontend
npm run build --workspace=web

# Or use Docker
docker-compose up --build
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ by the PhotoApp team**
