import React from 'react';
import { useAuth, type RoleType } from '../context/AuthContext';
import { ArrowLeft, Shield, Kanban, Code2, Eye, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  onBackHome: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onBackHome }) => {
  const { currentRole, setCurrentRole, user, logout } = useAuth();

  const roles: { id: RoleType; label: string; icon: React.ReactNode; badge: string }[] = [
    { id: 'ADMIN', label: 'Quản trị', icon: <Shield size={14} />, badge: 'ADMIN' },
    { id: 'PROJECT_MANAGER', label: 'Quản lý dự án', icon: <Kanban size={14} />, badge: 'PROJECT MANAGER' },
    { id: 'DEVELOPER', label: 'Nhà phát triển', icon: <Code2 size={14} />, badge: 'DEVELOPER' },
    { id: 'VIEWER', label: 'Người xem', icon: <Eye size={14} />, badge: 'VIEWER' },
  ];

  const currentRoleObj = roles.find((r) => r.id === currentRole) || roles[0];

  const handleLogout = async () => {
    await logout();
    onBackHome();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand & Active Role Badge */}
        <div className="flex items-center gap-3">
          <div 
            onClick={onBackHome}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-xs">
              W
            </div>
            <span className="font-semibold text-lg text-gray-900 tracking-tight">WorkFlowHub</span>
          </div>
          <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider rounded-md bg-emerald-100 text-emerald-800 uppercase">
            {currentRoleObj.badge}
          </span>
        </div>

        {/* Role Switcher Pill Bar (As seen in Mockup images 5, 6, 7, 8) */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-full border border-gray-200/60">
          {roles.map((r) => {
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Actions: User Info, Logout & Back to Home */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-700">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                {user.avatar || user.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <span className="max-w-[120px] truncate">{user.name}</span>
            </div>
          )}

          <button
            onClick={onBackHome}
            className="text-xs font-medium text-gray-500 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Trang chủ
          </button>

          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
