import React, { useState } from 'react';
import { AuthProvider, useAuth, type RoleType } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardHeader } from './components/DashboardHeader';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { ProjectManagerDashboard } from './pages/ProjectManagerDashboard';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { ViewerDashboard } from './pages/ViewerDashboard';

const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard'>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const { currentRole, setCurrentRole, user, isAuthenticated } = useAuth();

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleGoToDashboard = (targetRole?: RoleType) => {
    if (targetRole) {
      setCurrentRole(targetRole);
    } else if (isAuthenticated && user) {
      const normalizedRole = (user.roleName || user.role || 'USER').toUpperCase();
      setCurrentRole(normalizedRole === 'ADMIN' ? 'ADMIN' : 'USER');
    }
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDashboardByRole = () => {
    // 1. Phân quyền khi đã đăng nhập (Dựa trên roleName từ backend)
    if (isAuthenticated && user) {
      const normalizedRole = (user.roleName || user.role || '').toUpperCase();
      if (normalizedRole === 'ADMIN') {
        return <AdminDashboard />;
      }
      // Không phải admin -> toàn bộ user đều vào UserDashboard
      return <UserDashboard />;
    }

    // 2. Chế độ xem trước (Preview demo)
    switch (currentRole) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'USER':
        return <UserDashboard />;
      case 'PROJECT_MANAGER':
        return <ProjectManagerDashboard />;
      case 'DEVELOPER':
        return <DeveloperDashboard />;
      case 'VIEWER':
        return <ViewerDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col font-sans">
      {currentPage === 'home' ? (
        <Navbar
          onNavigate={(page) => {
            if (page === 'dashboard') {
              handleGoToDashboard();
            } else {
              setCurrentPage('home');
            }
          }}
          onOpenLogin={() => handleOpenAuth('login')}
          onOpenRegister={() => handleOpenAuth('register')}
        />
      ) : (
        <DashboardHeader onBackHome={() => setCurrentPage('home')} />
      )}

      <main className="flex-1">
        {currentPage === 'home' ? (
          <LandingPage
            onGoToDashboard={handleGoToDashboard}
            onOpenLogin={() => handleOpenAuth('login')}
            onOpenRegister={() => handleOpenAuth('register')}
          />
        ) : (
          renderDashboardByRole()
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          handleGoToDashboard();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
