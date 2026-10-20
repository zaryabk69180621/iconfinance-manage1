import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CreditCard, FileText, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-section">
          <img src="/iconswatlogo.png" alt="ICON Swat Logo" className="brand-logo-img" />
          <div className="brand-titles">
            <span className="brand-name">Imperial College of Nursing</span>
            <span className="brand-subtitle">Kabal, Swat — Finance Management</span>
          </div>
        </Link>

        <div className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/batches"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Batches & Students</span>
          </NavLink>

          <NavLink
            to="/fee-management"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <CreditCard size={18} />
            <span>Fee Management</span>
          </NavLink>

          <NavLink
            to="/fee-slips"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FileText size={18} />
            <span>Fee Slips</span>
          </NavLink>

          {user && (
            <div className="user-profile-badge">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.designation || 'Staff'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-logout"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
