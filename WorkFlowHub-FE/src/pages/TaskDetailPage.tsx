import React, { useState, useEffect } from 'react';
import type { Task, Subtask, ProjectMember } from '../types';
import { TaskService, ProjectMemberService } from '../services/api';
import { SubtaskService } from '../services/subtaskService';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from '../components/CommentSection';
import { EditTaskModal } from '../components/EditTaskModal';
import { SubtaskFormModal } from '../components/SubtaskFormModal';
import { ErrorModal } from '../components/ErrorModal';
import {
  ArrowLeft,
  CheckSquare,
  ListChecks,
  Flag,
  Clock,
  Calendar,
  User,
  Layers,
  FolderKanban,
  Edit3,
  Trash2,
  Plus,
  CheckCircle2,
  Loader2,
  MessageSquare,
} from 'lucide-react';

interface TaskDetailPageProps {
  taskId: number;
  onBack?: () => void;
}

const priorityStyle = (p?: string) => {
  if (p === 'HIGH') return 'bg-red-50 text-red-700 border-red-200';
  if (p === 'MEDIUM') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
};

const statusStyle = (s?: string) => {
  if (s === 'DONE') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'IN_PROGRESS') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s === 'CLOSED') return 'bg-gray-100 text-gray-600 border-gray-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

const statusLabel = (s?: string) => {
  if (s === 'DONE') return 'Done';
  if (s === 'IN_PROGRESS') return 'In Progress';
  if (s === 'CLOSED') return 'Closed';
  return 'To Do';
};

export const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ taskId, onBack }) => {
  const { user, currentRole } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [subtaskFormOpen, setSubtaskFormOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string; title?: string; code?: string }>({ isOpen: false, message: '' });

  const isPM = Boolean(
    (user?.roleName || user?.role || '').toUpperCase() === 'PROJECT_MANAGER' ||
    (user?.roleName || user?.role || '').toUpperCase() === 'ADMIN' ||
    currentRole === 'PROJECT_MANAGER' ||
    currentRole === 'ADMIN'
  );

  // Load task
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const t = await TaskService.getTaskById(taskId);
        setTask(t);
        if (t.projectId) {
          const mems = await ProjectMemberService.getMembersByProjectId(t.projectId);
          setMembers(mems);
        }
        const sts = await SubtaskService.fetchSubtasks(taskId);
        setSubtasks(sts);
      } catch (err) {
        console.warn('Failed to load task:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [taskId]);

  const handleToggleSubtask = async (st: Subtask) => {
    const canToggle =
      isPM ||
      (user && (st.assigneeId === user.id || (task?.assigneeId === user.id)));
    if (!canToggle) {
      setErrorModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'Only the Project Manager or the assignee can toggle subtask status.',
        code: 'FORBIDDEN',
      });
      return;
    }
    const prev = [...subtasks];
    setSubtasks((s) => s.map((x) => (x.id === st.id ? { ...x, isCompleted: !x.isCompleted } : x)));
    try {
      const updated = await SubtaskService.toggleSubtask(task!.id, st.id);
      setSubtasks(updated);
    } catch (err: any) {
      setSubtasks(prev);
      setErrorModal({ isOpen: true, title: 'Error', message: err.message || 'Could not change status.', code: err.code });
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !confirm(`Delete task "${task.title}"?`)) return;
    try {
      await TaskService.deleteTask(task.id);
      onBack?.();
    } catch (err: any) {
      setErrorModal({ isOpen: true, title: 'Error', message: err.message || 'Could not delete task.' });
    }
  };

  const navigateToSubtask = (st: Subtask) => {
    window.location.hash = `#/tasks/${taskId}/subtasks/${st.id}`;
  };

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-gray-500">Task not found or you don't have access.</p>
          <button onClick={onBack} className="text-emerald-600 hover:underline text-sm font-semibold cursor-pointer">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const assigneeName = task.assigneeName || (task.assigneeId ? `User #${task.assigneeId}` : 'Unassigned');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-emerald-700 transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-mono font-bold bg-gray-100 px-2 py-0.5 rounded-lg">#{task.id}</span>
            {task.taskCode && (
              <span className="font-mono text-gray-400">({task.taskCode})</span>
            )}
            <span className={`px-2 py-0.5 rounded-lg font-semibold uppercase tracking-wider border ${statusStyle(task.status)}`}>
              {statusLabel(task.status)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditTaskOpen(true)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
            {isPM && (
              <button
                onClick={handleDeleteTask}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                title="Delete task"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Title & Badges */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <CheckSquare size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">Main Task</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{task.title}</h1>
            </div>
          </div>

          {/* Badge Row */}
          <div className="flex flex-wrap gap-2 ml-13">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${statusStyle(task.status)}`}>
              <CheckSquare size={12} />
              {statusLabel(task.status)}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${priorityStyle(task.priority)}`}>
              <Flag size={12} />
              {task.priority === 'HIGH' ? 'High Priority' : task.priority === 'LOW' ? 'Low Priority' : 'Medium Priority'}
            </span>
            {task.estimate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                <Clock size={12} />
                Est: {task.estimate}
              </span>
            )}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                <Calendar size={12} />
                Due: {task.dueDate}
              </span>
            )}
          </div>
        </div>

        {/* Two-column layout: main content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: Description + Subtasks + Comments */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h2>
              <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[60px]">
                {task.description || <span className="text-gray-400 italic">No description provided.</span>}
              </div>
            </div>

            {/* Subtasks */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks size={16} className="text-emerald-600" />
                  <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Subtasks</h2>
                  <span className="text-xs text-gray-500 font-semibold">({completedCount}/{subtasks.length})</span>
                </div>
                <button
                  onClick={() => { setEditingSubtask(null); setSubtaskFormOpen(true); }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                >
                  <Plus size={13} />
                  Add Subtask
                </button>
              </div>

              {/* Progress bar */}
              {subtasks.length > 0 && (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* List */}
              {subtasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                  <ListChecks size={24} className="mx-auto mb-2 opacity-30" />
                  <p>No subtasks yet.</p>
                  <button
                    onClick={() => { setEditingSubtask(null); setSubtaskFormOpen(true); }}
                    className="mt-2 text-emerald-600 hover:underline font-semibold cursor-pointer"
                  >
                    Create the first subtask →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-3 p-3 bg-gray-50/70 hover:bg-emerald-50/40 rounded-xl border border-gray-100 transition-all group"
                    >
                      {/* Toggle checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(st)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          st.isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-gray-300 hover:border-emerald-500 bg-white'
                        }`}
                      >
                        {st.isCompleted && <CheckCircle2 size={12} strokeWidth={3} />}
                      </button>

                      {/* Info - clickable to navigate */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigateToSubtask(st)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-400">#{st.id}</span>
                          <span className={`text-xs font-semibold truncate hover:text-emerald-700 transition-colors ${st.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {st.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                          {st.assigneeName && (
                            <span className="text-gray-600 font-medium bg-white px-1.5 py-0.5 rounded border border-gray-100">
                              👤 {st.assigneeName}
                            </span>
                          )}
                          {st.estimate && (
                            <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 font-medium">
                              ⏱️ {st.estimate}
                            </span>
                          )}
                          {st.dueDate && <span>📅 {st.dueDate}</span>}
                        </div>
                      </div>

                      {/* Navigate button */}
                      <button
                        onClick={() => navigateToSubtask(st)}
                        className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        View →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <CommentSection
                taskId={task.id}
                members={members}
              />
            </div>
          </div>

          {/* Sidebar: metadata */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Details</h2>

              {/* Assignee */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase">
                  <User size={11} className="text-emerald-600" />
                  Assignee
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[9px] font-bold">
                    {assigneeName.substring(0, 2).toUpperCase()}
                  </div>
                  {assigneeName}
                </div>
              </div>

              {/* Sprint */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase">
                  <Layers size={11} className="text-emerald-600" />
                  Sprint
                </div>
                <div className="text-xs font-bold text-gray-900 truncate">
                  {task.sprintName || (task.sprintId ? `Sprint #${task.sprintId}` : 'No Sprint')}
                </div>
              </div>

              {/* Project */}
              {task.projectName && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase">
                    <FolderKanban size={11} className="text-emerald-600" />
                    Project
                  </div>
                  <div className="text-xs font-bold text-gray-900 truncate">{task.projectName}</div>
                </div>
              )}

              {/* Created At */}
              {task.createdAt && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase">
                    <Clock size={11} className="text-gray-400" />
                    Created
                  </div>
                  <div className="text-xs text-gray-700">
                    {new Date(task.createdAt).toLocaleString('en-US')}
                  </div>
                </div>
              )}
            </div>

            {/* Stats card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-4 space-y-2">
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={11} />
                Progress Summary
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-2.5 text-center shadow-sm">
                  <div className="text-lg font-bold text-emerald-600">{subtasks.length}</div>
                  <div className="text-[10px] text-gray-500">Total Subtasks</div>
                </div>
                <div className="bg-white rounded-xl p-2.5 text-center shadow-sm">
                  <div className="text-lg font-bold text-emerald-600">{completedCount}</div>
                  <div className="text-[10px] text-gray-500">Completed</div>
                </div>
              </div>
              <div className="text-center text-xs font-bold text-emerald-700">{progress}% done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={task}
        members={members}
        isOpen={editTaskOpen}
        onClose={() => setEditTaskOpen(false)}
        onSuccess={(updated) => {
          setTask(updated);
          setEditTaskOpen(false);
        }}
      />

      {/* Subtask Create/Edit Modal */}
      {subtaskFormOpen && (
        <SubtaskFormModal
          taskId={task.id}
          subtask={editingSubtask}
          members={members}
          isOpen={subtaskFormOpen}
          onClose={() => { setSubtaskFormOpen(false); setEditingSubtask(null); }}
          onSuccess={async () => {
            const updated = await SubtaskService.fetchSubtasks(task.id);
            setSubtasks(updated);
            setSubtaskFormOpen(false);
          }}
        />
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal((p) => ({ ...p, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
        code={errorModal.code}
      />
    </div>
  );
};
