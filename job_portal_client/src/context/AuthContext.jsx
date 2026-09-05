import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('job_portal_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('job_portal_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('job_portal_user');
  };

  // Hàm chuyển Role nhanh cho mục đích DEMO đồ án
  const switchRole = (role) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem('job_portal_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        switchRole,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isRecruiter: user?.role === 'RECRUITER',
        isSeeker: user?.role === 'JOB_SEEKER' || !user?.role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
