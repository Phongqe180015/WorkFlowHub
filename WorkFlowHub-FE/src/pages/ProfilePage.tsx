import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService, UserService } from '../services/api';
import { AvatarCropModal } from '../components/AvatarCropModal';
import {
  User as UserIcon,
  Mail,
  Shield,
  KeyRound,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user, updateUser, currentRole } = useAuth();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Avatar Crop & Preview Modal States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [isUploadingCropped, setIsUploadingCropped] = useState(false);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  // Handle file select or drop - Open Crop & Preview Modal instead of uploading immediately
  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setProfileMessage({ type: 'error', text: 'Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP).' });
      return;
    }
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setProfileMessage({ type: 'error', text: 'Kích thước ảnh tối đa là 10MB.' });
      return;
    }

    setProfileMessage(null);
    const objectUrl = URL.createObjectURL(file);
    setSelectedImageSrc(objectUrl);
    setCropModalOpen(true);
  };

  // Called when user finishes cropping and clicks "Lưu & Tải lên"
  const handleConfirmCrop = async (croppedBlob: Blob, croppedDataUrl: string) => {
    try {
      setIsUploadingCropped(true);
      setProfileMessage(null);

      // Convert cropped Blob to File object for upload
      const croppedFile = new File([croppedBlob], `avatar-${Date.now()}.png`, { type: 'image/png' });

      // 1. Upload to Cloudinary via backend API
      const uploadedUrl = await UserService.uploadAvatar(croppedFile);
      const finalAvatarUrl = uploadedUrl || croppedDataUrl;

      // 2. Save to user profile in backend database
      if (user?.id) {
        await UserService.updateUserProfile(user.id, { avatar: finalAvatarUrl });
      }
      updateUser({ avatar: finalAvatarUrl });
      setAvatarPreview(finalAvatarUrl);

      setProfileMessage({ type: 'success', text: 'Căn chỉnh và cập nhật ảnh đại diện lên Cloudinary thành công!' });
      setCropModalOpen(false);
      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc);
        setSelectedImageSrc(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Failed to crop and upload avatar:', err);
      setProfileMessage({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải ảnh lên Cloudinary.',
      });
    } finally {
      setIsUploadingCropped(false);
    }
  };

  const handleCloseCropModal = () => {
    if (isUploadingCropped) return;
    setCropModalOpen(false);
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
      setSelectedImageSrc(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleApplyUrlAvatar = async () => {
    if (!avatarUrlInput.trim()) return;
    try {
      setSavingProfile(true);
      const trimmedUrl = avatarUrlInput.trim();
      setAvatarPreview(trimmedUrl);
      if (user?.id) {
        await UserService.updateUserProfile(user.id, { avatar: trimmedUrl });
      }
      updateUser({ avatar: trimmedUrl });
      setAvatarUrlInput('');
      setShowUrlInput(false);
      setProfileMessage({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể lưu đường dẫn ảnh.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setSavingProfile(true);
      setAvatarPreview(null);
      if (user?.id) {
        await UserService.updateUserProfile(user.id, { avatar: null });
      }
      updateUser({ avatar: null });
      setProfileMessage({ type: 'success', text: 'Đã xóa ảnh đại diện.' });
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể xóa ảnh đại diện.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileMessage({ type: 'error', text: 'Họ và tên không được để trống.' });
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMessage(null);

      if (user?.id) {
        const updated = await UserService.updateUserProfile(user.id, {
          name: name.trim(),
          avatar: avatarPreview,
        });
        updateUser(updated || { name: name.trim(), avatar: avatarPreview });
      } else {
        updateUser({ name: name.trim(), avatar: avatarPreview });
      }

      setProfileMessage({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
    } catch (err: any) {
      console.error('Update profile error:', err);
      setProfileMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại.' });
      return;
    }
    if (!newPassword) {
      setPasswordMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu mới.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp.' });
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' });
      return;
    }

    try {
      setSavingPassword(true);
      await AuthService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Change password error:', err);
      const apiErr = err?.response?.data?.message || err?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.';
      setPasswordMessage({ type: 'error', text: apiErr });
    } finally {
      setSavingPassword(false);
    }
  };

  const displayRole = user?.roleName || user?.role || currentRole || 'USER';

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all cursor-pointer shadow-xs"
              title="Quay lại Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your Profile</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  {displayRole}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Quản lý thông tin cá nhân, cập nhật ảnh đại diện và bảo mật tài khoản
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3.5 py-2 rounded-xl border border-gray-200/70 shadow-xs">
            <Clock size={14} className="text-emerald-600" />
            <span>Trạng thái: <strong className="text-emerald-700 font-semibold">{user?.status || 'Active'}</strong></span>
          </div>
        </div>

        {/* Global Alert Messages */}
        {profileMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm transition-all ${
              profileMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {profileMessage.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-red-600" />
            )}
            <span className="flex-1">{profileMessage.text}</span>
            <button
              onClick={() => setProfileMessage(null)}
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Profile Card & Quick Stats */}
          <div className="lg:col-span-4 space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 opacity-90" />

              <div className="relative pt-6 flex flex-col items-center">
                {/* Avatar with Camera Overlay */}
                <div className="relative group mb-4">
                  <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt={user?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-3xl">
                        {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Thay đổi ảnh đại diện"
                    className="absolute bottom-1 right-1 p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <h2 className="text-lg font-bold text-gray-900">{user?.name || 'WorkflowHub User'}</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <Mail size={12} className="text-gray-400" /> {user?.email || 'user@workflowhub.com'}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {displayRole}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    ID: #{user?.id || '—'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 text-left space-y-3 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tài khoản</span>
                  <span className="font-medium text-gray-800">Đã xác minh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Quyền hạn</span>
                  <span className="font-medium text-emerald-700">{displayRole}</span>
                </div>
                {user?.createdAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tham gia từ</span>
                    <span className="font-medium text-gray-800">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Tips & Security Overview */}
            <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 rounded-3xl p-5 border border-emerald-100/80 text-xs text-emerald-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <Sparkles size={16} className="text-emerald-600" />
                <span>Bảo mật tài khoản</span>
              </div>
              <p className="text-emerald-900/80 leading-relaxed">
                Để bảo vệ an toàn cho dữ liệu công việc và các dự án của bạn, hãy sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ số và ký tự đặc biệt.
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/50 text-[11px] text-emerald-700">
                <Shield size={13} />
                <span>Phiên làm việc tự động hết hạn sau 15 phút không hoạt động</span>
              </div>
            </div>
          </div>

          {/* Right Column: Forms & Settings */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Thông tin cá nhân & Upload ảnh đại diện */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <UserIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Thông tin cá nhân & Ảnh đại diện</h3>
                  <p className="text-xs text-gray-500">Cập nhật tên hiển thị và ảnh hồ sơ của bạn</p>
                </div>
              </div>

              {/* Upload Avatar Zone */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Ảnh đại diện (Avatar)
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-gray-200 hover:border-emerald-400 bg-gray-50/50 hover:bg-emerald-50/20'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 hover:underline">
                      Nhấp để tải ảnh lên
                    </span>{' '}
                    <span className="text-xs text-gray-500">hoặc kéo thả tệp vào đây</span>
                  </div>
                  <p className="text-[11px] text-gray-400">PNG, JPG, WEBP tối đa 5MB</p>
                </div>

                {/* Avatar Action Controls */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-gray-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LinkIcon size={13} />
                    <span>{showUrlInput ? 'Ẩn nhập URL ảnh' : 'Nhập URL ảnh trực tiếp'}</span>
                  </button>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={savingProfile}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      <span>Xóa ảnh đại diện</span>
                    </button>
                  )}
                </div>

                {/* Direct Image URL Input (collapsible) */}
                {showUrlInput && (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="url"
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrlAvatar}
                      disabled={!avatarUrlInput.trim() || savingProfile}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>

              {/* Personal Info Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Nhập họ và tên..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-gray-700">
                        Email tài khoản
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Cố định</span>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Vai trò hệ thống
                    </label>
                    <input
                      type="text"
                      value={displayRole}
                      disabled
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Trạng thái tài khoản
                    </label>
                    <input
                      type="text"
                      value={user?.status || 'Active'}
                      disabled
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 text-emerald-700 font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <span>Lưu thông tin</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Đổi mật khẩu (Change Password) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Thay đổi mật khẩu</h3>
                  <p className="text-xs text-gray-500">
                    Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                  </p>
                </div>
              </div>

              {passwordMessage && (
                <div
                  className={`p-4 rounded-2xl flex items-center gap-3 text-sm transition-all ${
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0 text-red-600" />
                  )}
                  <span className="flex-1">{passwordMessage.text}</span>
                  <button
                    onClick={() => setPasswordMessage(null)}
                    className="text-xs opacity-70 hover:opacity-100 cursor-pointer font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password validation indicators */}
                <div className="p-3 bg-gray-50 rounded-2xl text-[11px] text-gray-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className={newPassword.length >= 6 ? 'text-emerald-700 font-medium' : ''}>
                      Mật khẩu tối thiểu 6 ký tự
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        confirmPassword && newPassword === confirmPassword ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                    <span
                      className={
                        confirmPassword && newPassword === confirmPassword
                          ? 'text-emerald-700 font-medium'
                          : ''
                      }
                    >
                      Mật khẩu xác nhận trùng khớp
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Đang cập nhật...</span>
                      </>
                    ) : (
                      <span>Đổi mật khẩu</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Crop & Preview Modal */}
      <AvatarCropModal
        isOpen={cropModalOpen}
        imageSrc={selectedImageSrc}
        onClose={handleCloseCropModal}
        onConfirm={handleConfirmCrop}
        isUploading={isUploadingCropped}
      />
    </div>
  );
};
