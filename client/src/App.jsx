import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Batches } from './pages/Batches';
import { FeeManagement } from './pages/FeeManagement';
import { FeeSlips } from './pages/FeeSlips';
import { FeeSlipFormModal } from './components/FeeSlipFormModal';
import { FeeSlipDetailModal } from './components/FeeSlipDetailModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import './App.css';

const AppLayout = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [defaultStudent, setDefaultStudent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenAddModal = () => {
    setSelectedSlip(null);
    setDefaultStudent(null);
    setIsFormModalOpen(true);
  };

  const handleOpenAddModalWithStudent = (studentData) => {
    setSelectedSlip(null);
    setDefaultStudent(studentData);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (slip) => {
    setSelectedSlip(slip);
    setDefaultStudent(null);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (slip) => {
    setSelectedSlip(slip);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeleteModal = (slip) => {
    setSelectedSlip(slip);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard onOpenAddModal={handleOpenAddModal} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batches"
            element={
              <ProtectedRoute>
                <Batches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fee-management"
            element={
              <ProtectedRoute>
                <FeeManagement
                  onOpenAddModalWithStudent={handleOpenAddModalWithStudent}
                  onOpenDetailModal={handleOpenDetailModal}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fee-slips"
            element={
              <ProtectedRoute>
                <FeeSlips
                  onOpenAddModal={handleOpenAddModal}
                  onOpenEditModal={handleOpenEditModal}
                  onOpenDetailModal={handleOpenDetailModal}
                  onOpenDeleteModal={handleOpenDeleteModal}
                  refreshTrigger={refreshTrigger}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Modals */}
      <FeeSlipFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        slipToEdit={selectedSlip}
        defaultStudent={defaultStudent}
        onSuccess={handleSuccess}
      />

      <FeeSlipDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        slip={selectedSlip}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        slip={selectedSlip}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
