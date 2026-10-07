import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  FolderKanban, 
  ListTodo, 
  Plus, 
  Activity, 
  Search, 
  Check, 
  Calendar, 
  Layers, 
  Sparkles, 
  FolderPlus, 
  ArrowRight, 
  Loader2,
  ChevronDown,
  ChevronUp,
  ListChecks
} from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { SubtaskList } from '../components/SubtaskList';
import { ProjectService, TaskService, ActivityLogService } from '../services/api';
import type { Project, Task, ActivityLog } from '../types';

interface UserDashboardProps {
  onGoToProjectManager?: (projectId?: number) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onGoToProjectManager }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'myTasks' | 'myProjects' | 'activities'>('myTasks');
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [createdProjectNotification, setCreatedProjectNotification] = useState<string | null>(null);

  // Danh sách công việc cá nhân (100% dữ liệu thực từ Backend API)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  // Projects list (100% dữ liệu thực từ backend)
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Hoạt động gần đây (Dữ liệu thực từ backend)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const sidebarItems = [
    { id: 'myTasks', label: 'Công việc của tôi', icon: ListTodo },
    { id: 'myProjects', label: 'Dự án tham gia', icon: FolderKanban },
    { id: 'activities', label: 'Hoạt động gần đây', icon: Activity },
  ];

  // 1. Tải danh sách dự án
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const remoteProjects = await ProjectService.getProjects();
        if (remoteProjects) {
          const formatted = remoteProjects.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || 'Chưa có mô tả dự án',
            membersCount: 1,
            progress: 0,
            activeSprint: 'Chưa có sprint',
            roleInProject: p.ownerId === user?.id ? 'Project Manager (Quản lý)' : 'Thành viên',
            ownerId: p.ownerId,
          }));
          setProjectsList(formatted);
        }
      } catch (err) {
        console.warn('Could not load remote projects:', err);
        setProjectsList([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [user?.id]);

  // 2. Tải danh sách công việc của user từ Backend API
  useEffect(() => {
    if (user?.id) {
      loadUserTasks();
    }
  }, [user?.id, projectsList]);

  const loadUserTasks = async () => {
    if (!user?.id) return;
    setLoadingTasks(true);
    try {
      // Gọi API lấy công việc được phân công cho user
      const myTasks = await TaskService.getMyTasks(user.id);
      if (myTasks) {
        // Chỉ lấy đúng các task được gán cho user hiện tại (assigneeId === user.id)
        const onlyMyTasks = myTasks.filter((t) => t.assigneeId === user.id);
        setTasks(onlyMyTasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.warn('Lỗi khi tải công việc của tôi từ máy chủ:', err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // 3. Tải hoạt động gần đây từ API
  useEffect(() => {
    if (activeTab === 'activities') {
      loadActivities();
    }
  }, [activeTab]);

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const logs = await ActivityLogService.getActivityLogs(0, 20);
      setActivityLogs(logs || []);
    } catch (err) {
      console.warn('Lỗi khi tải hoạt động từ máy chủ:', err);
      setActivityLogs([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    const projectItem = {
      id: newProject.id,
      name: newProject.name,
      description: newProject.description || 'Chưa có mô tả dự án',
      membersCount: 1,
      progress: 0,
      activeSprint: 'Chưa bắt đầu sprint',
      roleInProject: 'Project Manager (Chủ dự án)',
      ownerId: newProject.ownerId,
    };
    setProjectsList((prev) => [projectItem, ...prev]);
    setCreatedProjectNotification(
      `Đã tạo thành công dự án "${newProject.name}"! Bạn đã được cấp quyền Project Manager.`
    );
    if (onGoToProjectManager) {
      setTimeout(() => {
        onGoToProjectManager(newProject.id);
      }, 1200);
    }
  };

  // Chuẩn hóa trạng thái công việc (Hỗ trợ trạng thái CLOSED cho member)
  const normalizeStatus = (status?: string): 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'CLOSED' => {
    if (!status) return 'TO_DO';
    const s = status.trim().toUpperCase();
    if (s === 'CLOSED' || s === 'CLOSE' || s === 'ĐÃ ĐÓNG' || s === 'ĐÓNG') return 'CLOSED';
    if (s === 'DONE' || s === 'COMPLETED' || s === 'ĐÃ XONG' || s === 'HOÀN THÀNH') return 'DONE';
    if (s === 'IN_PROGRESS' || s === 'PROGRESS' || s === 'ĐANG LÀM') return 'IN_PROGRESS';
    return 'TO_DO';
  };

  const handleToggleTask = async (taskId: number) => {
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    const isDone = normalizeStatus(currentTask.status) === 'DONE';
    const nextStatus = isDone ? 'IN_PROGRESS' : 'DONE';

    // Cập nhật giao diện tức thì
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: nextStatus,
            progress: nextStatus === 'DONE' ? 100 : 50,
          };
        }
        return t;
      })
    );

    // Đồng bộ lên backend API
    try {
      await TaskService.updateTask(taskId, { status: nextStatus });
    } catch (err) {
      console.warn('Lỗi khi cập nhật trạng thái task lên máy chủ:', err);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              progress: newStatus === 'DONE' || newStatus === 'CLOSED' ? 100 : 50,
            }
          : t
      )
    );
    try {
      await TaskService.updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.warn('Lỗi khi cập nhật trạng thái:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    // Yêu cầu có projectId từ dự án đầu tiên của user
    const targetProject = projectsList[0];
    if (!targetProject) {
      alert('Vui lòng tạo hoặc tham gia dự án trước khi tạo công việc.');
      setIsCreateProjectOpen(true);
      return;
    }

    try {
      const newTask = await TaskService.createTask({
        projectId: targetProject.id,
        assigneeId: user?.id,
        title: newTaskTitle.trim(),
        status: 'TO_DO',
        priority: 'MEDIUM',
      });
      setTasks((prev) => [newTask, ...prev]);
      setNewTaskTitle('');
    } catch (err: any) {
      console.error('Lỗi khi tạo công việc mới:', err);
      alert(err.message || 'Không thể tạo công việc. Vui lòng thử lại!');
    }
  };

  // Lọc công việc theo bộ lọc trạng thái và từ khóa tìm kiếm
  const filteredTasks = tasks.filter((t) => {
    const statusNorm = normalizeStatus(t.status);
    const matchFilter = taskFilter === 'ALL' || statusNorm === taskFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      t.title.toLowerCase().includes(query) ||
      (t.category && t.category.toLowerCase().includes(query)) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      `#${t.id}`.includes(query) ||
      `task-${t.id}`.toLowerCase().includes(query) ||
      (t.taskCode && t.taskCode.toLowerCase().includes(query));
    return matchFilter && matchSearch;
  });

  const activeTasksCount = tasks.filter((t) => normalizeStatus(t.status) === 'IN_PROGRESS').length;
  const todoTasksCount = tasks.filter((t) => normalizeStatus(t.status) === 'TO_DO').length;
  const doneTasksCount = tasks.filter((t) => normalizeStatus(t.status) === 'DONE').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Banner Chào Mừng */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <Sparkles size={14} className="text-yellow-300" />
              <span>Bảng điều khiển Thành viên (User Workspace)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Xin chào, {user?.name || 'Thành viên'} 👋
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
              Không gian làm việc dành riêng cho thành viên. Theo dõi các nhiệm vụ được giao, cập nhật tiến độ công việc và phối hợp cùng nhóm hiệu quả.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <FolderPlus size={16} className="text-emerald-600" />
              <span>Tạo dự án mới</span>
            </button>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <div className="text-[11px] text-emerald-100">Vai trò hệ thống</div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">
                {user?.roleName || 'USER'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <div className="text-[11px] text-emerald-100">Dự án tham gia</div>
              <div className="text-sm font-bold text-white">{projectsList.length}</div>
            </div>
          </div>
        </div>
      </div>

      {createdProjectNotification && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{createdProjectNotification}</span>
          </div>
          {onGoToProjectManager && (
            <button
              onClick={() => onGoToProjectManager()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <span>Vào trang Quản lý dự án</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* Metric KPI Cards (4 cards tính toán trực tiếp từ dữ liệu thực) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{tasks.length}</div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">Tổng nhiệm vụ</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ListTodo size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600">{activeTasksCount}</div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">Đang thực hiện</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{doneTasksCount}</div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">Đã hoàn thành</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">{todoTasksCount}</div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">Cần xử lý</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-gray-400 tracking-wider px-3 py-2 uppercase">
              Bảng điều khiển
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

          {/* User Profile Card Summary */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3">
            <div className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Tài khoản của bạn
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {user?.avatar || user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-gray-900 truncate">{user?.name}</div>
                <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 flex justify-between">
              <span>Trạng thái:</span>
              <span className="font-semibold text-emerald-600">Đang hoạt động</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: CÔNG VIỆC CỦA TÔI */}
          {activeTab === 'myTasks' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Nhiệm vụ của tôi</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Quản lý và cập nhật tiến độ các đầu việc được giao.
                  </p>
                </div>

                {/* Filter pills theo Status */}
                <div className="flex items-center bg-gray-100/80 p-1 rounded-xl text-xs font-medium overflow-x-auto">
                  {(['ALL', 'TO_DO', 'IN_PROGRESS', 'DONE', 'CLOSED'] as const).map((filter) => {
                    const labels = {
                      ALL: 'Tất cả',
                      TO_DO: 'Cần làm',
                      IN_PROGRESS: 'Đang làm',
                      DONE: 'Đã xong',
                      CLOSED: 'Đã đóng',
                    };
                    const isActive = taskFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setTaskFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-white text-gray-900 font-semibold shadow-xs'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        {labels[filter]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Add Task & Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm công việc theo mã (#1), tên..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-800"
                  />
                </div>

                <form onSubmit={handleCreateTask} className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Thêm nhanh nhiệm vụ mới..."
                    className="pl-4 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-56 text-gray-800"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    <Plus size={15} /> Thêm
                  </button>
                </form>
              </div>

              {/* Task Items List */}
              {loadingTasks ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                  <span>Đang tải nhiệm vụ của bạn...</span>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 space-y-2 border-2 border-dashed border-gray-100 rounded-2xl">
                  <ListTodo size={28} className="mx-auto text-gray-300" />
                  <p>Không có công việc nào phù hợp trong danh sách.</p>
                  <span className="text-[11px] text-gray-400">
                    {taskFilter !== 'ALL'
                      ? 'Thử chuyển sang bộ lọc "Tất cả" hoặc tạo công việc mới bên trên.'
                      : 'Hãy thêm nhanh nhiệm vụ bằng ô nhập bên trên.'}
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredTasks.map((task) => {
                    const statusNorm = normalizeStatus(task.status);
                    const isDone = statusNorm === 'DONE';
                    const isInProgress = statusNorm === 'IN_PROGRESS';
                    const isExpanded = expandedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className="py-3.5 px-2 rounded-xl hover:bg-gray-50/60 transition-colors space-y-2 group"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task.id)}
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-gray-300 hover:border-emerald-500 bg-white'
                              }`}
                            >
                              {isDone && <Check size={13} strokeWidth={3} />}
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                                  #{task.id}
                                </span>
                                <p
                                  className={`text-xs font-medium transition-all truncate ${
                                    isDone ? 'text-gray-400 line-through' : 'text-gray-900'
                                  }`}
                                >
                                  {task.title}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                {task.category && (
                                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                    {task.category}
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Calendar size={11} /> {task.dueDate || 'Hạn chót'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                                  className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 ml-2 cursor-pointer"
                                >
                                  <ListChecks size={12} />
                                  <span>Việc phụ (Subtasks)</span>
                                  {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                                task.priority === 'HIGH'
                                  ? 'bg-red-50 text-red-700 border border-red-100'
                                  : task.priority === 'MEDIUM'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {task.priority === 'HIGH'
                                ? 'Ưu tiên Cao'
                                : task.priority === 'MEDIUM'
                                ? 'Trung bình'
                                : 'Ưu tiên Thấp'}
                            </span>

                            <select
                              value={statusNorm}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isInProgress
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : statusNorm === 'CLOSED'
                                  ? 'bg-gray-100 text-gray-500 border-gray-300'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <option value="TO_DO">Cần làm (To Do)</option>
                              <option value="IN_PROGRESS">Đang làm (In Progress)</option>
                              <option value="DONE">Hoàn thành (Done)</option>
                              <option value="CLOSED">Đã đóng (Closed)</option>
                            </select>
                          </div>
                        </div>

                        {/* Expandable Subtask List */}
                        {isExpanded && (
                          <div className="pl-8 pt-1 animate-in fade-in">
                            <SubtaskList taskId={task.id} compact />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DỰ ÁN THAM GIA */}
          {activeTab === 'myProjects' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Dự án tham gia & Quản lý</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Danh sách các dự án bạn đang tham gia đóng góp hoặc đóng vai trò Project Manager.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreateProjectOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <FolderPlus size={15} />
                    <span>Tạo dự án mới</span>
                  </button>
                </div>

                {loadingProjects ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                    <Loader2 size={24} className="animate-spin text-emerald-600" />
                    <span>Đang tải danh sách dự án...</span>
                  </div>
                ) : projectsList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400 space-y-3 border-2 border-dashed border-gray-100 rounded-2xl">
                    <p>Bạn chưa tham gia hoặc tạo dự án nào.</p>
                    <button
                      onClick={() => setIsCreateProjectOpen(true)}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      + Bấm vào đây để tạo dự án đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectsList.map((p) => {
                      const isOwner = p.ownerId === user?.id || (p.roleInProject && p.roleInProject.includes('Project Manager'));
                      return (
                        <div
                          key={p.id}
                          onClick={() => onGoToProjectManager && onGoToProjectManager(p.id)}
                          className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-300 bg-white hover:shadow-md transition-all space-y-4 flex flex-col justify-between cursor-pointer group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:bg-emerald-100 transition-colors">
                                <FolderKanban size={20} />
                              </div>
                              <span
                                className={`px-2.5 py-1 text-[10px] font-semibold rounded-md border ${
                                  isOwner
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {p.roleInProject}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{p.name}</h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {p.description}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-gray-100">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 font-medium">Tiến độ dự án</span>
                                <span className="font-bold text-emerald-700">{p.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-600 rounded-full transition-all"
                                  style={{ width: `${p.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-gray-400">
                              <span>Sprint: <strong className="text-gray-700 font-medium">{p.activeSprint}</strong></span>
                              {isOwner && onGoToProjectManager && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onGoToProjectManager(p.id);
                                  }}
                                  className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Quản lý dự án</span>
                                  <ArrowRight size={12} />
                                </button>
                              )}
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

          {/* TAB 3: HOẠT ĐỘNG GẦN ĐÂY (Dữ liệu thực từ API) */}
          {activeTab === 'activities' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Hoạt động gần đây</h2>
              <p className="text-xs text-gray-500">
                Nhật ký thao tác và cập nhật trạng thái thực tế từ hệ thống.
              </p>

              {loadingActivities ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                  <span>Đang tải hoạt động...</span>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 space-y-2 border-2 border-dashed border-gray-100 rounded-2xl">
                  <Activity size={24} className="mx-auto text-gray-300" />
                  <p>Chưa có hoạt động nào được ghi nhận gần đây.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 pt-2">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-semibold text-[11px]">
                          {(log.userName || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">{log.userName}</span>{' '}
                          <span className="text-gray-500">{log.action}</span>{' '}
                          <span className="font-medium text-emerald-700">{log.target}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400">{log.timeAgo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Tạo Dự Án Mới */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
};
