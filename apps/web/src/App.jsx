import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, NavLink, useNavigate } from 'react-router-dom';
import './App.css';
import { ThemeProvider, useTheme } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import Auth from './Auth';
import Capture from './Capture';
import Gallery from './Gallery';
import QRLogin from './QRLogin';
import Dashboard from './Dashboard';
import Settings from './Settings';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    navigate('/auth');
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="app-logo">
            <div className="logo-icon">📸</div>
            <span>PhotoApp</span>
          </Link>

          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {user && (
              <div className="user-menu">
                <button className="user-button" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                  <span>{user.username}</span>
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }}>
                      ⚙️ Settings
                    </button>
                    <button onClick={handleLogout} className="danger">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {user && (
        <nav>
          <ul>
            <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>🏠 Dashboard</NavLink></li>
            <li><NavLink to="/capture" className={({ isActive }) => isActive ? 'active' : ''}>📷 Capture</NavLink></li>
            <li><NavLink to="/gallery" className={({ isActive }) => isActive ? 'active' : ''}>🖼️ Gallery</NavLink></li>
            <li><NavLink to="/qr-login" className={({ isActive }) => isActive ? 'active' : ''}>📱 QR Login</NavLink></li>
          </ul>
        </nav>
      )}

      <Routes>
        <Route path="/auth" element={<Auth onLogin={setUser} />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/qr-login" element={<QRLogin />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={user ? <Dashboard /> : <Auth onLogin={setUser} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
