import React, { useEffect, useState } from 'react';
import type { ProjectMember, Subtask, Task } from '../types';
import { ProjectMemberService, SubtaskApiService, TaskService } from '../services/api';
import { SubtaskService } from '../services/subtaskService';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from '../components/CommentSection';
import { SubtaskFormModal } from '../components/SubtaskFormModal';
import { ErrorModal } from '../components/ErrorModal';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Flag,
  Layers,
  ListChecks,
  Loader2,
  Trash2,
  User,
} from 'lucide-react';

interface SubtaskDetailPageProps {
  taskId: number;
  subtaskId: number;
  onBack?: () => void;
}

const normalizeSubtask = (value: any, taskId: number): Subtask => ({
  id: value.id,
  taskId: value.taskId ?? taskId,
  title: value.title || 'Untitled subtask',
  description: value.description,
  isCompleted: Boolean(value.isCompleted),
  assigneeId: value.assigneeId ?? null,
  assigneeName: value.assigneeName,
  estimate: value.estimate,
  priority: value.priority,
  dueDate: value.dueDate,
  createdAt: value.createdAt,
  updatedAt: value.updatedAt,
});

const priorityStyle = (priority?: string) => {
  if (priority === 'HIGH') return 'bg-red-50 text-red-700 border-red-200';
  if (priority === 'LOW') return 'bg-gray-100 text-gray-600 border-gray-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

export const SubtaskDetailPage: React.FC<SubtaskDetailPageProps> = ({
  taskId,
  subtaskId,
  onBack,
}) => {
  const { user, currentRole } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [subtask, setSubtask] = useState<Subtask | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<{ isOpen: boolean; message: string; title?: string }>({
    isOpen: false,
    message: '',
  });

  const isManager = ['PROJECT_MANAGER', 'ADMIN'].includes(
    (user?.roleName || user?.role || currentRole || '').toUpperCase()
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [parent, remoteSubtask] = await Promise.all([
          TaskService.getTaskById(taskId),
          SubtaskApiService.getSubtaskById(subtaskId),
        ]);
        if (!active) return;
        const normalized = normalizeSubtask(remoteSubtask, taskId);
        setTask(parent);
        setSubtask(normalized);
        if (parent.projectId) {
          setMembers(await ProjectMemberService.getMembersByProjectId(parent.projectId));
        }
      } catch {
        if (!active) return;
        const parent = await TaskService.getTaskById(taskId).catch(() => null);
        const local = (await SubtaskService.fetchSubtasks(taskId)).find((item) => String(item.id) === String(subtaskId));
        setTask(parent);
        setSubtask(local || null);
        if (parent?.projectId) {
          setMembers(await ProjectMemberService.getMembersByProjectId(parent.projectId));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [taskId, subtaskId]);

  const handleToggle = async () => {
    if (!subtask || !task) return;
    const canToggle = isManager || user?.id === subtask.assigneeId || user?.id === task.assigneeId;
    if (!canToggle) {
      setError({
        isOpen: true,
        title: 'Access denied',
        message: 'Only the Project Manager or an assignee can change this subtask.',
      });
      return;
    }

    const previous = subtask;
    setSubtask({ ...subtask, isCompleted: !subtask.isCompleted });
    try {
      const subtasks = await SubtaskService.toggleSubtask(task.id, subtask.id);
      const updated = subtasks.find((item) => String(item.id) === String(subtask.id));
      if (updated) setSubtask(updated);
    } catch (err) {
      setSubtask(previous);
      setError({
        isOpen: true,
        title: 'Unable to update subtask',
        message: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleDelete = async () => {
    if (!task || !subtask || !confirm(`Delete subtask "${subtask.title}"?`)) return;
    try {
      await SubtaskService.deleteSubtask(task.id, subtask.id);
      onBack?.();
    } catch (err) {
      setError({
        isOpen: true,
        title: 'Unable to delete subtask',
        message: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (!task || !subtask) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">Subtask not found or you don't have access.</p>
          <button onClick={onBack} className="text-sm font-semibold text-emerald-600 hover:underline cursor-pointer">
            Back to task
          </button>
        </div>
      </div>
    );
  }

  const assignee = subtask.assigneeName || (subtask.assigneeId ? `User #${subtask.assigneeId}` : 'Unassigned');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-emerald-700 cursor-pointer">
            <ArrowLeft size={16} /> Back to task #{task.id}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditOpen(true)} className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer">
              <Edit3 size={13} /> Edit
            </button>
            {isManager && (
              <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer" title="Delete subtask">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 text-xs text-emerald-800">
          Part of Task: <button onClick={onBack} className="font-bold hover:underline cursor-pointer">#{task.id} - {task.title}</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <ListChecks size={22} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-teal-600 uppercase tracking-widest">Subtask #{subtask.id}</div>
                  <h1 className="text-2xl font-bold text-gray-900 mt-1">{subtask.title}</h1>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                <button onClick={handleToggle} className={`px-3 py-1 rounded-xl text-xs font-semibold border cursor-pointer ${subtask.isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  <CheckCircle2 size={12} className="inline mr-1" /> {subtask.isCompleted ? 'Completed' : 'To Do'}
                </button>
                <span className={`px-3 py-1 rounded-xl text-xs font-semibold border ${priorityStyle(subtask.priority)}`}>
                  <Flag size={12} className="inline mr-1" /> {subtask.priority || 'MEDIUM'}
                </span>
              </div>
              <div className="mt-6 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {subtask.description || <span className="text-gray-400 italic">No description provided.</span>}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <CommentSection subtaskId={subtask.id} members={members} />
            </section>
          </div>

          <aside className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5 h-fit">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase"><User size={11} /> Assignee</div>
              <div className="text-xs font-bold text-gray-900">{assignee}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase"><Layers size={11} /> Parent task</div>
              <div className="text-xs font-bold text-gray-900 truncate">#{task.id} {task.title}</div>
            </div>
            {subtask.estimate && <div className="space-y-1"><div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase"><Clock size={11} /> Estimate</div><div className="text-xs font-bold">{subtask.estimate}</div></div>}
            {subtask.dueDate && <div className="space-y-1"><div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase"><Calendar size={11} /> Due date</div><div className="text-xs font-bold">{subtask.dueDate}</div></div>}
          </aside>
        </div>
      </div>

      <SubtaskFormModal
        taskId={task.id}
        parentTaskAssigneeId={task.assigneeId}
        subtask={subtask}
        members={members}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={(updated) => {
          setSubtask(updated);
          setEditOpen(false);
        }}
      />
      <ErrorModal
        isOpen={error.isOpen}
        onClose={() => setError((current) => ({ ...current, isOpen: false }))}
        title={error.title}
        message={error.message}
      />
    </div>
  );
};
