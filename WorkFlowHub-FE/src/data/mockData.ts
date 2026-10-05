import type { User, Task, ActivityLog, Attachment, Comment, NotificationItem } from '../types';

export const mockUsers: User[] = [
  { id: 1, name: 'Minh Trần', email: 'minh@workflowhub.vn', role: 'ADMIN', status: 'active', avatar: 'MI' },
  { id: 2, name: 'Lan Nguyễn', email: 'lan@workflowhub.vn', role: 'PROJECT_MANAGER', status: 'active', avatar: 'LA' },
  { id: 3, name: 'Hải Phạm', email: 'hai@workflowhub.vn', role: 'DEVELOPER', status: 'active', avatar: 'HẢ' },
  { id: 4, name: 'Trầm Lê', email: 'tram@workflowhub.vn', role: 'VIEWER', status: 'invited', avatar: 'TR' },
];

export const mockTasks: Task[] = [
  { id: 101, title: 'Thiết kế bảng điều khiển', status: 'TO_DO', category: 'Giao diện', assigneeName: 'Lan Nguyễn', assigneeAvatar: 'LA', progress: 0, dueDate: 'Thứ 6', priority: 'MEDIUM' },
  { id: 102, title: 'Viết tài liệu API', status: 'TO_DO', category: 'Tài liệu', assigneeName: 'Lan Nguyễn', assigneeAvatar: 'LA', progress: 10, dueDate: 'Thứ 6', priority: 'LOW' },
  { id: 103, title: 'Tối ưu truy vấn', status: 'TO_DO', category: 'Cơ sở dữ liệu', assigneeName: 'Minh Trần', assigneeAvatar: 'MI', progress: 0, dueDate: 'Thứ 2', priority: 'HIGH' },
  { id: 104, title: 'Kết nối Kafka cho thông báo', status: 'IN_PROGRESS', category: 'Hạ tầng', assigneeName: 'Hải Phạm', assigneeAvatar: 'HẢ', progress: 70, dueDate: 'Hôm nay', priority: 'HIGH' },
  { id: 105, title: 'Đánh chỉ số hiệu suất', status: 'IN_PROGRESS', category: 'Hiệu năng', assigneeName: 'Minh Trần', assigneeAvatar: 'MI', progress: 40, dueDate: 'Thứ 5', priority: 'MEDIUM' },
  { id: 106, title: 'Cấu hình CI/CD', status: 'DONE', category: 'Tự động', assigneeName: 'Hải Phạm', assigneeAvatar: 'HẢ', progress: 100, dueDate: 'Đã xong', priority: 'MEDIUM' },
  { id: 107, title: 'Chuyển đổi sang PostgreSQL', status: 'DONE', category: 'Cơ sở dữ liệu', assigneeName: 'Hải Phạm', assigneeAvatar: 'HẢ', progress: 100, dueDate: 'Đã xong', priority: 'HIGH' },
  { id: 108, title: 'Sửa lỗi đăng nhập', status: 'DONE', category: 'Bảo mật', assigneeName: 'Minh Trần', assigneeAvatar: 'MI', progress: 100, dueDate: 'Đã xong', priority: 'HIGH' },
  { id: 109, title: 'Viết test bảo mật', status: 'DONE', category: 'Bảo mật', assigneeName: 'Minh Trần', assigneeAvatar: 'MI', progress: 100, dueDate: 'Đã xong', priority: 'MEDIUM' },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 1, userName: 'Minh', action: 'chuyển thẻ', target: '"Tối ưu truy vấn" sang Đang làm', timeAgo: 'Vừa xong' },
  { id: 2, userName: 'Lan', action: 'đính kèm', target: 'mockup-dashboard.fig', timeAgo: '15 phút trước' },
  { id: 3, userName: 'Hải', action: 'thêm bình luận vào thẻ', target: '"Kết nối Kafka"', timeAgo: '1 giờ trước' },
];

export const mockAttachments: Attachment[] = [
  { id: 1, fileName: 'kafka-topology.drawio', fileSize: '48 KB', uploaderName: 'Lan' },
  { id: 2, fileName: 'consumer-retry.patch', fileSize: '12 KB', uploaderName: 'Tôi' },
  { id: 3, fileName: 'perf-baseline.csv', fileSize: '210 KB', uploaderName: 'Minh' },
];

export const mockComments: Comment[] = [
  { id: 1, userName: 'Lan', time: '09:12', content: 'Phần retry cho consumer Kafka xử lý thế nào rồi?' },
  { id: 2, userName: 'Tôi', time: '09:20', content: 'Đã thêm dead-letter queue, đang viết test.', isSelf: true },
  { id: 3, userName: 'Lan', time: '09:24', content: 'Tốt, nhớ gắn nhãn sprint 32 nhé.' },
];

export const mockNotifications: NotificationItem[] = [
  { id: 1, title: 'Sprint 32 kết thúc sau 3 ngày', initials: 'SP', time: '10:02' },
  { id: 2, title: 'Lan đã nhắc bạn trong thẻ mockup', initials: 'LA', time: '09:15' },
  { id: 3, title: 'Báo cáo tuần 31 đã sẵn sàng', initials: 'BÁ', time: 'Hôm qua' },
];
