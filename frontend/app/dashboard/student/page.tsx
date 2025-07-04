'use client';

import { useQuery, useMutation } from '@apollo/client';
import { CURRENT_USER_QUERY, GET_SCORES_QUERY, GET_ATTENDANCE_QUERY, GET_USERS_QUERY, GET_MY_CLASSES_QUERY, FIND_USER_BY_ID_QUERY, GET_MY_NOTIFICATION, GET_UNREAD_NOTIFICATION_COUNT } from '@/graphql/queries';
import { MARK_NOTIFICATION_AS_READ_MUTATION } from '@/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

// Types
interface User {
  id: string;
  username: string;
  fullName?: string;
  role: string;
}

interface Score {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  score: number;
}

interface AttendanceRecord {
  studentId: string;
  status: string;
  classId: string;
  date: string;
}

interface Class {
  id: string;
  className: string;
  subject: string;
  teacherId?: string;
  teacher?: User;
}

interface Notification {
  id: string;
  message: string;
  recipients: string[];
  createdAt: string;
  className?: string;
  teacherName?: string;
}

type TabType = 'info' | 'noti' | 'class' | 'score' | 'attendance';

// Components
interface NotificationDropdownProps {
  notifications: Notification[];
  open: boolean;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void;
}

function NotificationDropdown({ notifications, open, onClose, onMarkAsRead }: NotificationDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!open) return;
    
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">🔔 Thông báo</h3>
      </div>
      <div className="p-2">
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Không có thông báo nào</div>
        ) : (
          notifications.map((noti) => (
            <div 
              key={noti.id} 
              className="p-3 hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
              onClick={() => {
                onMarkAsRead(noti.id);
                onClose();
              }}
            >
              <div className="font-medium text-gray-900 text-sm mb-1">{noti.message}</div>
              <div className="text-xs text-gray-500 mb-1">
                Lớp: {noti.className || (Array.isArray(noti.recipients) ? noti.recipients.join(', ') : noti.recipients)}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(noti.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'info' as TabType, label: 'Thông tin', icon: '👤', activeClass: 'bg-[var(--sidebar-active)] text-blue-900', hoverClass: 'hover:bg-[var(--sidebar-hover)] text-blue-800' },
    { id: 'noti' as TabType, label: 'Thông báo', icon: '🔔', activeClass: 'bg-yellow-200 text-yellow-900', hoverClass: 'hover:bg-yellow-100 text-yellow-800' },
    { id: 'class' as TabType, label: 'Lớp học', icon: '🏫', activeClass: 'bg-[var(--pastel-blue)] text-blue-900', hoverClass: 'hover:bg-[var(--sidebar-hover)] text-blue-800' },
    { id: 'score' as TabType, label: 'Điểm số', icon: '📊', activeClass: 'bg-[var(--pastel-purple)] text-purple-900', hoverClass: 'hover:bg-[var(--pastel-indigo)] text-purple-800' },
    { id: 'attendance' as TabType, label: 'Điểm danh', icon: '📝', activeClass: 'bg-[var(--pastel-green)] text-green-900', hoverClass: 'hover:bg-[var(--pastel-cyan)] text-green-800' },
  ];

  return (
    <aside className="w-56 min-h-screen bg-[var(--sidebar-bg)] shadow-lg flex flex-col py-8 px-4 gap-2">
      <h2 className="text-2xl font-bold text-blue-700 mb-8 text-center font-sans">🎓 Student</h2>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-lg transition-colors mb-1 ${
            activeTab === tab.id ? tab.activeClass : tab.hoverClass
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </aside>
  );
}

interface HeaderBarProps {
  unreadCount: number;
  showNotificationDropdown: boolean;
  onToggleNotifications: () => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onCloseNotifications: () => void;
}

function HeaderBar({ 
  unreadCount, 
  showNotificationDropdown, 
  onToggleNotifications, 
  onLogout, 
  notifications, 
  onMarkAsRead, 
  onCloseNotifications 
}: HeaderBarProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-blue-800 drop-shadow font-sans">Student Dashboard</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={onToggleNotifications}
            className="relative p-2 text-gray-600 hover:text-yellow-600 transition-colors"
            title="Thông báo"
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown
            notifications={notifications}
            open={showNotificationDropdown}
            onClose={onCloseNotifications}
            onMarkAsRead={onMarkAsRead}
          />
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition font-semibold"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

interface TeacherNameByIdProps {
  teacherId: string;
}

function TeacherNameById({ teacherId }: TeacherNameByIdProps) {
  const { data, loading, error } = useQuery(FIND_USER_BY_ID_QUERY, { variables: { id: teacherId } });
  
  if (loading) return <span>Đang tải...</span>;
  if (error || !data?.findById) return <span>Chưa có giáo viên</span>;
  
  return <span>{data.findById.fullName || data.findById.username}</span>;
}

// Main Component
export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [scoreSearch, setScoreSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [scorePage, setScorePage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  
  const pageSize = 10;

  // Queries
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY);
  const isStudent = data?.current_User?.role === 'STUDENT';

  const { data: usersData } = useQuery(GET_USERS_QUERY, { skip: !isStudent });
  const { data: notificationData, refetch: refetchNotifications } = useQuery(GET_MY_NOTIFICATION, { skip: !isStudent });
  const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, { skip: !isStudent });

  const username = data?.current_User?.username;
  const currentUserInfo = usersData?.findAllUsers?.find((u: User) => u.username === username);
  const studentId = currentUserInfo?.id;

  const { data: scoresData, loading: loadingScores } = useQuery(GET_SCORES_QUERY, {
    variables: { studentId },
    skip: !isStudent || !studentId,
  });

  const { data: attendanceData, loading: loadingAttendance } = useQuery(GET_ATTENDANCE_QUERY, {
    variables: { studentId },
    skip: !isStudent || !studentId,
  });

  const { data: classesData, loading: loadingClasses } = useQuery(GET_MY_CLASSES_QUERY, {
    skip: !isStudent || !studentId,
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ_MUTATION);

  // Memoized computations
  const filteredScores = useMemo(() => {
    return (scoresData?.score?.filter((s: Score) => 
      s.studentId === studentId && (
        s.subject.toLowerCase().includes(scoreSearch.toLowerCase()) ||
        s.classId.toLowerCase().includes(scoreSearch.toLowerCase())
      )
    ) || []);
  }, [scoresData?.score, studentId, scoreSearch]);

  const filteredAttendance = useMemo(() => {
    return (attendanceData?.attendance?.flatMap((a: any) =>
      a.records?.filter((r: AttendanceRecord) => 
        r.studentId === studentId && 
        a.classId.toLowerCase().includes(attendanceSearch.toLowerCase())
      ).map((r: AttendanceRecord) => ({...r, classId: a.classId, date: a.date})) || []
    ) || []);
  }, [attendanceData?.attendance, studentId, attendanceSearch]);

  const pagedScores = useMemo(() => 
    filteredScores.slice((scorePage - 1) * pageSize, scorePage * pageSize),
    [filteredScores, scorePage]
  );

  const pagedAttendance = useMemo(() => 
    filteredAttendance.slice((attendancePage - 1) * pageSize, attendancePage * pageSize),
    [filteredAttendance, attendancePage]
  );

  const avgScore = useMemo(() => 
    filteredScores.length ? (filteredScores.reduce((sum: number, s: Score) => sum + s.score, 0) / filteredScores.length).toFixed(2) : '-',
    [filteredScores]
  );

  const attendanceRate = useMemo(() => {
    const present = filteredAttendance.filter((r: AttendanceRecord) => r.status === 'PRESENT').length;
    return filteredAttendance.length ? Math.round(present / filteredAttendance.length * 100) : 0;
  }, [filteredAttendance]);

  const myClasses = classesData?.getMyClasses || [];
  const unreadCount = unreadCountData?.getUnreadNotificationCount || 0;

  // Callbacks
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead({ variables: { notificationId } });
      refetchUnreadCount();
      refetchNotifications();
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
    }
  }, [markAsRead, refetchUnreadCount, refetchNotifications]);

  const handleLogout = useCallback(() => {
    window.location.href = '/login';
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotificationDropdown(prev => !prev);
  }, []);

  // Effects
  useEffect(() => {
    if (error || !isStudent) {
      router.push('/login');
    }
  }, [data, error, router, isStudent]);

  // Loading state
  if (loading || !isStudent) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-lg text-gray-600">
        Loading student dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[var(--background)] to-[var(--pastel-blue)]">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="flex-1 p-8 max-w-5xl mx-auto">
        <HeaderBar
          unreadCount={unreadCount}
          showNotificationDropdown={showNotificationDropdown}
          onToggleNotifications={toggleNotifications}
          onLogout={handleLogout}
          notifications={notificationData?.getMyNotifications || []}
          onMarkAsRead={handleMarkAsRead}
          onCloseNotifications={() => setShowNotificationDropdown(false)}
        />

        {/* Tab content */}
        {activeTab === 'info' && (
          <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
            <h2 className="text-2xl font-semibold mb-4 text-green-800 font-sans flex items-center gap-2">
              👤 Thông tin cá nhân
            </h2>
            <div className="text-lg text-gray-800 mb-2">
              Tên: <b>{currentUserInfo?.fullName || currentUserInfo?.username}</b>
            </div>
            <div className="text-lg text-gray-800 mb-2">
              Username: <b>{currentUserInfo?.username}</b>
            </div>
            <div className="text-lg text-gray-800 mb-2">
              Vai trò: <b>Học sinh</b>
            </div>
          </div>
        )}

        {activeTab === 'noti' && (
          <div className="mb-10 bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-800 font-sans flex items-center gap-2">
              🔔 Thông báo của bạn
            </h2>
            {notificationData?.getMyNotifications?.length === 0 ? (
              <div className="text-gray-500">Không có thông báo nào.</div>
            ) : (
              <ul className="space-y-2">
                {notificationData.getMyNotifications.map((noti: Notification) => (
                  <li key={noti.id} className="bg-white rounded-lg shadow p-4 border border-yellow-100">
                    <div className="font-medium text-gray-900 mb-1">{noti.message}</div>
                    <div className="text-xs text-gray-500 mb-1">
                      Lớp nhận: {noti.className || (Array.isArray(noti.recipients) ? noti.recipients.join(', ') : noti.recipients)}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      Giáo viên: {noti.teacherName || '---'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Thời gian: {new Date(noti.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'class' && (
          <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
            <h2 className="text-2xl font-semibold mb-4 text-green-800 font-sans flex items-center gap-2">
              🏫 Lớp học của tôi
            </h2>
            {loadingClasses ? (
              <div>Đang tải lớp học...</div>
            ) : myClasses.length === 0 ? (
              <div className="text-gray-500">Bạn chưa tham gia lớp học nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow font-sans">
                  <thead>
                    <tr className="bg-green-100 text-green-800 font-bold">
                      <th className="border px-3 py-2">Tên lớp</th>
                      <th className="border px-3 py-2">Môn học</th>
                      <th className="border px-3 py-2">Giáo viên</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myClasses.map((c: Class) => (
                      <tr key={c.id} className="hover:bg-green-50 transition text-gray-900 font-medium">
                        <td className="border px-3 py-2">{c.className}</td>
                        <td className="border px-3 py-2">{c.subject}</td>
                        <td className="border px-3 py-2">
                          {c.teacher ? (
                            c.teacher.fullName || c.teacher.username
                          ) : c.teacherId ? (
                            <TeacherNameById teacherId={c.teacherId} />
                          ) : (
                            'Chưa có giáo viên'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'score' && (
          <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
            <h2 className="text-2xl font-semibold mb-4 text-purple-800 font-sans flex items-center gap-2">
              📊 Điểm số của bạn
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <label className="block text-base font-bold mb-1 text-gray-900">
                Tìm kiếm theo môn hoặc lớp...
              </label>
              <input
                className="border-2 border-purple-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-purple-400 outline-none mb-2"
                placeholder="Tìm kiếm theo môn hoặc lớp..."
                value={scoreSearch}
                onChange={(e) => {
                  setScoreSearch(e.target.value);
                  setScorePage(1);
                }}
              />
              <span className="text-gray-600 text-base">
                Trung bình: <b className="text-purple-700">{avgScore}</b>
              </span>
            </div>
            
            {loadingScores ? (
              <div className="flex flex-col items-center py-8 text-lg text-gray-500">
                <span className="text-4xl mb-2">⏳</span>Đang tải điểm...
              </div>
            ) : scoresData?.score?.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-lg text-gray-500">
                <span className="text-4xl mb-2">📭</span>Không có dữ liệu điểm.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-lg mb-2 bg-white rounded-xl overflow-hidden shadow-lg">
                  <thead>
                    <tr className="bg-purple-100 text-purple-800 font-bold">
                      <th className="border px-4 py-3">Môn</th>
                      <th className="border px-4 py-3">Điểm</th>
                      <th className="border px-4 py-3">Lớp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedScores.map((s: Score) => (
                      <tr key={s.id} className="hover:bg-purple-50 transition text-gray-900 font-medium">
                        <td className="border px-4 py-2">{s.subject}</td>
                        <td className="border px-4 py-2">
                          <span className={`inline-block px-2 py-1 rounded font-bold ${
                            s.score >= 8 ? 'bg-green-100 text-green-700' : 
                            s.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {s.score}
                          </span>
                        </td>
                        <td className="border px-4 py-2">{s.classId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination for scores */}
            <div className="flex gap-2 items-center mb-4 mt-4">
              <button 
                disabled={scorePage === 1} 
                onClick={() => setScorePage(p => p - 1)} 
                className="px-3 py-1 border rounded disabled:opacity-50 bg-purple-100 hover:bg-purple-200"
              >
                Trước
              </button>
              <span className="text-base">
                Trang {scorePage} / {Math.ceil(filteredScores.length / pageSize) || 1}
              </span>
              <button 
                disabled={scorePage * pageSize >= filteredScores.length} 
                onClick={() => setScorePage(p => p + 1)} 
                className="px-3 py-1 border rounded disabled:opacity-50 bg-purple-100 hover:bg-purple-200"
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
            <h2 className="text-2xl font-semibold mb-4 text-green-800 font-sans">
              📝 Lịch sử điểm danh
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <label className="block text-base font-bold mb-1 text-gray-900">
                Tìm kiếm theo lớp...
              </label>
              <input
                className="border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2"
                placeholder="Tìm kiếm theo lớp..."
                value={attendanceSearch}
                onChange={(e) => {
                  setAttendanceSearch(e.target.value);
                  setAttendancePage(1);
                }}
              />
              <span className="text-gray-600 text-base">
                Tỉ lệ có mặt: <b>{attendanceRate}%</b>
              </span>
            </div>
            
            {loadingAttendance ? (
              <div>Đang tải điểm danh...</div>
            ) : filteredAttendance.length === 0 ? (
              <div className="text-gray-500">Không có dữ liệu điểm danh.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-base mb-2 bg-white rounded-xl overflow-hidden shadow font-sans">
                  <thead>
                    <tr className="bg-green-100 text-green-800 font-bold">
                      <th className="border px-3 py-2">Lớp</th>
                      <th className="border px-3 py-2">Ngày</th>
                      <th className="border px-3 py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAttendance.map((r: AttendanceRecord, idx: number) => {
                      const classInfo = myClasses.find((c: Class) => c.id === r.classId);
                      return (
                        <tr key={`${r.classId}:${r.date}:${r.studentId}:${idx}`} className="hover:bg-green-50 transition text-gray-900 font-medium">
                          <td className="border px-3 py-2">
                            {classInfo ? classInfo.className : r.classId}
                            <div className="text-xs text-gray-500">
                              {classInfo ? classInfo.subject : ''}
                            </div>
                            <div className="text-xs text-gray-500">
                              Giáo viên: {classInfo ? (
                                classInfo.teacher ? (
                                  classInfo.teacher.fullName || classInfo.teacher.username
                                ) : classInfo.teacherId ? (
                                  <TeacherNameById teacherId={classInfo.teacherId} />
                                ) : 'Chưa có giáo viên'
                              ) : ''}
                            </div>
                          </td>
                          <td className="border px-3 py-2">{r.date?.slice(0, 10)}</td>
                          <td className="border px-3 py-2">{r.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination for attendance */}
            <div className="flex gap-2 items-center mb-4">
              <button 
                disabled={attendancePage === 1} 
                onClick={() => setAttendancePage(p => p - 1)} 
                className="px-3 py-1 border rounded disabled:opacity-50 bg-green-100 hover:bg-green-200"
              >
                Trước
              </button>
              <span className="text-base">
                Trang {attendancePage} / {Math.ceil(filteredAttendance.length / pageSize) || 1}
              </span>
              <button 
                disabled={attendancePage * pageSize >= filteredAttendance.length} 
                onClick={() => setAttendancePage(p => p + 1)} 
                className="px-3 py-1 border rounded disabled:opacity-50 bg-green-100 hover:bg-green-200"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
