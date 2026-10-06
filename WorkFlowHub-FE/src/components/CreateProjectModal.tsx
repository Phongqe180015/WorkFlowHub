import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProjectService } from '../services/api';
import type { Project } from '../types';
import { X, FolderPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, setCurrentRole } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên dự án');
      return;
    }

    if (!user?.id) {
      setError('Không tìm thấy thông tin tài khoản người tạo. Vui lòng đăng nhập lại.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Tạo project trong table project
      // Backend đã đồng thời tạo record trong project_members với role PROJECT_MANAGER
      setStatusMessage('Đang khởi tạo dự án và thiết lập quyền Quản lý dự án...');
      const createdProject = await ProjectService.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        ownerId: user.id,
      });

      // 2. Chuyển không gian làm việc tại FE sang PROJECT_MANAGER
      setCurrentRole('PROJECT_MANAGER');

      setStatusMessage('Tạo dự án thành công!');
      setTimeout(() => {
        setName('');
        setDescription('');
        setStatusMessage(null);
        setLoading(false);
        onSuccess(createdProject);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Lỗi khi tạo dự án:', err);
      setError(err.message || 'Không thể tạo dự án. Vui lòng thử lại!');
      setLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl relative border border-gray-100">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FolderPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tạo dự án mới</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Bạn sẽ là <span className="font-semibold text-emerald-700">Project Manager</span> của dự án này
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            {loading ? (
              <Loader2 size={16} className="shrink-0 animate-spin" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Tên dự án <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Hệ thống Quản trị Sprint"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-800"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Mô tả dự án
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả mục tiêu, phạm vi hoặc thông tin chi tiết về dự án..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-800 resize-none"
              disabled={loading}
            />
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1">
            <div className="font-semibold text-gray-800 flex items-center gap-1.5">
              <span>✨ Đặc quyền sau khi tạo:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-gray-500 space-y-0.5">
              <li>Vai trò của bạn tự động được cấp quyền <strong className="text-emerald-700">Project Manager</strong>.</li>
              <li>Được tạo và quản lý các chu kỳ <strong className="text-gray-700">Sprint</strong>.</li>
              <li>Được <strong className="text-gray-700">thêm thành viên</strong> và chỉ định vai trò cho từng người.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Đang khởi tạo...' : 'Tạo dự án & Bắt đầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
