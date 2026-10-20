import React, { useState } from 'react';
import { api } from '../services/api';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDeleteModal = ({ isOpen, onClose, slip, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !slip) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await api.deleteFeeSlip(slip._id);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Delete fee slip error:', err);
      setError(err.message || 'Failed to delete fee slip record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div className="modal-header" style={{ background: '#ef4444' }}>
          <h2 className="modal-title">Confirm Delete Record</h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Are you sure you want to delete?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            This will permanently remove the fee slip record for{' '}
            <strong>{slip.name}</strong> ({slip.batch}, {slip.semester}).
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Yes, Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
};
