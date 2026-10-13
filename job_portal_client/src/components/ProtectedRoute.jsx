import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Chặn trang theo đăng nhập và vai trò. roles: ['RECRUITER'], ['JOB_SEEKER'], ... (bỏ trống = chỉ cần đăng nhập)
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
