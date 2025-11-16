import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Auth from './Auth';
import Capture from './Capture';
import Gallery from './Gallery';
import QRLogin from './QRLogin';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/auth">Login/Register</Link></li>
            <li><Link to="/capture">Capture</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/qr-login">QR Login</Link></li>
          </ul>
        </nav>
        <hr />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/qr-login" element={<QRLogin />} />
          <Route path="/" element={<Auth />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
