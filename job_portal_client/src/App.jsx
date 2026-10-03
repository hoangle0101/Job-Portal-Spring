import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CandidateProfile from './pages/CandidateProfile';
import AdminDashboard from './pages/AdminDashboard';
import Account from './pages/Account';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="app-main">
            <Routes>
              {/* Trang công khai */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Trang cần đăng nhập, phân quyền theo vai trò */}
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="/my-applications" element={<ProtectedRoute roles={['JOB_SEEKER']}><CandidateProfile /></ProtectedRoute>} />
              <Route path="/recruiter/dashboard" element={<ProtectedRoute roles={['RECRUITER']}><RecruiterDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
