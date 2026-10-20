import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  FileText,
  AlertCircle
} from 'lucide-react';

export const FeeSlips = ({
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailModal,
  onOpenDeleteModal,
  refreshTrigger
}) => {
  const [feeSlips, setFeeSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [creditFilter, setCreditFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  const fetchFeeSlips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFeeSlips();
      setFeeSlips(res.data || []);
    } catch (err) {
      console.error('Error fetching fee slips:', err);
      setError(err.message || 'Failed to fetch fee slips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeSlips();
  }, [refreshTrigger]);

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

  // Get unique batches for filter dropdown
  const uniqueBatches = Array.from(
    new Set(feeSlips.map((item) => item.batch).filter(Boolean))
  );

  // Filter fee slips
  const filteredFeeSlips = feeSlips.filter((slip) => {
    const matchesSearch =
      slip.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.batch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.semester?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCredit =
      creditFilter === 'all' || slip.creditedTo === creditFilter;

    const matchesBatch =
      batchFilter === 'all' || slip.batch === batchFilter;

    return matchesSearch && matchesCredit && matchesBatch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Slips Directory</h1>
          <p className="page-description">
            Search, filter, and manage Imperial College student fee deposit records
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchFeeSlips} className="btn btn-secondary btn-sm" title="Refresh list">
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

      <div className="table-card">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by student name, father name, batch, semester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Filter size={16} />
              <span>Filters:</span>
            </div>

            <select
              className="filter-select"
              value={creditFilter}
              onChange={(e) => setCreditFilter(e.target.value)}
            >
              <option value="all">All Account Destinations</option>
              <option value="owner">Owner</option>
              <option value="bank">Bank</option>
              <option value="utilized in college">Utilized in College</option>
            </select>

            <select
              className="filter-select"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
            >
              <option value="all">All Batches</option>
              {uniqueBatches.map((batch) => (
                <option key={batch} value={batch}>
                  Batch {batch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          {loading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <p className="loading-text" style={{ marginTop: '1rem' }}>Loading fee slips...</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Father's Name</th>
                  <th>Batch</th>
                  <th>Semester</th>
                  <th>Credited Account</th>
                  <th>Amount (PKR)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeeSlips.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={40} strokeWidth={1.5} style={{ marginBottom: '0.5rem' }} />
                        <p style={{ fontWeight: 600 }}>No fee slips found</p>
                        <p style={{ fontSize: '0.85rem' }}>
                          Try adjusting your search criteria or add a new fee slip.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFeeSlips.map((slip) => (
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
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => onOpenDetailModal(slip)}
                            className="btn-icon"
                            title="View Receipt Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(slip)}
                            className="btn-icon"
                            title="Edit Record"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal(slip)}
                            className="btn-icon delete"
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
