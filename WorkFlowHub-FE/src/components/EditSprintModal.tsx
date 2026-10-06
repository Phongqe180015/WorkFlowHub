import React, { useState, useEffect } from 'react';
import { SprintService } from '../services/api';
import type { Sprint } from '../types';
import { X, Calendar, Loader2, AlertCircle, Edit3 } from 'lucide-react';

interface EditSprintModalProps {
  sprint: Sprint | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedSprint: Sprint) => void;
}

export const EditSprintModal: React.FC<EditSprintModalProps> = ({
  sprint,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<string>('PLANNED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sprint) {
      setName(sprint.name || '');
      setGoal(sprint.goal || '');
      setStartDate(sprint.startDate ? sprint.startDate.split('T')[0] : '');
      setEndDate(sprint.endDate ? sprint.endDate.split('T')[0] : '');
      setStatus(sprint.status || 'PLANNED');
      setError(null);
    }
  }, [sprint, isOpen]);

  if (!isOpen || !sprint) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên Sprint');
      return;
    }
    if (!startDate || !endDate) {
      setError('Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await SprintService.updateSprint(sprint.id, {
        projectId: sprint.projectId,
        name: name.trim(),
        goal: goal.trim() || undefined,
        startDate,
        endDate,
        status,
      });

      setLoading(false);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi cập nhật sprint:', err);
      setError(err.message || 'Không thể cập nhật Sprint. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl relative border border-gray-100">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Edit3 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa Sprint</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cập nhật thông tin, thời hạn hoặc trạng thái chu kỳ làm việc
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Tên Sprint <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Sprint 1 - Thiết kế tính năng & Database"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Mục tiêu Sprint
            </label>
            <textarea
              rows={2}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Mục tiêu cốt lõi mà đội ngũ cần đạt được trong đợt này..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 resize-none"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                <span>Ngày bắt đầu</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                <span>Ngày kết thúc</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Trạng thái Sprint
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('PLANNED')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  status === 'PLANNED'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Lên kế hoạch
              </button>
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  status === 'ACTIVE'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Đang chạy
              </button>
              <button
                type="button"
                onClick={() => setStatus('COMPLETED')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  status === 'COMPLETED'
                    ? 'bg-gray-200 border-gray-400 text-gray-800 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Hoàn thành
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
