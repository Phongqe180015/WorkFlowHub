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
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const { currentRole, setCurrentRole, user, isAuthenticated } = useAuth();

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenProjectManager = (projectId?: number) => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
    setCurrentRole('PROJECT_MANAGER');
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToDashboard = (targetRole?: RoleType) => {
    if (targetRole) {
      setCurrentRole(targetRole);
    } else if (isAuthenticated && user) {
      const normalizedRole = (user.roleName || user.role || 'USER').toUpperCase();
      if (normalizedRole === 'ADMIN') {
        setCurrentRole('ADMIN');
      } else if (currentRole === 'PROJECT_MANAGER') {
        setCurrentRole('PROJECT_MANAGER');
      } else {
        setCurrentRole('USER');
      }
    }
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDashboardByRole = () => {
    // 1. Phân quyền khi đã đăng nhập (Dựa trên roleName hoặc currentRole)
    if (isAuthenticated && user) {
      const activeRole = (currentRole || user.roleName || user.role || 'USER').toUpperCase();
      if (activeRole === 'ADMIN') {
        return <AdminDashboard />;
      }
      if (activeRole === 'PROJECT_MANAGER') {
        return (
          <ProjectManagerDashboard 
            initialProjectId={selectedProjectId}
            onSwitchToUserView={() => setCurrentRole('USER')} 
          />
        );
      }
      return <UserDashboard onGoToProjectManager={handleOpenProjectManager} />;
    }

    // 2. Chế độ xem trước (Preview demo)
    switch (currentRole) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'USER':
        return <UserDashboard onGoToProjectManager={handleOpenProjectManager} />;
      case 'PROJECT_MANAGER':
        return (
          <ProjectManagerDashboard 
            initialProjectId={selectedProjectId}
            onSwitchToUserView={() => setCurrentRole('USER')} 
          />
        );
      case 'DEVELOPER':
        return <DeveloperDashboard />;
      case 'VIEWER':
        return <ViewerDashboard />;
      default:
        return <UserDashboard onGoToProjectManager={handleOpenProjectManager} />;
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
