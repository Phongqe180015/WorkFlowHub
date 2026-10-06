import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ProjectService, 
  SprintService, 
  ProjectMemberService,
  TaskService
} from '../services/api';
import type { Project, Sprint, ProjectMember, Task } from '../types';
import { CreateSprintModal } from '../components/CreateSprintModal';
import { EditSprintModal } from '../components/EditSprintModal';
import { AddProjectMemberModal } from '../components/AddProjectMemberModal';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { 
  FolderKanban, 
  Sparkles, 
  Plus, 
  Calendar, 
  UserPlus, 
  Users, 
  ShieldCheck, 
  Trash2, 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  FolderPlus,
  Loader2,
  Edit3
} from 'lucide-react';

interface ProjectManagerDashboardProps {
  initialProjectId?: number | null;
  onSwitchToUserView?: () => void;
}

export const ProjectManagerDashboard: React.FC<ProjectManagerDashboardProps> = ({
  initialProjectId,
  onSwitchToUserView,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'currentSprint' | 'sprints' | 'members' | 'assignments' | 'projects'>('sprints');

  // Quản lý danh sách dự án (100% dữ liệu thực từ Backend)
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjectId || null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Sprints, Members & Tasks của dự án đang chọn
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Modals
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [isEditSprintOpen, setIsEditSprintOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sidebarItems = [
    { id: 'sprints', label: 'Quản lý Sprint', icon: Layers },
    { id: 'members', label: 'Thành viên & Phân quyền', icon: Users },
    { id: 'currentSprint', label: 'Sprint hiện tại & Burndown', icon: Sparkles },
    { id: 'assignments', label: 'Phân công công việc', icon: FolderKanban },
  ];

  // Đồng bộ khi initialProjectId thay đổi từ bên ngoài
  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  // 1. Tải danh sách các dự án
  useEffect(() => {
    loadProjects();
  }, [user?.id]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const fetchedProjects = await ProjectService.getProjects();
      if (fetchedProjects && fetchedProjects.length > 0) {
        setProjects(fetchedProjects);
        // Chọn initialProjectId nếu có, hoặc dự án do user sở hữu, hoặc dự án đầu tiên
        const target = initialProjectId
          ? fetchedProjects.find((p) => p.id === initialProjectId)
          : null;
        const myProject = target || fetchedProjects.find((p) => p.ownerId === user?.id) || fetchedProjects[0];
        setSelectedProjectId(myProject.id);
      } else {
        setProjects([]);
        setSelectedProjectId(null);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách dự án từ máy chủ:', err);
      setProjects([]);
      setSelectedProjectId(null);
    } finally {
      setLoadingProjects(false);
    }
  };

  // 2. Tải Sprints, Members và Tasks thực tế khi chọn dự án
  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
    } else {
      setSprints([]);
      setMembers([]);
      setTasks([]);
    }
  }, [selectedProjectId]);

  const loadProjectDetails = async (projectId: number) => {
    setLoadingDetails(true);
    try {
      const [fetchedSprints, fetchedMembers, fetchedTasks] = await Promise.all([
        SprintService.getSprintsByProjectId(projectId),
        ProjectMemberService.getMembersByProjectId(projectId),
        TaskService.getTasksByProjectId(projectId),
      ]);

      setSprints(fetchedSprints || []);
      setMembers(fetchedMembers || []);
      setTasks(fetchedTasks || []);
    } catch (err) {
      console.warn('Lỗi tải chi tiết dự án:', err);
      setSprints([]);
      setMembers([]);
      setTasks([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSprintCreated = (newSprint: Sprint) => {
    setSprints((prev) => [newSprint, ...prev]);
    showNotification('success', `Đã tạo thành công "${newSprint.name}"!`);
  };

  const handleSprintUpdated = (updatedSprint: Sprint) => {
    setSprints((prev) => prev.map((s) => (s.id === updatedSprint.id ? updatedSprint : s)));
    showNotification('success', `Đã cập nhật sprint "${updatedSprint.name}" thành công!`);
  };

  const handleDeleteSprint = async (sprint: Sprint) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa Sprint "${sprint.name}" không?`)) {
      return;
    }
    try {
      await SprintService.deleteSprint(sprint.id);
      setSprints((prev) => prev.filter((s) => s.id !== sprint.id));
      showNotification('success', `Đã xóa sprint "${sprint.name}" thành công!`);
    } catch (err: any) {
      console.error('Lỗi khi xóa sprint:', err);
      showNotification('error', err.message || 'Không thể xóa sprint.');
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    showNotification('success', `Đã giao việc "${newTask.title}" thành công!`);
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await TaskService.updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
      showNotification('success', 'Đã cập nhật trạng thái công việc!');
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái task:', err);
      showNotification('error', err.message || 'Không thể cập nhật trạng thái.');
    }
  };

  const handleDeleteTask = async (taskId: number, taskTitle?: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa công việc "${taskTitle || 'này'}" không?`)) {
      return;
    }
    try {
      await TaskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showNotification('success', 'Đã xóa công việc thành công!');
    } catch (err: any) {
      console.error('Lỗi khi xóa công việc:', err);
      showNotification('error', err.message || 'Không thể xóa công việc.');
    }
  };

  const handleMemberAdded = (newMember: ProjectMember) => {
    setMembers((prev) => [newMember, ...prev]);
    showNotification('success', `Đã thêm thành viên "${newMember.userName || 'Mới'}" với vai trò ${newMember.roleName || 'thành viên'}!`);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    showNotification('success', `Đã tạo thành công dự án "${newProject.name}"! Bạn là Project Manager của dự án này.`);
  };

  const handleRemoveMember = async (userId: number, userName?: string) => {
    if (!selectedProjectId) return;
    if (userId === user?.id) {
      alert('Bạn là người tạo dự án (Project Manager), không thể tự xóa chính mình.');
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn xóa thành viên "${userName || 'này'}" khỏi dự án?`)) {
      return;
    }

    try {
      await ProjectMemberService.removeMember(selectedProjectId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      showNotification('success', `Đã xóa thành viên khỏi dự án.`);
    } catch (err: any) {
      console.error('Lỗi khi xóa thành viên:', err);
      showNotification('error', err.message || 'Không thể xóa thành viên.');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Burndown chart data demo
  const burndownBars = [
    { day: 1, height: '80%', isHighlight: false },
    { day: 2, height: '80%', isHighlight: false },
    { day: 3, height: '70%', isHighlight: false },
    { day: 4, height: '58%', isHighlight: false },
    { day: 5, height: '50%', isHighlight: false },
    { day: 6, height: '42%', isHighlight: true },
    { day: 7, height: '32%', isHighlight: false },
    { day: 8, height: '22%', isHighlight: false },
    { day: 9, height: '14%', isHighlight: false },
    { day: 10, height: '6%', isHighlight: false },
  ];


  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Top Notification Toast */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-xs shadow-xs animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={18} className="shrink-0 text-red-600" />
          )}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Banner / Project Selection Bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-emerald-100 text-emerald-800 uppercase">
              Project Manager Workspace
            </span>
            {currentProject?.ownerId === user?.id && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                Chủ sở hữu dự án
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            {currentProject?.name || 'Dự án của bạn'}
          </h1>
          <p className="text-xs text-gray-500 max-w-xl">
            {currentProject?.description || 'Quản lý sprint, điều phối thành viên và giám sát tiến độ dự án.'}
          </p>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {loadingProjects && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 size={14} className="animate-spin text-emerald-600" />
              <span>Đang tải dự án...</span>
            </div>
          )}
          {projects.length > 1 && (
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-200"
          >
            <FolderPlus size={15} />
            <span>Tạo dự án mới</span>
          </button>

          {onSwitchToUserView && (
            <button
              onClick={onSwitchToUserView}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Về Workspace Thành viên</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-gray-400 tracking-wider px-3 py-2 uppercase">
              Quản trị Sprint & Nhân sự
            </div>
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Metrics Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3">
            <div className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Tổng quan dự án
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Tổng Sprint:</span>
                <span className="font-bold text-gray-900">{sprints.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Thành viên:</span>
                <span className="font-bold text-gray-900">{members.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Tổng công việc:</span>
                <span className="font-bold text-gray-900">{tasks.length}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Trạng thái:</span>
                <span className="font-bold text-emerald-600">Đang thực hiện</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: QUẢN LÝ SPRINT */}
          {activeTab === 'sprints' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Danh sách Sprint</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Lập kế hoạch và theo dõi các chu kỳ phát triển của dự án.
                    </p>
                  </div>
                  {selectedProjectId && (
                    <button
                      onClick={() => setIsCreateSprintOpen(true)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <Plus size={16} />
                      <span>Tạo Sprint mới</span>
                    </button>
                  )}
                </div>

                {loadingDetails ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                    <Loader2 size={24} className="animate-spin text-emerald-600" />
                    <span>Đang tải danh sách sprint...</span>
                  </div>
                ) : sprints.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400 space-y-3 border-2 border-dashed border-gray-100 rounded-2xl">
                    <p>Chưa có sprint nào được tạo cho dự án này.</p>
                    <button
                      onClick={() => setIsCreateSprintOpen(true)}
                      className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      + Bấm vào đây để tạo sprint đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sprints.map((sprint) => {
                      const isActive = sprint.status === 'ACTIVE';
                      const isCompleted = sprint.status === 'COMPLETED';
                      return (
                        <div
                          key={sprint.id}
                          className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 bg-white hover:shadow-xs transition-all space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">{sprint.name}</h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {sprint.goal || 'Chưa ghi chú mục tiêu cụ thể'}
                              </p>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : isCompleted
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}
                            >
                              {isActive ? 'Đang chạy' : isCompleted ? 'Đã xong' : 'Kế hoạch'}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-gray-400" />
                              {sprint.startDate} → {sprint.endDate}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingSprint(sprint);
                                  setIsEditSprintOpen(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Chỉnh sửa Sprint"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSprint(sprint)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Xóa Sprint"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: THÀNH VIÊN & PHÂN QUYỀN */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Thành viên & Phân vai trò</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Thêm thành viên vào dự án và chỉ định vai trò chuyên môn (đã tự động lọc ẩn quyền User & Admin).
                    </p>
                  </div>
                  {selectedProjectId && (
                    <button
                      onClick={() => setIsAddMemberOpen(true)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <UserPlus size={16} />
                      <span>Thêm thành viên</span>
                    </button>
                  )}
                </div>

                {loadingDetails ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                    <Loader2 size={24} className="animate-spin text-emerald-600" />
                    <span>Đang tải danh sách thành viên...</span>
                  </div>
                ) : members.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    Chưa có thành viên nào trong dự án.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {members.map((member) => {
                      const isOwner = member.roleName === 'PROJECT_MANAGER' || member.userId === user?.id;
                      return (
                        <div
                          key={`${member.projectId}-${member.userId}`}
                          className="py-4 flex items-center justify-between gap-4 group hover:bg-gray-50/60 px-3 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                              {(member.userName || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {member.userName || `Thành viên #${member.userId}`}
                                </p>
                                {member.userId === user?.id && (
                                  <span className="text-[10px] text-gray-400 font-normal">
                                    (Bạn)
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">
                                {member.userEmail || `User ID: ${member.userId}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`px-3 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1.5 ${
                                member.roleName === 'PROJECT_MANAGER'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : member.roleName === 'DEVELOPER'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : member.roleName === 'TESTER'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <ShieldCheck size={13} />
                              <span>{member.roleName || 'MEMBER'}</span>
                            </span>

                            {!isOwner && (
                              <button
                                onClick={() => handleRemoveMember(member.userId, member.userName)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Xóa khỏi dự án"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SPRINT HIỆN TẠI & BURNDOWN */}
          {activeTab === 'currentSprint' && (
            <div className="space-y-6">
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">Sprint 1</div>
                  <div className="text-[11px] text-gray-500 mt-1">10 ngày làm việc</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600">68%</div>
                  <div className="text-[11px] text-gray-500 mt-1">Tiến độ sprint</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">12</div>
                  <div className="text-[11px] text-gray-500 mt-1">Thẻ công việc</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600">3</div>
                  <div className="text-[11px] text-gray-500 mt-1">Ngày còn lại</div>
                </div>
              </div>

              {/* Burndown Chart Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Biểu đồ Burndown — Tiến độ hoàn thành</h3>
                  <button
                    onClick={() => setActiveTab('sprints')}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Xem tất cả sprint
                  </button>
                </div>

                <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-2 pt-6">
                  {burndownBars.map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div
                        style={{ height: bar.height }}
                        className={`w-full max-w-[42px] rounded-lg transition-all duration-300 ${
                          bar.isHighlight
                            ? 'bg-emerald-600 shadow-sm'
                            : 'bg-emerald-200/90 hover:bg-emerald-300'
                        }`}
                      ></div>
                      <span className="text-[10px] text-gray-400 font-medium">{bar.day}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                  Còn <strong className="text-gray-800 font-semibold">2 điểm</strong> công việc chưa hoàn thành — nhịp độ hiện tại đủ để chốt sprint đúng hạn.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHÂN CÔNG CÔNG VIỆC */}
          {activeTab === 'assignments' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Phân công công việc (Tasks)</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Giao việc trực tiếp cho các thành viên trong dự án và giám sát tiến độ thực hiện.
                  </p>
                </div>
                {selectedProjectId && (
                  <button
                    onClick={() => setIsCreateTaskOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={16} />
                    <span>Giao việc mới (Tạo Task)</span>
                  </button>
                )}
              </div>

              {loadingDetails ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                  <span>Đang tải danh sách công việc...</span>
                </div>
              ) : tasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 space-y-3 border-2 border-dashed border-gray-100 rounded-2xl">
                  <p>Chưa có nhiệm vụ nào được phân công trong dự án này.</p>
                  <button
                    onClick={() => setIsCreateTaskOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    + Bấm vào đây để giao việc đầu tiên
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tasks.map((task) => {
                    const assignee = members.find((m) => m.userId === task.assigneeId);
                    const isDone = task.status === 'DONE';
                    const isInProgress = task.status === 'IN_PROGRESS';

                    return (
                      <div
                        key={task.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-gray-50/60 px-3 rounded-xl transition-colors"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {task.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                                task.priority === 'HIGH'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : task.priority === 'MEDIUM'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {task.priority || 'MEDIUM'}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-0.5">
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                Hạn: {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {/* Người được giao (Chỉ từ danh sách members của project) */}
                          {assignee || task.assigneeName ? (
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl text-xs">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                                {(task.assigneeName || assignee?.userName || 'U').substring(0, 2).toUpperCase()}
                              </div>
                              <div className="text-left">
                                <div className="text-[11px] font-semibold text-gray-800 leading-tight">
                                  {task.assigneeName || assignee?.userName}
                                </div>
                                <div className="text-[9px] text-gray-400 leading-tight">
                                  {assignee?.roleName || 'Thành viên'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 text-[11px] rounded-lg bg-gray-100 text-gray-500 italic">
                              Chưa gán
                            </span>
                          )}

                          {/* Trạng thái công việc */}
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border cursor-pointer focus:outline-none ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isInProgress
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            <option value="TO_DO">Cần làm</option>
                            <option value="IN_PROGRESS">Đang làm</option>
                            <option value="DONE">Hoàn thành</option>
                          </select>

                          {/* Nút xóa task */}
                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa công việc"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Tạo Sprint */}
      {selectedProjectId && (
        <CreateSprintModal
          projectId={selectedProjectId}
          isOpen={isCreateSprintOpen}
          onClose={() => setIsCreateSprintOpen(false)}
          onSuccess={handleSprintCreated}
        />
      )}

      {/* Modal Chỉnh Sửa Sprint */}
      <EditSprintModal
        sprint={editingSprint}
        isOpen={isEditSprintOpen}
        onClose={() => {
          setIsEditSprintOpen(false);
          setEditingSprint(null);
        }}
        onSuccess={handleSprintUpdated}
      />

      {/* Modal Giao Việc / Tạo Task Mới (Chỉ giao cho thành viên trong dự án) */}
      {selectedProjectId && (
        <CreateTaskModal
          projectId={selectedProjectId}
          members={members}
          sprints={sprints}
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onSuccess={handleTaskCreated}
        />
      )}

      {/* Modal Thêm Thành Viên */}
      {selectedProjectId && (
        <AddProjectMemberModal
          projectId={selectedProjectId}
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          onSuccess={handleMemberAdded}
          existingMemberUserIds={members.map((m) => m.userId)}
        />
      )}

      {/* Modal Tạo Dự Án Mới */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
};
