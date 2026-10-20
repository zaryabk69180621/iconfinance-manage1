import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  DollarSign,
  Filter,
  RefreshCw,
  Edit,
  Eye,
  PlusCircle,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Building2,
  Landmark,
  GraduationCap,
  BarChart3
} from 'lucide-react';

export const FeeManagement = ({ onOpenAddModalWithStudent, onOpenDetailModal }) => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1st Semester');

  const [ledger, setLedger] = useState([]);
  const [maxInstallments, setMaxInstallments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Due Fee modal
  const [editDueModal, setEditDueModal] = useState({
    isOpen: false,
    student: null,
    dueFee: 0
  });

  const fetchBatches = async () => {
    try {
      const res = await api.getBatches();
      const list = res.data || [];
      setBatches(list);
      if (list.length > 0 && !selectedBatch) {
        setSelectedBatch(list[0].name);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const fetchLedger = async () => {
    if (!selectedBatch || !selectedSemester) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getSemesterFeeLedger({
        batch: selectedBatch,
        semester: selectedSemester
      });
      setLedger(res.data || []);
      setMaxInstallments(res.maxInstallmentsCount || 0);
    } catch (err) {
      console.error('Error fetching fee ledger:', err);
      setError(err.message || 'Failed to fetch fee ledger data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch && selectedSemester) {
      fetchLedger();
    }
  }, [selectedBatch, selectedSemester]);

  const handleSaveStudentDueFee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await api.updateStudentSemesterFee({
        studentId: editDueModal.student._id,
        batch: selectedBatch,
        semester: selectedSemester,
        dueFee: Number(editDueModal.dueFee)
      });
      setEditDueModal({ isOpen: false, student: null, dueFee: 0 });
      setSuccessMsg(`Due fee updated for ${editDueModal.student.name}`);
      await fetchLedger();
    } catch (err) {
      setError(err.message || 'Failed to update student due fee');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // ─── Aggregated Ledger Summary ────────────────────────────────────────────
  const totalExpectedDueFee = ledger.reduce((sum, item) => sum + item.dueFee, 0);
  const totalCollectedFee = ledger.reduce((sum, item) => sum + item.totalPaid, 0);
  const totalPendingBalance = Math.max(0, totalExpectedDueFee - totalCollectedFee);

  // ─── Credit Destination Breakdown (mini dashboard) ───────────────────────
  const creditBreakdown = ledger.reduce(
    (acc, item) => {
      item.installments.forEach((inst) => {
        const dest = inst.creditedTo?.toLowerCase().trim();
        if (dest === 'owner') acc.owner += inst.amount;
        else if (dest === 'bank') acc.bank += inst.amount;
        else if (dest === 'utilized in college') acc.college += inst.amount;
      });
      return acc;
    },
    { owner: 0, bank: 0, college: 0 }
  );

  // ─── Export to CSV ────────────────────────────────────────────────────────
  const exportToCSV = () => {
    if (ledger.length === 0) return;

    // Build dynamic headers
    const installmentHeaders = Array.from({ length: Math.max(1, maxInstallments) }, (_, i) =>
      `Installment ${i + 1} (PKR)`
    );
    const headers = [
      'Roll No',
      'Student Name',
      "Father's Name",
      'Batch',
      'Semester',
      'Due Fee (PKR)',
      ...installmentHeaders,
      'Total Paid (PKR)',
      'Pending Fee (PKR)',
      'Status'
    ];

    const rows = ledger.map((item) => {
      const installmentAmounts = Array.from({ length: Math.max(1, maxInstallments) }, (_, i) =>
        item.installments[i] ? item.installments[i].amount : ''
      );
      return [
        item.student.rollNo,
        item.student.name,
        item.student.fname,
        selectedBatch,
        selectedSemester,
        item.dueFee,
        ...installmentAmounts,
        item.totalPaid,
        item.pendingFee,
        item.status
      ]
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fee_Ledger_${selectedBatch}_${selectedSemester}.csv`.replace(/\s+/g, '_');
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Semester Fee Management & Installments</h1>
          <p className="page-description">
            Track student semester due fees, paid installment receipts, and pending balances
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={exportToCSV}
            className="btn btn-secondary btn-sm"
            disabled={ledger.length === 0}
            title="Export ledger to CSV"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button onClick={fetchLedger} className="btn btn-secondary btn-sm" title="Refresh ledger">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          className="alert alert-success"
          style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Batch & Semester Selector Bar ── */}
      <div
        className="table-card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          background: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="var(--primary-navy)" />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select Batch:</span>
            <select
              className="filter-select"
              style={{ fontWeight: 600, color: 'var(--primary-navy)' }}
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              {batches.length === 0 ? (
                <option value="">No Batches Created</option>
              ) : (
                batches.map((b) => (
                  <option key={b._id} value={b.name}>
                    {b.name} ({b.studentCount} Students)
                  </option>
                ))
              )}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Semester:</span>
            <select
              className="filter-select"
              style={{ fontWeight: 600 }}
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              {['1st','2nd','3rd','4th','5th','6th','7th','8th'].map((n) => (
                <option key={n} value={`${n} Semester`}>{n} Semester</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing matrix for: <strong>{selectedBatch || 'N/A'}</strong> — <strong>{selectedSemester}</strong>
        </div>
      </div>

      {/* ── Summary Cards Row 1: Due / Collected / Pending ── */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card total">
          <div className="stat-header">
            <span className="stat-label">Total Expected Fee</span>
            <DollarSign size={20} color="var(--primary-navy)" />
          </div>
          <div className="stat-value">{formatCurrency(totalExpectedDueFee)}</div>
          <div className="stat-subtext">Sum of student due fees for {selectedSemester}</div>
        </div>

        <div className="stat-card bank">
          <div className="stat-header">
            <span className="stat-label">Total Paid Revenue</span>
            <CheckCircle2 size={20} color="var(--bank-color)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--bank-color)' }}>
            {formatCurrency(totalCollectedFee)}
          </div>
          <div className="stat-subtext">Sum of all received installment fee slips</div>
        </div>

        <div className="stat-card college">
          <div className="stat-header">
            <span className="stat-label">Remaining Pending Balance</span>
            <Clock size={20} color="var(--gold-accent)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--gold-accent)' }}>
            {formatCurrency(totalPendingBalance)}
          </div>
          <div className="stat-subtext">Uncollected balance from current semester</div>
        </div>
      </div>

      {/* ── Mini Dashboard: Credit Destination Breakdown ── */}
      <div className="table-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color="var(--primary-navy)" />
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--primary-navy)', margin: 0 }}>
            Credit Destination Breakdown — {selectedSemester}
          </h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total collected: <strong>{formatCurrency(totalCollectedFee)}</strong>
          </span>
        </div>
        <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>

          {/* Owner Card */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2137 100%)', borderRadius: '12px', padding: '1.25rem', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.4rem' }}>
                <Building2 size={18} color="#c9a84c" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', opacity: 0.85 }}>Credited to Owner</span>
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#c9a84c' }}>
              {formatCurrency(creditBreakdown.owner)}
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '0.3rem' }}>
              {totalCollectedFee > 0
                ? `${Math.round((creditBreakdown.owner / totalCollectedFee) * 100)}% of total collected`
                : 'No installments yet'}
            </div>
            <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: '#c9a84c',
                  width: totalCollectedFee > 0 ? `${(creditBreakdown.owner / totalCollectedFee) * 100}%` : '0%',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
          </div>

          {/* Bank Card */}
          <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #034732 100%)', borderRadius: '12px', padding: '1.25rem', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.4rem' }}>
                <Landmark size={18} color="#34d399" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', opacity: 0.85 }}>Credited to Bank</span>
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
              {formatCurrency(creditBreakdown.bank)}
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '0.3rem' }}>
              {totalCollectedFee > 0
                ? `${Math.round((creditBreakdown.bank / totalCollectedFee) * 100)}% of total collected`
                : 'No installments yet'}
            </div>
            <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: '#34d399',
                  width: totalCollectedFee > 0 ? `${(creditBreakdown.bank / totalCollectedFee) * 100}%` : '0%',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
          </div>

          {/* Utilized in College Card */}
          <div style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)', borderRadius: '12px', padding: '1.25rem', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.4rem' }}>
                <GraduationCap size={18} color="#c4b5fd" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', opacity: 0.85 }}>Utilized in College</span>
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#c4b5fd' }}>
              {formatCurrency(creditBreakdown.college)}
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '0.3rem' }}>
              {totalCollectedFee > 0
                ? `${Math.round((creditBreakdown.college / totalCollectedFee) * 100)}% of total collected`
                : 'No installments yet'}
            </div>
            <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: '#c4b5fd',
                  width: totalCollectedFee > 0 ? `${(creditBreakdown.college / totalCollectedFee) * 100}%` : '0%',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── Ledger Matrix Table ── */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={20} color="var(--primary-navy)" />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700 }}>
              Student Fee & Installments Matrix Ledger
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {ledger.length} students
            </span>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No & Student</th>
                  <th>Father's Name</th>
                  <th>Due Fee (PKR)</th>
                  {Array.from({ length: Math.max(1, maxInstallments) }).map((_, idx) => (
                    <th key={idx} style={{ textAlign: 'center' }}>
                      Installment {idx + 1}
                    </th>
                  ))}
                  <th>Total Paid</th>
                  <th>Pending Fee</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7 + Math.max(1, maxInstallments)}
                      style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}
                    >
                      No student fee ledger found for <strong>{selectedBatch}</strong> ({selectedSemester}). Please
                      assign semester due fees in the "Batches & Students" section.
                    </td>
                  </tr>
                ) : (
                  ledger.map((item) => {
                    const student = item.student;
                    return (
                      <tr key={student._id}>
                        <td>
                          <div>
                            <span
                              style={{
                                fontWeight: 800,
                                color: 'var(--primary-navy)',
                                display: 'block',
                                fontSize: '0.85rem'
                              }}
                            >
                              {student.rollNo}
                            </span>
                            <span style={{ fontWeight: 600 }}>{student.name}</span>
                          </div>
                        </td>

                        <td>{student.fname}</td>

                        {/* Due Fee (editable) */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="amount-text">{formatCurrency(item.dueFee)}</span>
                            <button
                              onClick={() =>
                                setEditDueModal({ isOpen: true, student, dueFee: item.dueFee })
                              }
                              className="btn-icon"
                              style={{ width: '24px', height: '24px' }}
                              title="Edit Due Fee"
                            >
                              <Edit size={12} />
                            </button>
                          </div>
                        </td>

                        {/* Dynamic Installments */}
                        {Array.from({ length: Math.max(1, maxInstallments) }).map((_, idx) => {
                          const inst = item.installments[idx];
                          return (
                            <td key={idx} style={{ textAlign: 'center' }}>
                              {inst ? (
                                <button
                                  onClick={() =>
                                    onOpenDetailModal({
                                      _id: inst.slipId,
                                      name: student.name,
                                      fname: student.fname,
                                      batch: selectedBatch,
                                      semester: selectedSemester,
                                      amount: inst.amount,
                                      creditedTo: inst.creditedTo,
                                      photo: inst.photo
                                    })
                                  }
                                  className="badge badge-bank"
                                  style={{
                                    cursor: 'pointer',
                                    border: 'none',
                                    padding: '0.35rem 0.65rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title={`View receipt — Installment ${inst.installmentNo}`}
                                >
                                  {formatCurrency(inst.amount)}
                                  <Eye size={12} />
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>—</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Total Paid */}
                        <td style={{ fontWeight: 700, color: 'var(--bank-color)' }}>
                          {formatCurrency(item.totalPaid)}
                        </td>

                        {/* Pending Fee */}
                        <td
                          style={{
                            fontWeight: 700,
                            color: item.pendingFee > 0 ? '#dc2626' : 'var(--text-muted)'
                          }}
                        >
                          {formatCurrency(item.pendingFee)}
                        </td>

                        {/* Status */}
                        <td>
                          {item.status === 'Paid' && (
                            <span className="badge badge-bank" style={{ gap: '0.25rem', display: 'inline-flex', alignItems: 'center' }}>
                              <CheckCircle2 size={12} /> Paid
                            </span>
                          )}
                          {item.status === 'Partial' && (
                            <span className="badge badge-utilized" style={{ gap: '0.25rem', display: 'inline-flex', alignItems: 'center' }}>
                              <Clock size={12} /> Partial
                            </span>
                          )}
                          {item.status === 'Unpaid' && (
                            <span className="badge" style={{ background: '#fef2f2', color: '#991b1b', gap: '0.25rem', display: 'inline-flex', alignItems: 'center' }}>
                              <XCircle size={12} /> Unpaid
                            </span>
                          )}
                        </td>

                        {/* Add Slip */}
                        <td>
                          <button
                            onClick={() =>
                              onOpenAddModalWithStudent({
                                studentId: student._id,
                                rollNo: student.rollNo,
                                name: student.name,
                                fname: student.fname,
                                batch: selectedBatch,
                                semester: selectedSemester
                              })
                            }
                            className="btn btn-accent btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            title="Record Fee Slip Installment for this student"
                          >
                            <PlusCircle size={14} />
                            <span>Add Slip</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Edit Student Due Fee Modal ── */}
      {editDueModal.isOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Due Fee — {editDueModal.student?.name}</h2>
              <button
                onClick={() => setEditDueModal({ isOpen: false, student: null, dueFee: 0 })}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveStudentDueFee}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Roll No: <strong>{editDueModal.student?.rollNo}</strong> | Batch:{' '}
                  <strong>{selectedBatch}</strong> ({selectedSemester})
                </p>
                <div className="form-group">
                  <label className="form-label">Semester Due Fee Amount (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={editDueModal.dueFee}
                    onChange={(e) => setEditDueModal({ ...editDueModal, dueFee: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditDueModal({ isOpen: false, student: null, dueFee: 0 })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Due Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
