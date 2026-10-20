import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  FolderPlus,
  UserPlus,
  DollarSign,
  Trash2,
  AlertCircle,
  CheckCircle,
  Search,
  BookOpen
} from 'lucide-react';

export const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search filter inside student list
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isFeeSetupModalOpen, setIsFeeSetupModalOpen] = useState(false);

  // New Batch Form
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDesc, setNewBatchDesc] = useState('');

  // New Student Form
  const [studentForm, setStudentForm] = useState({
    name: '',
    fname: '',
    rollNo: '',
    batch: ''
  });

  // Semester Fee Setup Form
  const [feeSetupForm, setFeeSetupForm] = useState({
    batch: '',
    semester: '1st Semester',
    dueFee: ''
  });

  const fetchBatches = async () => {
    try {
      const res = await api.getBatches();
      const batchList = res.data || [];
      setBatches(batchList);

      if (batchList.length > 0 && !selectedBatch) {
        setSelectedBatch(batchList[0].name);
      }
    } catch (err) {
      console.error('Error loading batches:', err);
      setError(err.message || 'Failed to load batches');
    }
  };

  const fetchStudents = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const res = await api.getStudents({ batch: selectedBatch });
      setStudents(res.data || []);
    } catch (err) {
      console.error('Error loading students:', err);
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchStudents();
    }
  }, [selectedBatch]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await api.createBatch({
        name: newBatchName,
        description: newBatchDesc
      });
      setNewBatchName('');
      setNewBatchDesc('');
      setIsBatchModalOpen(false);
      setSuccessMsg(`Batch "${newBatchName}" created successfully!`);
      await fetchBatches();
    } catch (err) {
      setError(err.message || 'Failed to create batch');
    }
  };

  const handleDeleteBatch = async (batchId, batchName) => {
    if (!window.confirm(`Are you sure you want to delete batch "${batchName}"?`)) return;
    try {
      await api.deleteBatch(batchId);
      setSuccessMsg(`Batch "${batchName}" deleted.`);
      if (selectedBatch === batchName) {
        setSelectedBatch('');
      }
      await fetchBatches();
    } catch (err) {
      setError(err.message || 'Failed to delete batch');
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await api.createStudent({
        ...studentForm,
        batch: selectedBatch
      });
      setStudentForm({ name: '', fname: '', rollNo: '', batch: '' });
      setIsStudentModalOpen(false);
      setSuccessMsg(`Student "${studentForm.name}" added to Batch ${selectedBatch}.`);
      await fetchStudents();
      await fetchBatches(); // Refresh student count in batch list
    } catch (err) {
      setError(err.message || 'Failed to add student');
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student "${studentName}"?`)) return;
    try {
      await api.deleteStudent(studentId);
      setSuccessMsg(`Student "${studentName}" removed.`);
      await fetchStudents();
      await fetchBatches();
    } catch (err) {
      setError(err.message || 'Failed to delete student');
    }
  };

  const handleSetupSemesterFee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.setSemesterFeeForBatch({
        batch: selectedBatch,
        semester: feeSetupForm.semester,
        dueFee: Number(feeSetupForm.dueFee)
      });
      setIsFeeSetupModalOpen(false);
      setSuccessMsg(res.message || 'Semester due fee initialized successfully!');
    } catch (err) {
      setError(err.message || 'Failed to set semester fee');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Batches & Student Management</h1>
          <p className="page-description">
            Create academic batches, manage student rosters, and assign semester due fees
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              setIsBatchModalOpen(true);
              setError('');
            }}
            className="btn btn-primary"
          >
            <FolderPlus size={18} />
            <span>Create Batch</span>
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
        <div className="alert alert-success" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Batch Cards Selection */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {batches.length === 0 ? (
          <div className="stat-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No batches created yet. Click <strong>"Create Batch"</strong> to get started.</p>
          </div>
        ) : (
          batches.map((b) => {
            const isSelected = selectedBatch === b.name;
            return (
              <div
                key={b._id}
                onClick={() => setSelectedBatch(b.name)}
                className={`stat-card ${isSelected ? 'total' : ''}`}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--primary-navy)' : '1px solid var(--border-color)',
                  background: isSelected ? '#f8fafc' : '#ffffff'
                }}
              >
                <div className="stat-header">
                  <span className="stat-label">Academic Batch</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBatch(b._id, b.name);
                    }}
                    className="btn-icon delete"
                    title="Delete Batch"
                    style={{ width: '28px', height: '28px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="stat-value" style={{ fontSize: '1.35rem' }}>{b.name}</div>
                <div className="stat-subtext" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Students: <strong>{b.studentCount || 0} enrolled</strong></span>
                  {isSelected && <span style={{ color: 'var(--primary-navy)', fontWeight: 700 }}>Active</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Roster Section */}
      {selectedBatch && (
        <div className="table-card">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                Student Roster — {selectedBatch}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Total Enrolled: {students.length} students
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setFeeSetupForm({ batch: selectedBatch, semester: '1st Semester', dueFee: '' });
                  setIsFeeSetupModalOpen(true);
                  setError('');
                }}
                className="btn btn-secondary btn-sm"
              >
                <DollarSign size={16} />
                <span>Assign Semester Due Fee</span>
              </button>

              <button
                onClick={() => {
                  setStudentForm({ name: '', fname: '', rollNo: '', batch: selectedBatch });
                  setIsStudentModalOpen(true);
                  setError('');
                }}
                className="btn btn-accent btn-sm"
              >
                <UserPlus size={16} />
                <span>Add Student to Batch</span>
              </button>
            </div>
          </div>

          <div style={{ padding: '0.85rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search students by Roll No, Name, Father's Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Father's Name (fname)</th>
                    <th>Batch</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No students enrolled in <strong>{selectedBatch}</strong> yet. Click <strong>"Add Student to Batch"</strong> to create student records.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st._id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{st.rollNo}</td>
                        <td style={{ fontWeight: 600 }}>{st.name}</td>
                        <td>{st.fname}</td>
                        <td>
                          <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                            {st.batch}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteStudent(st._id, st.name)}
                            className="btn-icon delete"
                            title="Remove Student"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      {isBatchModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Academic Batch</h2>
              <button onClick={() => setIsBatchModalOpen(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleCreateBatch}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Batch Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. BSN 2024-2028 or Batch-05"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 4-Year BS Nursing Degree Program"
                    value={newBatchDesc}
                    onChange={(e) => setNewBatchDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsBatchModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isStudentModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Add Student to Batch ({selectedBatch})</h2>
              <button onClick={() => setIsStudentModalOpen(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleCreateStudent}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Roll No</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. BSN-101 or 2024-001"
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                    required
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Student Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Full Name"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Father's Name (fname)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Father's Name"
                      value={studentForm.fname}
                      onChange={(e) => setStudentForm({ ...studentForm, fname: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsStudentModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Semester Due Fee Modal */}
      {isFeeSetupModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Assign Semester Due Fee ({selectedBatch})</h2>
              <button onClick={() => setIsFeeSetupModalOpen(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSetupSemesterFee}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Target Semester</label>
                  <select
                    className="form-control"
                    value={feeSetupForm.semester}
                    onChange={(e) => setFeeSetupForm({ ...feeSetupForm, semester: e.target.value })}
                    required
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Semester Due Fee Amount (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="e.g. 75000"
                    value={feeSetupForm.dueFee}
                    onChange={(e) => setFeeSetupForm({ ...feeSetupForm, dueFee: e.target.value })}
                    required
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    This will assign PKR {feeSetupForm.dueFee || '0'} due fee to all students in <strong>{selectedBatch}</strong> for <strong>{feeSetupForm.semester}</strong>. Individual student amounts can also be edited later in Fee Management.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsFeeSetupModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign Due Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
