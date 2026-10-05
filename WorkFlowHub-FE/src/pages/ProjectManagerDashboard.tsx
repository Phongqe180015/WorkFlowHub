import React, { useState } from 'react';

export const ProjectManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('currentSprint');

  const sidebarItems = [
    { id: 'currentSprint', label: 'Sprint hiện tại' },
    { id: 'projects', label: 'Dự án' },
    { id: 'assignments', label: 'Phân công' },
    { id: 'progress', label: 'Báo cáo tiến độ' },
    { id: 'risks', label: 'Rủi ro' },
  ];

  // Burndown chart bar data (10 days as displayed in Image 6)
  const burndownBars = [
    { day: 1, height: '80%', isHighlight: false },
    { day: 2, height: '80%', isHighlight: false },
    { day: 3, height: '70%', isHighlight: false },
    { day: 4, height: '58%', isHighlight: false },
    { day: 5, height: '50%', isHighlight: false },
    { day: 6, height: '42%', isHighlight: true }, // Highlighted darker green in mockup
    { day: 7, height: '32%', isHighlight: false },
    { day: 8, height: '22%', isHighlight: false },
    { day: 9, height: '14%', isHighlight: false },
    { day: 10, height: '6%', isHighlight: false },
  ];

  // Task assignments list
  const assignedTasks = [
    {
      id: 1,
      title: 'Kết nối Kafka cho thông báo',
      assigneeAvatar: 'HẢ',
      deadline: 'Hôm nay',
      status: 'Đang làm',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      id: 2,
      title: 'Đánh chỉ số hiệu suất',
      assigneeAvatar: 'MI',
      deadline: 'Thứ 5',
      status: 'Đang làm',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      id: 3,
      title: 'Thiết kế bảng điều khiển',
      assigneeAvatar: 'LA',
      deadline: 'Thứ 6',
      status: 'Chờ duyệt',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      id: 4,
      title: 'Chuyển đổi sang PostgreSQL',
      assigneeAvatar: 'HẢ',
      deadline: 'Đã xong',
      status: 'Xong',
      statusColor: 'bg-gray-100 text-gray-700 border-gray-200',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-gray-400 tracking-wider px-3 py-2 uppercase">
              Quản lý dự án
            </div>
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-emerald-500' : 'bg-transparent'
                    }`}
                  ></span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sprint hiện tại</h1>
            <p className="text-xs text-gray-500 mt-1">
              Giao diện demo cho vai trò <strong className="font-semibold text-gray-700">Quản lý dự án</strong> — dữ liệu minh họa, chưa lưu thật.
            </p>
          </div>

          {/* Metric KPI Cards (4 cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">Sprint 32</div>
              <div className="text-[11px] text-gray-500 mt-1">Tuần 32 · 10 ngày</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">68%</div>
              <div className="text-[11px] text-gray-500 mt-1">Tiến độ sprint</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">12</div>
              <div className="text-[11px] text-gray-500 mt-1">Thẻ trong sprint</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">3</div>
              <div className="text-[11px] text-gray-500 mt-1">Ngày còn lại</div>
            </div>
          </div>

          {/* Burndown Chart Card (Image 6) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Burndown — Sprint 32</h3>
              <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-xs cursor-pointer">
                Lập kế hoạch sprint
              </button>
            </div>

            {/* Custom Bar Burndown Chart reproducing Image 6 */}
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
              Còn <strong className="text-gray-800 font-semibold">2 điểm</strong> công việc chưa hoàn thành — đà hiện tại đủ để chốt sprint đúng hạn.
            </div>
          </div>

          {/* Phân công công việc (Task Assignments List) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Phân công công việc</h3>

            <div className="divide-y divide-gray-100">
              {assignedTasks.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs">
                      {t.assigneeAvatar}
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{t.title}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-gray-400 font-medium">{t.deadline}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] rounded-md font-semibold border ${t.statusColor}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
