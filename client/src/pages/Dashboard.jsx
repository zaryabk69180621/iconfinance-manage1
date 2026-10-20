import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import {
  Wallet,
  Building,
  Landmark,
  FileCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const Dashboard = ({ onOpenAddModal }) => {
  const [summary, setSummary] = useState(null);
  const [recentSlips, setRecentSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summaryRes = await api.getFinanceSummary();
      setSummary(summaryRes.data || summaryRes);

      const slipsRes = await api.getFeeSlips();
      // Keep last 5 recent fee slips
      setRecentSlips(slipsRes.data ? slipsRes.data.slice(0, 5) : []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load financial summary data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getBadgeClass = (creditedTo) => {
    switch (creditedTo) {
      case 'owner':
        return 'badge-owner';
      case 'bank':
        return 'badge-bank';
      case 'utilized in college':
        return 'badge-utilized';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="loading-text" style={{ marginTop: '1rem' }}>
          Loading Imperial College Financial Overview...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance Management Dashboard</h1>
          <p className="page-description">
            Imperial College of Nursing Kabal, Swat — Real-time revenue & credit distribution
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh Stats">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button onClick={onOpenAddModal} className="btn btn-accent">
            <PlusCircle size={18} />
            <span>Record Fee Slip</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-header">
            <span className="stat-label">Total Revenue Collected</span>
            <div className="stat-icon-wrapper">
              <Wallet size={22} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(summary?.totalAmount)}</div>
          <div className="stat-subtext">
            Total fee receipts recorded: <strong>{summary?.totalFeeSlips || 0} slips</strong>
          </div>
        </div>

        <div className="stat-card owner">
          <div className="stat-header">
            <span className="stat-label">Owner Account</span>
            <div className="stat-icon-wrapper">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(summary?.breakdown?.owner?.amount)}</div>
          <div className="stat-subtext">
            {summary?.breakdown?.owner?.count || 0} slip records credited directly to Owner
          </div>
        </div>

        <div className="stat-card bank">
          <div className="stat-header">
            <span className="stat-label">Bank Account</span>
            <div className="stat-icon-wrapper">
              <Landmark size={22} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(summary?.breakdown?.bank?.amount)}</div>
          <div className="stat-subtext">
            {summary?.breakdown?.bank?.count || 0} slip records deposited into Bank
          </div>
        </div>

        <div className="stat-card college">
          <div className="stat-header">
            <span className="stat-label">Utilized In College</span>
            <div className="stat-icon-wrapper">
              <Building size={22} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(summary?.breakdown?.collegeUtilization?.amount)}</div>
          <div className="stat-subtext">
            {summary?.breakdown?.collegeUtilization?.count || 0} slip records allocated to Campus Development
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="table-card" style={{ marginTop: '2rem' }}>
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={20} color="var(--primary-navy)" />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 700 }}>
              Recent Fee Slip Records
            </h3>
          </div>
          <Link to="/fee-slips" className="btn btn-secondary btn-sm">
            <span>View All Slips</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Father's Name</th>
                <th>Batch</th>
                <th>Semester</th>
                <th>Credited Account</th>
                <th>Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {recentSlips.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No fee slips recorded yet. Click <strong>"Record Fee Slip"</strong> to create the first record.
                  </td>
                </tr>
              ) : (
                recentSlips.map((slip) => (
                  <tr key={slip._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {slip.photo ? (
                          <img
                            src={getImageUrl(slip.photo)}
                            alt={slip.name}
                            className="student-photo-thumb"
                          />
                        ) : (
                          <div className="photo-placeholder">
                            {slip.name ? slip.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                        )}
                        <span style={{ fontWeight: 600 }}>{slip.name}</span>
                      </div>
                    </td>
                    <td>{slip.fname}</td>
                    <td>{slip.batch}</td>
                    <td>{slip.semester}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(slip.creditedTo)}`}>
                        {slip.creditedTo}
                      </span>
                    </td>
                    <td className="amount-text">{formatCurrency(slip.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
