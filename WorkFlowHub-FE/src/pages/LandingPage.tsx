import React from 'react';
import { useAuth, type RoleType } from '../context/AuthContext';
import { mockTasks } from '../data/mockData';

interface LandingPageProps {
  onGoToDashboard: (role?: RoleType) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToDashboard,
  onOpenRegister,
  onOpenLogin,
}) => {
  const { isAuthenticated } = useAuth();

  const todoTasks = mockTasks.filter(t => t.status === 'TO_DO').slice(0, 2);
  const inProgressTasks = mockTasks.filter(t => t.status === 'IN_PROGRESS').slice(0, 2);
  const doneTasks = mockTasks.filter(t => t.status === 'DONE').slice(0, 2);

  return (
    <div className="bg-[#f7faf8] min-h-screen text-slate-800 selection:bg-emerald-100">
      {/* 1. HERO SECTION (Image 1) */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Phát hành bởi đội ngũ kỹ thuật
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-gray-900 tracking-tight leading-[1.15]">
              Quản lý công việc và sprint theo một bảng trắng gọn gàng
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl">
              WorkFlowHub gom công việc, sprint, bình luận và thông báo thời gian thực vào một nơi — rõ ràng như một bảng sprint được giữ ngăn nắp lúc 9 giờ sáng.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    onGoToDashboard();
                  } else {
                    onOpenRegister();
                  }
                }}
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-sm hover:shadow-md cursor-pointer text-center"
              >
                {isAuthenticated ? 'Vào Bảng điều khiển dự án' : 'Tạo dự án miễn phí'}
              </button>
              {!isAuthenticated && (
                <button
                  onClick={onOpenLogin}
                  className="px-6 py-3 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Đăng nhập bằng Google
                </button>
              )}
            </div>

            <div className="pt-4 space-y-1.5 text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Không cần thẻ tín dụng
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Đặt hàng nhóm trong 2 phút
              </div>
            </div>
          </div>

          {/* Right Hero Board Preview (100% styled from Image 1) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-emerald-950/5 border border-emerald-900/5 relative">
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm font-semibold text-gray-800">
                  Bảng sprint — Tuần 32
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                  <span className="px-2 py-0.5 rounded-md bg-gray-100">To-do · 4</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Đang làm · 2</span>
                  <span className="px-2 py-0.5 rounded-md bg-gray-100">Xong · 6</span>
                </div>
              </div>

              {/* Kanban columns in preview */}
              <div className="grid grid-cols-3 gap-3">
                {/* Column TO-DO */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-semibold text-gray-400 tracking-wider">TO-DO</div>
                  {todoTasks.map((t) => (
                    <div key={t.id} className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 space-y-2">
                      <div className="text-xs font-medium text-gray-800">{t.title}</div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[10px] bg-white rounded border border-gray-200 text-gray-500">{t.category}</span>
                        <span className="w-4 h-4 rounded-full bg-emerald-200/80 flex items-center justify-center text-[9px] text-emerald-800 font-bold"></span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column ĐANG LÀM */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-semibold text-emerald-700 tracking-wider">ĐANG LÀM</div>
                  {inProgressTasks.map((t) => (
                    <div key={t.id} className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/70 space-y-2">
                      <div className="text-xs font-medium text-gray-800">{t.title}</div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[10px] bg-white rounded border border-emerald-200 text-emerald-700">{t.category}</span>
                        <span className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[9px] text-gray-700 font-bold"></span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column XONG */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-semibold text-gray-400 tracking-wider">XONG</div>
                  {doneTasks.map((t) => (
                    <div key={t.id} className="bg-gray-50/60 p-3 rounded-xl border border-gray-100 space-y-2 opacity-80">
                      <div className="text-xs font-medium text-gray-800 line-through decoration-gray-400">{t.title}</div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[10px] bg-white rounded border border-gray-200 text-gray-400">{t.category}</span>
                        <span className="w-4 h-4 rounded-full bg-emerald-300 flex items-center justify-center text-[9px] text-emerald-900 font-bold"></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification pill at the bottom of board preview */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong className="text-gray-900 font-semibold">Lan</strong> đã hoàn thành 2 thẻ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION TÍNH NĂNG (Image 2) */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-200/60">
        <div className="max-w-xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Một bảng trắng, mọi thứ cần thiết cho nhóm
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Mỗi thẻ công việc mang theo bình luận, file đính kèm, người phụ trách và dấu vết hoạt động — không cần chuyển qua lại giữa các công cụ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 text-base mb-2">Quản lý công việc</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tạo, kéo thả và phân loại thẻ theo trạng thái, ưu tiên và người phụ trách.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 text-base mb-2">Sprint và phiên bản</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Lên kế hoạch sprint, theo dõi burndown và chốt phạm vi phát hành.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 text-base mb-2">Bình luận và file đính kèm</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Thảo luận ngay trên thẻ, đính kèm ảnh, tài liệu và thiết kế.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 text-base mb-2">Thông báo thời gian thực</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Nhận tin qua WebSocket khi có thay đổi, nhắc nhở hoặc bình luận mới.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SECTION PHÂN QUYỀN 4 VAI TRÒ (Image 2 & 3) */}
      <section id="roles" className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-200/60">
        <div className="max-w-xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Bốn vai trò, rõ ràng quyền hạn
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Phân quyền theo vai trò để ai cũng thấy đúng thứ mình cần, không thừa không thiếu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Role ADMIN */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 mb-3 tracking-wide">
                ADMIN
              </span>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Toàn quyền: thành viên, thanh toán, chính sách bảo mật và thiết lập hệ thống.
              </p>
            </div>
            <button
              onClick={() => onGoToDashboard('ADMIN')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              Xem giao diện quản trị →
            </button>
          </div>

          {/* Role PROJECT MANAGER */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 mb-3 tracking-wide">
                PROJECT MANAGER
              </span>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Điều phối dự án, lập kế hoạch sprint, phân công và báo cáo tiến độ.
              </p>
            </div>
            <button
              onClick={() => onGoToDashboard('PROJECT_MANAGER')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              Xem giao diện quản lý dự án →
            </button>
          </div>

          {/* Role DEVELOPER */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 mb-3 tracking-wide">
                DEVELOPER
              </span>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Cập nhật công việc, ghi chú kỹ thuật, đính kèm file và đánh chỉ số.
              </p>
            </div>
            <button
              onClick={() => onGoToDashboard('DEVELOPER')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              Xem giao diện nhà phát triển →
            </button>
          </div>

          {/* Role VIEWER */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 mb-3 tracking-wide">
                VIEWER
              </span>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Xem bảng, theo dõi hoạt động và nhận thông báo, không chỉnh sửa.
              </p>
            </div>
            <button
              onClick={() => onGoToDashboard('VIEWER')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              Xem giao diện người xem →
            </button>
          </div>
        </div>
      </section>

      {/* 4. SECTION BẢNG ĐIỀU KHIỂN & DẤU VẾT HOẠT ĐỘNG (Image 3) */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-200/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Bảng điều khiển và dấu vết hoạt động
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Thống kê trực quan cho từng dự án và nhật ký hoạt động đầy đủ — biết chính xác ai đã làm gì, khi nào.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-3xl font-bold text-gray-900">94%</div>
                <div className="text-xs text-gray-500 mt-1">Hoàn thành sprint</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-3xl font-bold text-gray-900">2.1k</div>
                <div className="text-xs text-gray-500 mt-1">Thẻ đã xử lý</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="text-3xl font-bold text-gray-900">18</div>
                <div className="text-xs text-gray-500 mt-1">Thành viên hoạt động</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-gray-900 tracking-wide uppercase">Nhật ký hoạt động</h4>
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <p className="text-gray-700">
                    <strong className="text-gray-900 font-semibold">Minh</strong> chuyển thẻ "Tối ưu truy vấn" sang Đang làm
                  </p>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <p className="text-gray-700">
                    <strong className="text-gray-900 font-semibold">Lan</strong> đính kèm mockup-dashboard.fig
                  </p>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <p className="text-gray-700">
                    <strong className="text-gray-900 font-semibold">Hải</strong> thêm bình luận vào thẻ "Kết nối Kafka"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION TECH STACK (Image 3) */}
      <section id="tech" className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-200/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Nền tảng đáng tin cậy cho nhóm kỹ thuật
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Xây dựng trên các công nghệ đã được kiểm chứng trong môi trường sản xuất, sẵn sàng mở rộng khi đội ngũ của bạn lớn lên.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-4 gap-3">
              {['Spring Boot', 'PostgreSQL', 'Redis', 'Kafka', 'WebSocket', 'Docker', 'CI/CD'].map((tech) => (
                <div key={tech} className="bg-white py-3.5 px-3 rounded-xl border border-gray-200/80 text-center font-medium text-xs text-gray-700 shadow-xs hover:border-emerald-300 transition-colors">
                  {tech}
                </div>
              ))}
              <div className="bg-emerald-100/70 py-3.5 px-3 rounded-xl text-center font-semibold text-xs text-emerald-800 flex items-center justify-center">
                Sẵn sàng
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION BẢNG GIÁ (Image 4) */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-200/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <div className="bg-white p-7 rounded-3xl border border-gray-200/70 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs text-gray-500 font-medium">Starter</span>
              <div className="text-3xl font-bold text-gray-900">Miễn phí</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Cho nhóm nhỏ, tối đa 5 thành viên, không giới hạn công việc.
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={onOpenRegister}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Bắt đầu
              </button>
            </div>
          </div>

          {/* Pro Plan (Highlighted green border) */}
          <div className="bg-emerald-50/40 p-7 rounded-3xl border-2 border-emerald-300 shadow-sm flex flex-col justify-between relative">
            <div className="space-y-4">
              <span className="text-xs text-emerald-800 font-semibold">Pro</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">199.000đ</span>
                <span className="text-xs text-gray-500">/người/tháng</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Báo cáo nâng cao, thông báo ưu tiên và tích hợp thời gian thực.
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={onOpenRegister}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer shadow-xs"
              >
                Dùng thử Pro
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white p-7 rounded-3xl border border-gray-200/70 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs text-gray-500 font-medium">Doanh nghiệp</span>
              <div className="text-3xl font-bold text-gray-900">Theo yêu cầu</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Triển khai riêng, phân quyền nâng cao và hỗ trợ kỹ thuật ưu tiên.
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={onOpenRegister}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Liên hệ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER (Image 4) */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-[#eaf5ee] rounded-3xl p-10 sm:p-14 text-center border border-emerald-200/50">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Sẵn sàng cho sprint tiếp theo?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto mb-6">
            Tạo dự án miễn phí hoặc đăng nhập bằng Google để đưa nhóm của bạn lên cùng một bảng trắng.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenRegister}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-all shadow-xs cursor-pointer"
            >
              Tạo dự án miễn phí
            </button>
            <button
              onClick={onOpenLogin}
              className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-full border border-gray-200 transition-all cursor-pointer"
            >
              Đăng nhập bằng Google
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
