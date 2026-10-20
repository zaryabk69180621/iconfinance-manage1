import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Signin form state
  const [signinData, setSigninData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    fname: '',
    id: '',
    email: '',
    designation: '',
    password: ''
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSigninSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(signinData);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign in. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await register(signupData);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/iconswatlogo.png" alt="ICON Swat Logo" className="auth-logo-img" />
          <h1 className="auth-title">Imperial College of Nursing</h1>
          <p className="auth-subtitle">Finance Management Portal — Swat Valley</p>
        </div>

        <div className="auth-body">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg('');
              }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg('');
              }}
            >
              Register User
            </button>
          </div>

          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'signin' ? (
            <form onSubmit={handleSigninSubmit}>
              <div className="form-group">
                <label className="form-label">Email or User ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. admin@iconswat.com or EMP-001"
                  value={signinData.email}
                  onChange={(e) =>
                    setSigninData({ ...signinData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={signinData.password}
                  onChange={(e) =>
                    setSigninData({ ...signinData, password: e.target.value })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to System'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Tariq Khan"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({ ...signupData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Father's Name (fname)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Muhammad Khan"
                    value={signupData.fname}
                    onChange={(e) =>
                      setSignupData({ ...signupData, fname: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">User / Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. EMP-101"
                    value={signupData.id}
                    onChange={(e) =>
                      setSignupData({ ...signupData, id: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Accountant, Finance Officer"
                    value={signupData.designation}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        designation: e.target.value
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@iconswat.com"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-accent"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register User Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
