import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockTasks, mockActivityLogs } from '../data/mockData';
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
  Sparkles
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'myTasks' | 'myProjects' | 'activities'>('myTasks');
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'TO_DO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Danh sách công việc cá nhân
  const [tasks, setTasks] = useState(mockTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const sidebarItems = [
    { id: 'myTasks', label: 'Công việc của tôi', icon: ListTodo },
    { id: 'myProjects', label: 'Dự án tham gia', icon: FolderKanban },
    { id: 'activities', label: 'Hoạt động gần đây', icon: Activity },
  ];

  // Projects list
  const userProjects = [
    {
      id: 1,
      name: 'Hệ thống Quản lý Sprint WorkFlowHub',
      description: 'Nền tảng phân phối và theo dõi tiến độ sprint tinh gọn cho đội ngũ phát triển.',
      membersCount: 8,
      progress: 68,
      activeSprint: 'Sprint 32 - Hoàn thiện MVP',
      roleInProject: 'Thành viên đóng góp',
    },
    {
      id: 2,
      name: 'Dịch vụ Thông báo & Tích hợp Kafka',
      description: 'Hạ tầng gửi email, thông báo real-time qua WebSocket và Kafka queue.',
      membersCount: 4,
      progress: 45,
      activeSprint: 'Sprint 14 - Kafka Broker Integration',
      roleInProject: 'Thành viên kỹ thuật',
    },
  ];

  const handleToggleTask = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'DONE' ? 'IN_PROGRESS' : 'DONE';
          return {
            ...t,
            status: nextStatus,
            progress: nextStatus === 'DONE' ? 100 : 50,
          };
        }
        return t;
      })
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      status: 'TO_DO' as const,
      category: 'Cá nhân',
      assigneeName: user?.name || 'Tôi',
      assigneeAvatar: user?.avatar || user?.name?.substring(0, 2).toUpperCase() || 'U',
      progress: 0,
      dueDate: 'Tuần này',
      priority: 'MEDIUM' as const,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const filteredTasks = tasks.filter((t) => {
    const matchFilter = taskFilter === 'ALL' || t.status === taskFilter;
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const activeTasksCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todoTasksCount = tasks.filter((t) => t.status === 'TO_DO').length;
  const doneTasksCount = tasks.filter((t) => t.status === 'DONE').length;

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

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <div className="text-[11px] text-emerald-100">Vai trò hệ thống</div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">
                {user?.roleName || 'USER'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <div className="text-[11px] text-emerald-100">Dự án tham gia</div>
              <div className="text-sm font-bold text-white">2</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric KPI Cards (4 cards) */}
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

                {/* Filter pills */}
                <div className="flex items-center bg-gray-100/80 p-1 rounded-xl text-xs font-medium">
                  {(['ALL', 'TO_DO', 'IN_PROGRESS', 'DONE'] as const).map((filter) => {
                    const labels = {
                      ALL: 'Tất cả',
                      TO_DO: 'Cần làm',
                      IN_PROGRESS: 'Đang làm',
                      DONE: 'Đã xong',
                    };
                    const isActive = taskFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setTaskFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                    placeholder="Tìm kiếm công việc theo tên, danh mục..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <form onSubmit={handleCreateTask} className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Thêm nhanh nhiệm vụ mới..."
                    className="pl-4 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-56"
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
              <div className="divide-y divide-gray-100">
                {filteredTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    Không tìm thấy công việc nào phù hợp.
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isDone = task.status === 'DONE';
                    const isInProgress = task.status === 'IN_PROGRESS';

                    return (
                      <div
                        key={task.id}
                        className="py-3.5 flex items-center justify-between gap-4 group hover:bg-gray-50/60 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
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
                            <p
                              className={`text-xs font-medium transition-all truncate ${
                                isDone ? 'text-gray-400 line-through' : 'text-gray-900'
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {task.category && (
                                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                  {task.category}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Calendar size={11} /> {task.dueDate || 'Hạn chót'}
                              </span>
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

                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : isInProgress
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {isDone ? 'Hoàn thành' : isInProgress ? 'Đang làm' : 'Cần làm'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DỰ ÁN THAM GIA */}
          {activeTab === 'myProjects' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
                <h2 className="text-lg font-bold text-gray-900">Dự án tham gia</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Các dự án nhóm bạn được phân công tham gia thực hiện.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {userProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 bg-white hover:shadow-xs transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                          <FolderKanban size={20} />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {p.roleInProject}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{p.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {p.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-gray-100">
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

                      <div className="text-[11px] text-gray-400">
                        Sprint hiện tại: <span className="font-medium text-gray-700">{p.activeSprint}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOẠT ĐỘNG GẦN ĐÂY */}
          {activeTab === 'activities' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Hoạt động gần đây</h2>
              <p className="text-xs text-gray-500">
                Nhật ký thao tác và cập nhật trạng thái trong các dự án của bạn.
              </p>

              <div className="divide-y divide-gray-100 pt-2">
                {mockActivityLogs.map((log) => (
                  <div key={log.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-semibold text-[11px]">
                        {log.userName.substring(0, 2).toUpperCase()}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
