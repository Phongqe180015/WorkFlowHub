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
import { SubtaskList } from '../components/SubtaskList';
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
  Edit3,
  Search,
  Filter,
  Lock,
  ChevronDown,
  ChevronUp,
  ListChecks,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface ProjectManagerDashboardProps {
  initialProjectId?: number | null;
  onSwitchToUserView?: () => void;
}

export const ProjectManagerDashboard: React.FC<ProjectManagerDashboardProps> = ({
  initialProjectId,
  onSwitchToUserView,
}) => {
  const { user, currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'currentSprint' | 'sprints' | 'members' | 'assignments' | 'projects' | 'trash'>('sprints');

  // Quản lý danh sách dự án (100% dữ liệu thực từ Backend)
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjectId || null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Sprints, Members & Tasks của dự án đang chọn
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trashTasks, setTrashTasks] = useState<Task[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingTrash, setLoadingTrash] = useState(false);

  // Sprint được chọn để xem chi tiết các Task (Click vào sprint)
  const [selectedSprintForTasks, setSelectedSprintForTasks] = useState<Sprint | null>(null);

  // Filter trong Sprint Tasks view
  const [sprintTaskSearch, setSprintTaskSearch] = useState('');
  const [sprintMemberFilter, setSprintMemberFilter] = useState('ALL');
  const [sprintStatusFilter, setSprintStatusFilter] = useState('ALL');

  // Filter trong Phân công công việc (Assignments view)
  const [assignmentSprintFilter, setAssignmentSprintFilter] = useState('ALL');
  const [assignmentMemberFilter, setAssignmentMemberFilter] = useState('ALL');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState('ALL');
  const [assignmentSearchQuery, setAssignmentSearchQuery] = useState('');

  // Expandable subtasks state cho từng task (taskId -> boolean)
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<number, boolean>>({});

  // Modals
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [isEditSprintOpen, setIsEditSprintOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskSprintId, setCreateTaskSprintId] = useState<number | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sidebarItems = [
    { id: 'sprints', label: 'Quản lý Sprint', icon: Layers },
    { id: 'members', label: 'Thành viên & Phân quyền', icon: Users },
    { id: 'currentSprint', label: 'Sprint hiện tại & Burndown', icon: Sparkles },
    { id: 'assignments', label: 'Phân công công việc', icon: FolderKanban },
    { id: 'trash', label: 'Thùng rác công việc', icon: Trash2, badge: trashTasks.length },
  ];

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Kiểm tra quyền PM: chỉ role PM mới được edit sprint hoặc tạo sprint
  const isPM = Boolean(
    (user?.roleName || user?.role || '').toUpperCase() === 'PROJECT_MANAGER' ||
    currentRole === 'PROJECT_MANAGER' ||
    (currentProject && currentProject.ownerId === user?.id) ||
    members.some((m) => m.userId === user?.id && (m.roleName || '').toUpperCase() === 'PROJECT_MANAGER')
  );

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
      setSelectedSprintForTasks(null); // Reset sprint đã chọn khi đổi project
    } else {
      setSprints([]);
      setMembers([]);
      setTasks([]);
      setSelectedSprintForTasks(null);
    }
  }, [selectedProjectId]);

  const loadProjectDetails = async (projectId: number) => {
    setLoadingDetails(true);
    try {
      const [fetchedSprints, fetchedMembers, fetchedTasks, fetchedTrash] = await Promise.all([
        SprintService.getSprintsByProjectId(projectId),
        ProjectMemberService.getMembersByProjectId(projectId),
        TaskService.getTasksByProjectId(projectId),
        TaskService.getTrashTasks(projectId).catch(() => []),
      ]);

      setSprints(fetchedSprints || []);
      setMembers(fetchedMembers || []);
      setTasks(fetchedTasks || []);
      setTrashTasks(fetchedTrash || []);
    } catch (err) {
      console.warn('Lỗi tải chi tiết dự án:', err);
      setSprints([]);
      setMembers([]);
      setTasks([]);
      setTrashTasks([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadTrashTasks = async () => {
    if (!selectedProjectId) return;
    setLoadingTrash(true);
    try {
      const fetchedTrash = await TaskService.getTrashTasks(selectedProjectId);
      setTrashTasks(fetchedTrash || []);
    } catch (err) {
      console.warn('Lỗi tải thùng rác:', err);
    } finally {
      setLoadingTrash(false);
    }
  };

  const handleSprintCreated = (newSprint: Sprint) => {
    setSprints((prev) => [newSprint, ...prev]);
    showNotification('success', `Đã tạo thành công "${newSprint.name}"!`);
  };

  const handleSprintUpdated = (updatedSprint: Sprint) => {
    setSprints((prev) => prev.map((s) => (s.id === updatedSprint.id ? updatedSprint : s)));
    if (selectedSprintForTasks && selectedSprintForTasks.id === updatedSprint.id) {
      setSelectedSprintForTasks(updatedSprint);
    }
    showNotification('success', `Đã cập nhật sprint "${updatedSprint.name}" thành công!`);
  };

  const handleDeleteSprint = async (sprint: Sprint) => {
    if (!isPM) {
      alert('Chỉ có vai trò Project Manager (PM) mới được phép xóa Sprint.');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa Sprint "${sprint.name}" không?`)) {
      return;
    }
    try {
      await SprintService.deleteSprint(sprint.id);
      setSprints((prev) => prev.filter((s) => s.id !== sprint.id));
      if (selectedSprintForTasks?.id === sprint.id) {
        setSelectedSprintForTasks(null);
      }
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
    if (!isPM) {
      alert('Chỉ có Project Manager (PM) mới có quyền xóa công việc.');
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn chuyển công việc "${taskTitle || 'này'}" vào thùng rác không?`)) {
      return;
    }
    try {
      await TaskService.deleteTask(taskId);
      const deletedTask = tasks.find((t) => t.id === taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (deletedTask) {
        setTrashTasks((prev) => [{ ...deletedTask, isDeleted: true }, ...prev]);
      } else {
        loadTrashTasks();
      }
      showNotification('success', 'Đã chuyển công việc vào thùng rác (xóa mềm)!');
    } catch (err: any) {
      console.error('Lỗi khi xóa công việc:', err);
      showNotification('error', err.message || 'Không thể xóa công việc.');
    }
  };

  const handleRestoreTask = async (taskId: number) => {
    try {
      await TaskService.restoreTask(taskId);
      const restoredTask = trashTasks.find((t) => t.id === taskId);
      setTrashTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (restoredTask) {
        setTasks((prev) => [{ ...restoredTask, isDeleted: false }, ...prev]);
      } else if (selectedProjectId) {
        loadProjectDetails(selectedProjectId);
      }
      showNotification('success', 'Đã khôi phục công việc thành công!');
    } catch (err: any) {
      console.error('Lỗi khi khôi phục task:', err);
      showNotification('error', err.message || 'Không thể khôi phục công việc.');
    }
  };

  const handlePermanentDeleteTask = async (taskId: number, taskTitle?: string) => {
    if (!isPM) {
      alert('Chỉ có Project Manager (PM) mới có quyền xóa vĩnh viễn công việc.');
      return;
    }
    if (!window.confirm(`Hành động này KHÔNG THỂ hoàn tác. Bạn có chắc muốn xóa vĩnh viễn công việc "${taskTitle || 'này'}" không?`)) {
      return;
    }
    try {
      await TaskService.permanentDeleteTask(taskId);
      setTrashTasks((prev) => prev.filter((t) => t.id !== taskId));
      showNotification('success', 'Đã xóa vĩnh viễn công việc khỏi hệ thống!');
    } catch (err: any) {
      console.error('Lỗi khi xóa vĩnh viễn công việc:', err);
      showNotification('error', err.message || 'Không thể xóa vĩnh viễn công việc.');
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

  const toggleTaskSubtasks = (taskId: number) => {
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Chuẩn hóa trạng thái
  const normalizeStatus = (status?: string): 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'CLOSED' => {
    if (!status) return 'TO_DO';
    const s = status.trim().toUpperCase();
    if (s === 'CLOSED' || s === 'ĐÃ ĐÓNG') return 'CLOSED';
    if (s === 'DONE' || s === 'COMPLETED' || s === 'ĐÃ XONG' || s === 'HOÀN THÀNH') return 'DONE';
    if (s === 'IN_PROGRESS' || s === 'PROGRESS' || s === 'ĐANG LÀM') return 'IN_PROGRESS';
    return 'TO_DO';
  };

  // Lọc tasks trong Sprint được chọn (Requirement 3: click vào sprint hiện tất cả task & filter bằng mã task)
  const sprintTasks = selectedSprintForTasks
    ? tasks.filter((t) => t.sprintId === selectedSprintForTasks.id)
    : [];

  const filteredSprintTasks = sprintTasks.filter((t) => {
    // 1. Filter bằng mã task (hoặc tiêu đề)
    const query = sprintTaskSearch.toLowerCase().trim();
    const matchCode =
      !query ||
      `#${t.id}`.includes(query) ||
      `task-${t.id}`.toLowerCase().includes(query) ||
      (t.taskCode && t.taskCode.toLowerCase().includes(query)) ||
      t.title.toLowerCase().includes(query);

    // 2. Filter thành viên
    let matchMember = true;
    if (sprintMemberFilter === 'UNASSIGNED') {
      matchMember = !t.assigneeId;
    } else if (sprintMemberFilter !== 'ALL') {
      matchMember = t.assigneeId === Number(sprintMemberFilter);
    }

    // 3. Filter trạng thái
    let matchStatus = true;
    if (sprintStatusFilter !== 'ALL') {
      matchStatus = normalizeStatus(t.status) === sprintStatusFilter;
    }

    return matchCode && matchMember && matchStatus;
  });

  // Lọc tasks trong tab Assignments (Requirement 5: filter sprint và thành viên)
  const filteredAssignmentsTasks = tasks.filter((t) => {
    // 1. Filter Sprint
    let matchSprint = true;
    if (assignmentSprintFilter === 'NO_SPRINT') {
      matchSprint = !t.sprintId;
    } else if (assignmentSprintFilter !== 'ALL') {
      matchSprint = t.sprintId === Number(assignmentSprintFilter);
    }

    // 2. Filter Thành viên
    let matchMember = true;
    if (assignmentMemberFilter === 'UNASSIGNED') {
      matchMember = !t.assigneeId;
    } else if (assignmentMemberFilter !== 'ALL') {
      matchMember = t.assigneeId === Number(assignmentMemberFilter);
    }

    // 3. Filter Trạng thái
    let matchStatus = true;
    if (assignmentStatusFilter !== 'ALL') {
      matchStatus = normalizeStatus(t.status) === assignmentStatusFilter;
    }

    // 4. Tìm kiếm từ khóa / mã task
    const query = assignmentSearchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      `#${t.id}`.includes(query) ||
      `task-${t.id}`.toLowerCase().includes(query) ||
      (t.taskCode && t.taskCode.toLowerCase().includes(query)) ||
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query));

    return matchSprint && matchMember && matchStatus && matchSearch;
  });

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
            {isPM ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                <ShieldCheck size={12} />
                <span>Quyền: Project Manager (Có quyền chỉnh sửa Sprint)</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                <Lock size={12} />
                <span>Quyền: Thành viên (Chỉ xem Sprint)</span>
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
                  onClick={() => {
                    setActiveTab(item.id as any);
                    if (item.id !== 'sprints') {
                      setSelectedSprintForTasks(null);
                    }
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700">
                      {item.badge}
                    </span>
                  )}
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
                <span className="text-gray-500">Vai trò của bạn:</span>
                <span className={`font-bold ${isPM ? 'text-purple-600' : 'text-emerald-600'}`}>
                  {isPM ? 'Project Manager' : 'Member'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: QUẢN LÝ SPRINT */}
          {activeTab === 'sprints' && (
            <div className="space-y-6">
              {/* NẾU ĐÃ CHỌN 1 SPRINT CỤ THỂ: HIỂN THỊ TẤT CẢ TASK TRONG SPRINT ĐÓ + FILTER MÃ TASK */}
              {selectedSprintForTasks ? (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6 animate-in fade-in">
                  {/* Sprint Detail Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedSprintForTasks(null)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer mb-1"
                      >
                        <ArrowLeft size={14} />
                        <span>Quay lại danh sách Sprint</span>
                      </button>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                          {selectedSprintForTasks.name}
                        </h2>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                            selectedSprintForTasks.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : selectedSprintForTasks.status === 'COMPLETED'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}
                        >
                          {selectedSprintForTasks.status === 'ACTIVE'
                            ? 'Đang chạy'
                            : selectedSprintForTasks.status === 'COMPLETED'
                            ? 'Đã xong'
                            : 'Kế hoạch'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 max-w-xl">
                        {selectedSprintForTasks.goal || 'Mục tiêu: Chưa có ghi chú mục tiêu cụ thể'}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar size={13} className="text-gray-400" />
                          {selectedSprintForTasks.startDate} → {selectedSprintForTasks.endDate}
                        </span>
                        <span>•</span>
                        <span>
                          Tổng: <strong className="text-gray-700">{sprintTasks.length} tasks</strong>
                        </span>
                      </div>
                    </div>

                    {/* Sprint Header Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isPM ? (
                        <button
                          onClick={() => {
                            setEditingSprint(selectedSprintForTasks);
                            setIsEditSprintOpen(true);
                          }}
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-blue-200"
                          title="Chỉnh sửa Sprint (Chỉ PM)"
                        >
                          <Edit3 size={14} />
                          <span>Chỉnh sửa Sprint</span>
                        </button>
                      ) : (
                        <div
                          className="px-3 py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-not-allowed border border-gray-200"
                          title="Chỉ có role PM mới được edit sprint"
                        >
                          <Lock size={13} />
                          <span>Chỉ PM mới được sửa</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setCreateTaskSprintId(selectedSprintForTasks.id);
                          setIsCreateTaskOpen(true);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Plus size={15} />
                        <span>Thêm Task vào Sprint</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Bar: Tìm theo mã Task, Thành viên, Trạng thái (Requirement 3 & 5) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
                    {/* Filter theo mã task / tên task */}
                    <div className="sm:col-span-5 relative">
                      <Search size={15} className="absolute left-3.5 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        value={sprintTaskSearch}
                        onChange={(e) => setSprintTaskSearch(e.target.value)}
                        placeholder="Lọc theo mã task (VD: #1, TASK-1) hoặc tên..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-800"
                      />
                    </div>

                    {/* Filter theo thành viên */}
                    <div className="sm:col-span-4">
                      <select
                        value={sprintMemberFilter}
                        onChange={(e) => setSprintMemberFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                      >
                        <option value="ALL">Tất cả thành viên</option>
                        {members.map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.userName || `User #${m.userId}`} ({m.roleName || 'Member'})
                          </option>
                        ))}
                        <option value="UNASSIGNED">Chưa phân công</option>
                      </select>
                    </div>

                    {/* Filter theo trạng thái */}
                    <div className="sm:col-span-3">
                      <select
                        value={sprintStatusFilter}
                        onChange={(e) => setSprintStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                      >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="TO_DO">Cần làm (To Do)</option>
                        <option value="IN_PROGRESS">Đang làm (In Progress)</option>
                        <option value="DONE">Hoàn thành (Done)</option>
                        <option value="CLOSED">Đã đóng (Closed)</option>
                      </select>
                    </div>
                  </div>

                  {/* Tasks List của Sprint */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                      <span>
                        Hiển thị <strong>{filteredSprintTasks.length}</strong> / {sprintTasks.length} công việc
                      </span>
                      {sprintTaskSearch && (
                        <button
                          onClick={() => setSprintTaskSearch('')}
                          className="text-emerald-700 hover:underline cursor-pointer"
                        >
                          Xóa bộ lọc mã task
                        </button>
                      )}
                    </div>

                    {filteredSprintTasks.length === 0 ? (
                      <div className="py-12 text-center text-xs text-gray-400 space-y-3 border-2 border-dashed border-gray-100 rounded-2xl">
                        <Layers size={28} className="mx-auto text-gray-300" />
                        <p>
                          {sprintTasks.length === 0
                            ? 'Sprint này hiện chưa có công việc nào.'
                            : 'Không tìm thấy công việc nào khớp với mã task hoặc bộ lọc đã chọn.'}
                        </p>
                        <button
                          onClick={() => {
                            setCreateTaskSprintId(selectedSprintForTasks.id);
                            setIsCreateTaskOpen(true);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          + Giao việc vào Sprint này
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {filteredSprintTasks.map((task) => {
                          const assignee = members.find((m) => m.userId === task.assigneeId);
                          const isDone = normalizeStatus(task.status) === 'DONE';
                          const isInProgress = normalizeStatus(task.status) === 'IN_PROGRESS';
                          const isClosed = normalizeStatus(task.status) === 'CLOSED';
                          const isExpanded = !!expandedTaskIds[task.id];

                          return (
                            <div
                              key={task.id}
                              className="py-4 px-3 rounded-2xl hover:bg-gray-50/70 transition-colors space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {/* MÃ TASK */}
                                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      #{task.id}
                                    </span>

                                    <span className={`text-xs font-bold ${isDone || isClosed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
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

                                    {/* Nút bật/tắt công việc phụ (Subtask) - Requirement 4 */}
                                    <button
                                      type="button"
                                      onClick={() => toggleTaskSubtasks(task.id)}
                                      className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                      <ListChecks size={13} />
                                      <span>Việc phụ (Subtasks)</span>
                                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                  {/* Người được giao */}
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
                                        : isClosed
                                        ? 'bg-gray-100 text-gray-500 border-gray-300'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    <option value="TO_DO">Cần làm</option>
                                    <option value="IN_PROGRESS">Đang làm</option>
                                    <option value="DONE">Hoàn thành</option>
                                    <option value="CLOSED">Đã đóng (Closed)</option>
                                  </select>

                                  {/* Nút xóa task: CHỈ PM MỚI CÓ QUYỀN XÓA (Thành viên không được xóa, chỉ chuyển status sang CLOSED) */}
                                  {isPM && (
                                    <button
                                      onClick={() => handleDeleteTask(task.id, task.title)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Chuyển vào thùng rác (Chỉ PM)"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Khu vực tạo và quản lý Subtasks (Requirement 4) */}
                              {isExpanded && (
                                <div className="pt-2 pl-4 animate-in fade-in">
                                  <SubtaskList taskId={task.id} compact />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* DANH SÁCH TỔNG QUAN CÁC SPRINT */
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Danh sách Sprint</h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Lập kế hoạch và theo dõi các chu kỳ phát triển. Bấm vào Sprint để xem chi tiết danh sách công việc.
                      </p>
                    </div>

                    {selectedProjectId && (
                      isPM ? (
                        <button
                          onClick={() => setIsCreateSprintOpen(true)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          <Plus size={16} />
                          <span>Tạo Sprint mới</span>
                        </button>
                      ) : (
                        <div
                          className="px-3.5 py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-not-allowed border border-gray-200 shrink-0"
                          title="Chỉ có role PM mới được tạo sprint"
                        >
                          <Lock size={14} />
                          <span>Chỉ PM mới được tạo Sprint</span>
                        </div>
                      )
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
                      {isPM && (
                        <button
                          onClick={() => setIsCreateSprintOpen(true)}
                          className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          + Bấm vào đây để tạo sprint đầu tiên
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sprints.map((sprint) => {
                        const isActive = sprint.status === 'ACTIVE';
                        const isCompleted = sprint.status === 'COMPLETED';
                        const countInSprint = tasks.filter((t) => t.sprintId === sprint.id).length;

                        return (
                          <div
                            key={sprint.id}
                            onClick={() => setSelectedSprintForTasks(sprint)}
                            className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-300 bg-white hover:shadow-md transition-all space-y-4 cursor-pointer group flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                    {sprint.name}
                                  </h3>
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

                              <div className="flex items-center gap-2 pt-1">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">
                                  {countInSprint} tasks
                                </span>
                                <span className="text-[11px] text-emerald-700 font-semibold group-hover:underline flex items-center gap-0.5">
                                  <span>Xem chi tiết tasks</span>
                                  <ArrowRight size={12} />
                                </span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={13} className="text-gray-400" />
                                {sprint.startDate} → {sprint.endDate}
                              </span>

                              {/* Hành động edit sprint: CHỈ CÓ ROLE PM MỚI ĐƯỢC EDIT SPRINT (Requirement 1) */}
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {isPM ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingSprint(sprint);
                                        setIsEditSprintOpen(true);
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                      title="Chỉnh sửa Sprint (Chỉ PM)"
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
                                  </>
                                ) : (
                                  <span
                                    className="p-1.5 text-gray-300 rounded-lg cursor-not-allowed"
                                    title="Chỉ có role PM mới được edit sprint"
                                  >
                                    <Lock size={14} />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
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

          {/* TAB 4: PHÂN CÔNG CÔNG VIỆC (Cho phép filter sprint và thành viên - Requirement 5) */}
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
                    onClick={() => {
                      setCreateTaskSprintId(null);
                      setIsCreateTaskOpen(true);
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={16} />
                    <span>Giao việc mới (Tạo Task)</span>
                  </button>
                )}
              </div>

              {/* BỘ LỌC PHÂN CÔNG: FILTER SPRINT, THÀNH VIÊN, TRẠNG THÁI & MÃ TASK (Requirement 5) */}
              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <Filter size={14} className="text-emerald-600" />
                  <span>Bộ lọc nâng cao</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Filter theo Sprint */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Lọc theo Sprint
                    </label>
                    <select
                      value={assignmentSprintFilter}
                      onChange={(e) => setAssignmentSprintFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    >
                      <option value="ALL">Tất cả Sprint</option>
                      {sprints.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                      <option value="NO_SPRINT">Chưa gán Sprint (Backlog)</option>
                    </select>
                  </div>

                  {/* 2. Filter theo Thành viên */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Lọc theo Thành viên
                    </label>
                    <select
                      value={assignmentMemberFilter}
                      onChange={(e) => setAssignmentMemberFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    >
                      <option value="ALL">Tất cả thành viên</option>
                      {members.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.userName || `User #${m.userId}`} ({m.roleName || 'Member'})
                        </option>
                      ))}
                      <option value="UNASSIGNED">Chưa phân công</option>
                    </select>
                  </div>

                  {/* 3. Filter theo Trạng thái */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={assignmentStatusFilter}
                      onChange={(e) => setAssignmentStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="TO_DO">Cần làm (To Do)</option>
                      <option value="IN_PROGRESS">Đang làm (In Progress)</option>
                      <option value="DONE">Hoàn thành (Done)</option>
                      <option value="CLOSED">Đã đóng (Closed)</option>
                    </select>
                  </div>

                  {/* 4. Filter theo Mã task / Tiêu đề */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Mã task hoặc tên
                    </label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        value={assignmentSearchQuery}
                        onChange={(e) => setAssignmentSearchQuery(e.target.value)}
                        placeholder="Tìm #1, TASK-1..."
                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {loadingDetails ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                  <span>Đang tải danh sách công việc...</span>
                </div>
              ) : filteredAssignmentsTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 space-y-3 border-2 border-dashed border-gray-100 rounded-2xl">
                  <p>
                    {tasks.length === 0
                      ? 'Chưa có nhiệm vụ nào được phân công trong dự án này.'
                      : 'Không có công việc nào khớp với bộ lọc.'}
                  </p>
                  <button
                    onClick={() => {
                      setCreateTaskSprintId(null);
                      setIsCreateTaskOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    + Bấm vào đây để giao việc đầu tiên
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredAssignmentsTasks.map((task) => {
                    const assignee = members.find((m) => m.userId === task.assigneeId);
                    const sprint = sprints.find((s) => s.id === task.sprintId);
                    const isDone = normalizeStatus(task.status) === 'DONE';
                    const isInProgress = normalizeStatus(task.status) === 'IN_PROGRESS';
                    const isClosed = normalizeStatus(task.status) === 'CLOSED';
                    const isExpanded = !!expandedTaskIds[task.id];

                    return (
                      <div
                        key={task.id}
                        className="py-4 px-3 rounded-2xl hover:bg-gray-50/70 transition-colors space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* MÃ TASK */}
                              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                #{task.id}
                              </span>

                              <span className={`text-xs font-bold ${isDone || isClosed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {task.title}
                              </span>

                              {sprint && (
                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                                  {sprint.name}
                                </span>
                              )}

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

                              {/* Nút bật/tắt tạo Subtask (Requirement 4) */}
                              <button
                                type="button"
                                onClick={() => toggleTaskSubtasks(task.id)}
                                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <ListChecks size={13} />
                                <span>Việc phụ (Subtasks)</span>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
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
                                  : isClosed
                                  ? 'bg-gray-100 text-gray-500 border-gray-300'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <option value="TO_DO">Cần làm</option>
                              <option value="IN_PROGRESS">Đang làm</option>
                              <option value="DONE">Hoàn thành</option>
                              <option value="CLOSED">Đã đóng (Closed)</option>
                            </select>

                            {/* Nút xóa task: CHỈ PM MỚI CÓ QUYỀN XÓA (Thành viên không thể xóa, chỉ chuyển sang CLOSED) */}
                            {isPM && (
                              <button
                                onClick={() => handleDeleteTask(task.id, task.title)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Chuyển vào thùng rác (Chỉ PM)"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Khu vực tạo và quản lý Subtasks (Requirement 4) */}
                        {isExpanded && (
                          <div className="pt-2 pl-4 animate-in fade-in">
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

          {/* TAB 5: THÙNG RÁC CÔNG VIỆC (XÓA MỀM & KHÔI PHỤC) */}
          {activeTab === 'trash' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">Thùng rác công việc</h2>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
                      {trashTasks.length} mục đã xóa
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Các công việc đã xóa mềm trong dự án. Bạn có thể khôi phục về trạng thái hoạt động hoặc xóa vĩnh viễn khỏi hệ thống.
                  </p>
                </div>

                <button
                  onClick={loadTrashTasks}
                  disabled={loadingTrash}
                  className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-gray-200 shrink-0"
                >
                  <RotateCcw size={14} className={loadingTrash ? 'animate-spin' : ''} />
                  <span>Làm mới thùng rác</span>
                </button>
              </div>

              {loadingTrash ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                  <span>Đang tải thùng rác...</span>
                </div>
              ) : trashTasks.length === 0 ? (
                <div className="py-16 text-center text-xs text-gray-400 space-y-3 border-2 border-dashed border-gray-100 rounded-2xl">
                  <Trash2 size={36} className="mx-auto text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">Thùng rác trống</p>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    Hiện không có công việc nào bị xóa trong dự án này.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {trashTasks.map((task) => {
                    const assignee = members.find((m) => m.userId === task.assigneeId);
                    const sprint = sprints.find((s) => s.id === task.sprintId);

                    return (
                      <div
                        key={task.id}
                        className="py-4 px-3 rounded-2xl hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                              #{task.id}
                            </span>

                            <span className="text-xs font-bold text-gray-800 line-through">
                              {task.title}
                            </span>

                            {sprint && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                                {sprint.name}
                              </span>
                            )}

                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-red-50 text-red-600 border border-red-200">
                              Đã xóa
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-gray-400 line-clamp-1">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-gray-400">
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} /> Hạn: {task.dueDate}
                              </span>
                            )}
                            {assignee && (
                              <span>Người nhận: {assignee.userName}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions: Khôi phục & Xóa vĩnh viễn */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleRestoreTask(task.id)}
                            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-200"
                            title="Khôi phục công việc"
                          >
                            <RotateCcw size={13} />
                            <span>Khôi phục</span>
                          </button>

                          {isPM && (
                            <button
                              onClick={() => handlePermanentDeleteTask(task.id, task.title)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-red-200"
                              title="Xóa vĩnh viễn khỏi DB"
                            >
                              <Trash2 size={13} />
                              <span>Xóa vĩnh viễn</span>
                            </button>
                          )}
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

      {/* Modal Tạo Sprint (Chỉ PM mới mở được) */}
      {selectedProjectId && (
        <CreateSprintModal
          projectId={selectedProjectId}
          isOpen={isCreateSprintOpen}
          onClose={() => setIsCreateSprintOpen(false)}
          onSuccess={handleSprintCreated}
        />
      )}

      {/* Modal Chỉnh Sửa Sprint (Có kiểm tra quyền PM) */}
      <EditSprintModal
        sprint={editingSprint}
        isOpen={isEditSprintOpen}
        isPM={isPM}
        onClose={() => {
          setIsEditSprintOpen(false);
          setEditingSprint(null);
        }}
        onSuccess={handleSprintUpdated}
      />

      {/* Modal Giao Việc / Tạo Task Mới (Có hỗ trợ initialSprintId khi tạo từ Sprint View) */}
      {selectedProjectId && (
        <CreateTaskModal
          projectId={selectedProjectId}
          members={members}
          sprints={sprints}
          initialSprintId={createTaskSprintId}
          isOpen={isCreateTaskOpen}
          onClose={() => {
            setIsCreateTaskOpen(false);
            setCreateTaskSprintId(null);
          }}
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
