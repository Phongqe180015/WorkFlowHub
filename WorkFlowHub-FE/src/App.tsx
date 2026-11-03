import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, type RoleType } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardHeader } from './components/DashboardHeader';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { ProjectManagerDashboard } from './pages/ProjectManagerDashboard';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { ViewerDashboard } from './pages/ViewerDashboard';

import { TokenStorage } from './utils/tokenStorage';

const MainApp: React.FC = () => {
  const { currentRole, setCurrentRole, user, isAuthenticated, sessionExpiredMessage } = useAuth();

  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'profile'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('token') || TokenStorage.getToken()) {
      return 'dashboard';
    }
    return 'home';
  });

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('token')) {
      setCurrentPage('dashboard');
    } else if (isAuthenticated && currentPage === 'home') {
      setCurrentPage('dashboard');
    } else if (!isAuthenticated && currentPage !== 'home') {
      setCurrentPage('home');
    }
  }, [isAuthenticated, currentPage]);

  // When session expires, prompt user to log back in
  useEffect(() => {
    if (sessionExpiredMessage && !isAuthenticated) {
      setAuthMode('login');
      setAuthModalOpen(true);
    }
  }, [sessionExpiredMessage, isAuthenticated]);

  // Handle open task event from notification bell
  useEffect(() => {
    const handleOpenTask = () => {
      setCurrentPage('dashboard');
      if (currentRole !== 'USER') {
        setCurrentRole('USER');
      }
    };
    window.addEventListener('workflowhub:open-task', handleOpenTask);
    return () => {
      window.removeEventListener('workflowhub:open-task', handleOpenTask);
    };
  }, [currentRole]);

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
    // 1. Role dispatch when authenticated (based on roleName or currentRole)
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
      return <UserDashboard onGoToProjectManager={handleOpenProjectManager} onOpenProfile={() => setCurrentPage('profile')} />;
    }

    // 2. Preview mode (Demo)
    switch (currentRole) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'USER':
        return <UserDashboard onGoToProjectManager={handleOpenProjectManager} onOpenProfile={() => setCurrentPage('profile')} />;
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
        return <UserDashboard onGoToProjectManager={handleOpenProjectManager} onOpenProfile={() => setCurrentPage('profile')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col font-sans">
      {currentPage === 'home' ? (
        <Navbar
          onNavigate={(page) => {
            if (page === 'dashboard') {
              handleGoToDashboard();
            } else if (page === 'profile') {
              setCurrentPage('profile');
            } else {
              setCurrentPage('home');
            }
          }}
          onOpenLogin={() => handleOpenAuth('login')}
          onOpenRegister={() => handleOpenAuth('register')}
        />
      ) : (
        <DashboardHeader
          onBackHome={() => setCurrentPage('home')}
          onOpenProfile={() => setCurrentPage('profile')}
        />
      )}

      <main className="flex-1">
        {currentPage === 'home' ? (
          <LandingPage
            onGoToDashboard={handleGoToDashboard}
            onOpenLogin={() => handleOpenAuth('login')}
            onOpenRegister={() => handleOpenAuth('register')}
          />
        ) : currentPage === 'profile' ? (
          <ProfilePage onBack={() => handleGoToDashboard()} />
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
