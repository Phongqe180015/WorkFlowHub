import React, { useState, useEffect } from 'react';
import { SubtaskService } from '../services/subtaskService';
import type { Subtask } from '../types';
import { Check, Plus, Trash2, ListChecks, Loader2 } from 'lucide-react';

interface SubtaskListProps {
  taskId: number;
  onSubtasksChange?: (subtasks: Subtask[]) => void;
  compact?: boolean;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  taskId,
  onSubtasksChange,
  compact = false,
}) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    const created = await SubtaskService.addSubtask(taskId, newTitle);
    const updated = [...subtasks, created];
    setSubtasks(updated);
    setNewTitle('');
    setLoading(false);

    if (onSubtasksChange) {
      onSubtasksChange(updated);
    }
  };

  const handleToggle = async (subtaskId: number | string) => {
    // Optimistic
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
    // Optimistic
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
    const updated = await SubtaskService.deleteSubtask(taskId, subtaskId);
    setSubtasks(updated);
    if (onSubtasksChange) {
      onSubtasksChange(updated);
    }
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
        {subtasks.length > 0 && (
          <span className="text-[11px] font-bold text-emerald-700">
            {progressPercent}%
          </span>
        )}
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
            Chưa có công việc phụ nào. Thêm bên dưới:
          </div>
        ) : (
          subtasks.map((st) => (
            <div
              key={st.id}
              className="flex items-center justify-between gap-2.5 py-1.5 px-2 rounded-xl hover:bg-white transition-colors group"
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
                <span
                  className={`text-xs transition-all truncate ${
                    st.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'
                  }`}
                >
                  {st.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(st.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                title="Xóa việc phụ"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Subtask Form */}
      <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Thêm việc phụ mới..."
          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-800"
        />
        <button
          type="submit"
          disabled={loading || !newTitle.trim()}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          <span>Thêm</span>
        </button>
      </form>
    </div>
  );
};
