import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import { X, Upload, AlertCircle } from 'lucide-react';

export const FeeSlipFormModal = ({ isOpen, onClose, slipToEdit, defaultStudent, onSuccess }) => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    student: '',
    rollNo: '',
    name: '',
    fname: '',
    batch: '',
    semester: '1st Semester',
    amount: '',
    creditedTo: 'owner'
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load available batches on open
  useEffect(() => {
    if (isOpen) {
      api.getBatches()
        .then((res) => setBatches(res.data || []))
        .catch((err) => console.error('Error loading batches:', err));
    }
  }, [isOpen]);

  // Handle edit or pre-selected student props
  useEffect(() => {
    if (slipToEdit) {
      setFormData({
        student: slipToEdit.student || '',
        rollNo: slipToEdit.rollNo || '',
        name: slipToEdit.name || '',
        fname: slipToEdit.fname || '',
        batch: slipToEdit.batch || '',
        semester: slipToEdit.semester || '1st Semester',
        amount: slipToEdit.amount || '',
        creditedTo: slipToEdit.creditedTo || 'owner'
      });
      setPhotoPreview(slipToEdit.photo ? getImageUrl(slipToEdit.photo) : '');
    } else if (defaultStudent) {
      setFormData({
        student: defaultStudent.studentId || '',
        rollNo: defaultStudent.rollNo || '',
        name: defaultStudent.name || '',
        fname: defaultStudent.fname || '',
        batch: defaultStudent.batch || '',
        semester: defaultStudent.semester || '1st Semester',
        amount: '',
        creditedTo: 'owner'
      });
      setPhotoPreview('');
    } else {
      setFormData({
        student: '',
        rollNo: '',
        name: '',
        fname: '',
        batch: '',
        semester: '1st Semester',
        amount: '',
        creditedTo: 'owner'
      });
      setPhotoPreview('');
    }
    setPhotoFile(null);
    setError('');
  }, [slipToEdit, defaultStudent, isOpen]);

  // Load students whenever selected batch changes
  useEffect(() => {
    if (formData.batch) {
      api.getStudents({ batch: formData.batch })
        .then((res) => setStudents(res.data || []))
        .catch((err) => console.error('Error loading batch students:', err));
    } else {
      setStudents([]);
    }
  }, [formData.batch]);

  const handleStudentSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData({ ...formData, student: '', rollNo: '', name: '', fname: '' });
      return;
    }
    const found = students.find((s) => s._id === selectedId);
    if (found) {
      setFormData({
        ...formData,
        student: found._id,
        rollNo: found.rollNo,
        name: found.name,
        fname: found.fname
      });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      if (formData.student) data.append('student', formData.student);
      data.append('rollNo', formData.rollNo);
      data.append('name', formData.name);
      data.append('fname', formData.fname);
      data.append('batch', formData.batch);
      data.append('semester', formData.semester);
      data.append('amount', formData.amount);
      data.append('creditedTo', formData.creditedTo);

      if (photoFile) {
        data.append('photo', photoFile);
      }

      if (slipToEdit) {
        await api.updateFeeSlip(slipToEdit._id, data);
      } else {
        await api.createFeeSlip(data);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Save fee slip error:', err);
      setError(err.message || 'Failed to save fee slip record.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {slipToEdit ? 'Edit Fee Slip Record' : 'Record Fee Slip (Installment)'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Select Batch & Semester */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Academic Batch</label>
                <select
                  className="form-control"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value, student: '', name: '', fname: '', rollNo: '' })}
                  required
                >
                  <option value="">-- Select Batch --</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  {formData.batch && !batches.some((b) => b.name === formData.batch) && (
                    <option value={formData.batch}>{formData.batch}</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Semester</label>
                <select
                  className="form-control"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
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
            </div>

            {/* Step 2: Select Student */}
            <div className="form-group">
              <label className="form-label">Select Student User (from {formData.batch || 'Batch'})</label>
              <select
                className="form-control"
                value={formData.student}
                onChange={handleStudentSelect}
              >
                <option value="">-- Choose Enrolled Student --</option>
                {students.map((st) => (
                  <option key={st._id} value={st._id}>
                    [{st.rollNo}] {st.name} — s/o {st.fname}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Student Details (Auto-filled or editable) */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Roll No</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. BSN-101"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Student Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Father's Name (fname)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Father's Name"
                value={formData.fname}
                onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                required
              />
            </div>

            {/* Step 4: Fee Slip Amount & Destination */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Installment Amount (PKR)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="e.g. 35000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Credited Account Destination</label>
                <select
                  className="form-control"
                  value={formData.creditedTo}
                  onChange={(e) => setFormData({ ...formData, creditedTo: e.target.value })}
                  required
                >
                  <option value="owner">Owner</option>
                  <option value="bank">Bank</option>
                  <option value="utilized in college">Utilized in College</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deposit Slip / Receipt Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="form-control"
              />
              {photoPreview && (
                <div className="image-preview-container">
                  <img
                    src={photoPreview}
                    alt="Receipt preview"
                    className="image-preview"
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Selected receipt image for installment slip
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-accent"
              disabled={loading}
            >
              {loading
                ? 'Saving Record...'
                : slipToEdit
                ? 'Update Fee Slip'
                : 'Save Fee Slip Installment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
