import { createContext, useContext, useState } from 'react';
import { STORAGE_KEY } from '../services/api';

const AuthContext = createContext();

// Lưu người dùng đăng nhập (kèm JWT token) trong state + localStorage để giữ phiên khi tải lại trang
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // userData = response của /auth/login hoặc /auth/register (có token)
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Cập nhật thông tin hiển thị (tên, SĐT, avatar) nhưng giữ nguyên token
  const updateUser = (changes) => {
    setUser((current) => {
      const updated = { ...current, ...changes, token: current?.token };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isRecruiter: user?.role === 'RECRUITER',
        isSeeker: user?.role === 'JOB_SEEKER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
