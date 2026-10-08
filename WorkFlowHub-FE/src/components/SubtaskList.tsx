import React, { useState, useEffect } from 'react';
import { SubtaskService } from '../services/subtaskService';
import type { Subtask, ProjectMember } from '../types';
import { Check, Plus, Trash2, ListChecks, Loader2, Edit3, Eye, Clock, User, Sparkles } from 'lucide-react';
import { SubtaskFormModal } from './SubtaskFormModal';

interface SubtaskListProps {
  taskId: number;
  members?: ProjectMember[];
  onSubtasksChange?: (subtasks: Subtask[]) => void;
  onSelectSubtask?: (subtask: Subtask) => void;
  compact?: boolean;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  taskId,
  members = [],
  onSubtasksChange,
  onSelectSubtask,
  compact = false,
}) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal create/edit subtask state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const list = await SubtaskService.fetchSubtasks(taskId);
      if (isMounted) {
        setSubtasks(list);
        if (onSubtasksChange) {
          onSubtasksChange(list);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [taskId]);

  const handleQuickAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    const created = await SubtaskService.addSubtask(taskId, newTitle.trim());
    const updated = [...subtasks, created];
    setSubtasks(updated);
    setNewTitle('');
    setLoading(false);

    if (onSubtasksChange) {
      onSubtasksChange(updated);
    }
  };

  const handleToggle = async (subtaskId: number | string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s))
    );
    const updated = await SubtaskService.toggleSubtask(taskId, subtaskId);
    setSubtasks(updated);
    if (onSubtasksChange) {
      onSubtasksChange(updated);
    }
  };

  const handleDelete = async (subtaskId: number | string) => {
    if (!confirm('Bạn có chắc muốn xóa việc phụ này?')) return;
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
    const updated = await SubtaskService.deleteSubtask(taskId, subtaskId);
    setSubtasks(updated);
    if (onSubtasksChange) {
      onSubtasksChange(updated);
    }
  };

  const handleFormModalSuccess = (savedSubtask: Subtask) => {
    setSubtasks((prev) => {
      const exists = prev.some((s) => s.id === savedSubtask.id);
      const updated = exists
        ? prev.map((s) => (s.id === savedSubtask.id ? savedSubtask : s))
        : [...prev, savedSubtask];
      if (onSubtasksChange) {
        onSubtasksChange(updated);
      }
      return updated;
    });
  };

  const openCreateModal = () => {
    setEditingSubtask(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (st: Subtask) => {
    setEditingSubtask(st);
    setIsFormModalOpen(true);
  };

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div className={`space-y-3 bg-gray-50/70 rounded-2xl p-4 border border-gray-100 ${compact ? 'text-xs' : ''}`}>
      {/* Subtasks Progress Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
        <div className="flex items-center gap-1.5">
          <ListChecks size={15} className="text-emerald-600" />
          <span>Danh sách việc phụ (Subtasks)</span>
          <span className="text-[11px] text-gray-500 font-normal">
            ({completedCount}/{subtasks.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {subtasks.length > 0 && (
            <span className="text-[11px] font-bold text-emerald-700">
              {progressPercent}%
            </span>
          )}
          <button
            type="button"
            onClick={openCreateModal}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            title="Thêm subtask có đầy đủ mô tả, người phụ trách và ước lượng"
          >
            <Sparkles size={12} className="text-emerald-600" />
            <span>+ Tạo chi tiết</span>
          </button>
        </div>
      </div>

      {subtasks.length > 0 && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-1.5 pt-1">
        {subtasks.length === 0 ? (
          <div className="text-[11px] text-gray-400 py-1 italic">
            Chưa có công việc phụ nào. Thêm nhanh bên dưới hoặc bấm &quot;+ Tạo chi tiết&quot;:
          </div>
        ) : (
          subtasks.map((st) => (
            <div
              key={st.id}
              className="flex items-center justify-between gap-2.5 py-2 px-2.5 rounded-xl hover:bg-white bg-white/40 border border-gray-100/60 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggle(st.id)}
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    st.isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-gray-300 hover:border-emerald-500 bg-white'
                  }`}
                >
                  {st.isCompleted && <Check size={11} strokeWidth={3} />}
                </button>

                <div 
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => onSelectSubtask && onSelectSubtask(st)}
                >
                  <span
                    className={`text-xs font-medium transition-all block truncate ${
                      st.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800 hover:text-emerald-700'
                    }`}
                  >
                    {st.title}
                  </span>

                  {/* Metadata tags: Assignee, EST */}
                  {(st.assigneeName || st.estimate || st.dueDate) && (
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-400">
                      {st.assigneeName && (
                        <span className="inline-flex items-center gap-0.5 bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                          <User size={10} />
                          <span>{st.assigneeName}</span>
                        </span>
                      )}
                      {st.estimate && (
                        <span className="inline-flex items-center gap-0.5 bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-medium">
                          <Clock size={10} />
                          <span>{st.estimate}</span>
                        </span>
                      )}
                      {st.dueDate && (
                        <span>📅 {st.dueDate}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                {/* View Detail button */}
                {onSelectSubtask && (
                  <button
                    type="button"
                    onClick={() => onSelectSubtask(st)}
                    className="p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                    title="Xem chi tiết việc phụ"
                  >
                    <Eye size={13} />
                  </button>
                )}

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => openEditModal(st)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                  title="Chỉnh sửa việc phụ"
                >
                  <Edit3 size={13} />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(st.id)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  title="Xóa việc phụ"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Add Subtask Form */}
      <form onSubmit={handleQuickAddSubtask} className="flex gap-2 pt-1">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Thêm nhanh tiêu đề việc phụ..."
          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-800"
        />
        <button
          type="submit"
          disabled={loading || !newTitle.trim()}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          <span>Thêm nhanh</span>
        </button>
      </form>

      {/* Subtask Form Modal (Create / Edit with rich fields: title, description, assignee, est, priority, deadline) */}
      <SubtaskFormModal
        taskId={taskId}
        subtask={editingSubtask}
        members={members}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSubtask(null);
        }}
        onSuccess={handleFormModalSuccess}
      />
    </div>
  );
};
