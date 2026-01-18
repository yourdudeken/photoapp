import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { success } = useToast();
    const navigate = useNavigate();
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        success('Logged out successfully');
        setTimeout(() => navigate('/auth'), 500);
    };

    if (!user) {
        navigate('/auth');
        return null;
    }

    return (
        <div className="page-container">
            <div className="content-card">
                <h2>Settings</h2>
                <p>Manage your account and preferences</p>

                <div style={{ marginTop: '32px' }}>
                    <h3>Account Information</h3>
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <label>Username</label>
                        <input type="text" value={user.username} disabled />
                    </div>
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <label>User ID</label>
                        <input type="text" value={user.id} disabled />
                    </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                    <h3>Appearance</h3>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <label style={{ marginBottom: 0 }}>Theme</label>
                        <button onClick={toggleTheme} className="secondary">
                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={handleLogout} className="danger">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
