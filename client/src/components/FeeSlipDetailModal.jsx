import React from 'react';
import { X, FileText, Printer } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export const FeeSlipDetailModal = ({ isOpen, onClose, slip }) => {
  if (!isOpen || !slip) return null;

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

  // ── Print slip photo ───────────────────────────────────────────────────────
  const handlePrintSlip = () => {
    if (!slip.photo) return;

    const imageUrl = getImageUrl(slip.photo);
    // Use absolute URL when printing from the same origin
    const absoluteUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${window.location.origin}${imageUrl}`;

    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Slip — ${slip.name} (${slip.batch} · ${slip.semester})</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: #fff;
              display: flex;
              flex-direction: column;
              align-items: center;
              font-family: 'Segoe UI', sans-serif;
              padding: 1.5rem;
            }
            .header {
              display: flex;
              align-items: center;
              gap: 1rem;
              border-bottom: 2px solid #1e3a5f;
              padding-bottom: 0.75rem;
              margin-bottom: 1rem;
              width: 100%;
            }
            .header img { height: 52px; object-fit: contain; }
            .header h2 { font-size: 1rem; color: #1e3a5f; margin: 0; }
            .header p  { font-size: 0.75rem; color: #6b7280; margin: 0; }
            .meta {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.5rem 2rem;
              width: 100%;
              margin-bottom: 1rem;
              font-size: 0.85rem;
            }
            .meta span { color: #6b7280; font-size: 0.75rem; display: block; }
            .meta strong { color: #111827; }
            .amount-box {
              background: #f8fafc;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 0.6rem 1rem;
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 1rem;
            }
            .amount-box .val { font-size: 1.3rem; font-weight: 800; color: #1e3a5f; }
            .amount-box .dest { font-size: 0.8rem; color: #6b7280; }
            .slip-photo {
              max-width: 100%;
              max-height: 420px;
              object-fit: contain;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${window.location.origin}/iconswatlogo.png" alt="Logo" />
            <div>
              <h2>Imperial College of Nursing Swat</h2>
              <p>Official Fee Deposit Receipt / Voucher</p>
            </div>
          </div>
          <div class="meta">
            <div><span>Student Name</span><strong>${slip.name}</strong></div>
            <div><span>Father's Name</span><strong>${slip.fname || '—'}</strong></div>
            <div><span>Roll No</span><strong>${slip.rollNo || '—'}</strong></div>
            <div><span>Batch</span><strong>${slip.batch}</strong></div>
            <div><span>Semester</span><strong>${slip.semester}</strong></div>
          </div>
          <div class="amount-box">
            <span class="val">${formatCurrency(slip.amount)}</span>
            <span class="dest">Credited to: ${slip.creditedTo}</span>
          </div>
          <img class="slip-photo" src="${absoluteUrl}" alt="Fee Deposit Slip" />
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Fee Slip Receipt Details</h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div
            className="receipt-institutional-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <img
              src="/iconswatlogo.png"
              alt="ICON Logo"
              style={{
                height: '48px',
                objectFit: 'contain',
                background: '#ffffff',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)'
              }}
            />
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  color: 'var(--primary-navy)',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700
                }}
              >
                Imperial College of Nursing Swat
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Official Fee Deposit & Receipt Voucher
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount Deposited</span>
              <h3
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.75rem',
                  color: 'var(--primary-navy)',
                  fontWeight: 700
                }}
              >
                {formatCurrency(slip.amount)}
              </h3>
            </div>
            <div>
              <span
                className={`badge ${getBadgeClass(slip.creditedTo)}`}
                style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}
              >
                Credited to: {slip.creditedTo}
              </span>
            </div>
          </div>

          <div className="form-grid" style={{ gap: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>
                Student Full Name
              </label>
              <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{slip.name}</p>
            </div>
            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>
                Father's Name (fname)
              </label>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>{slip.fname}</p>
            </div>
            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>
                Batch
              </label>
              <p style={{ fontWeight: 600 }}>{slip.batch}</p>
            </div>
            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>
                Semester
              </label>
              <p style={{ fontWeight: 600 }}>{slip.semester}</p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label
              className="form-label"
              style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}
            >
              Attached Receipt Photo / Deposit Slip
            </label>
            {slip.photo ? (
              <div
                style={{
                  textAlign: 'center',
                  background: '#000000',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={getImageUrl(slip.photo)}
                  alt={`Receipt for ${slip.name}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '350px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px dashed var(--border-color)',
                  color: 'var(--text-muted)'
                }}
              >
                <FileText size={32} strokeWidth={1.5} style={{ marginBottom: '0.5rem' }} />
                <p>No receipt image attached to this fee record.</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {slip.photo && (
            <button
              onClick={handlePrintSlip}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={16} />
              Print Slip
            </button>
          )}
          <button onClick={onClose} className="btn btn-primary">
            Close Receipt View
          </button>
        </div>
      </div>
    </div>
  );
};
