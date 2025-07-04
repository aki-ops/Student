'use client';

import { useQuery, useMutation } from '@apollo/client';
import { CURRENT_USER_QUERY, GET_CLASSES_QUERY, GET_SCORES_QUERY, GET_ATTENDANCE_QUERY, GET_USERS_QUERY, FIND_USER_BY_ID_QUERY, GET_SENT_NOTIFICATIONS } from '@/graphql/queries';
import { CREATE_CLASS_MUTATION, CREATE_ATTENDANCE_MUTATION, UPDATE_ATTENDANCE_MUTATION, CREATE_NOTIFICATION_MUTATION, REMOVE_STUDENT_FROM_CLASS_MUTATION } from '@/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Types
interface User {
  id: string;
  username: string;
  fullName?: string;
  role: string;
}

interface Class {
  id: string;
  className: string;
  subject: string;
  teacherId: string;
  teacher?: User;
  studentIds: string[];
  students?: User[];
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
}

interface Attendance {
  id: string;
  classId: string;
  date: string;
  records: AttendanceRecord[];
}

interface Notification {
  id: string;
  message: string;
  recipients: string[];
  createdAt: string;
  className?: string;
  teacherName?: string;
}

type TabType = 'info' | 'class' | 'score' | 'attendance' | 'noti';

// Components
interface NotificationDropdownProps {
  notifications: Notification[];
  open: boolean;
  onClose: () => void;
}

function NotificationDropdown({ notifications, open, onClose }: NotificationDropdownProps) {
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
    <div ref={ref} className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-yellow-200 z-50">
      <div className="p-4 border-b font-bold text-yellow-800">Thông báo đã gửi</div>
      {notifications.length === 0 ? (
        <div className="p-4 text-gray-500">Chưa có thông báo nào.</div>
      ) : (
        <ul className="divide-y">
          {notifications.map((noti) => (
            <li key={noti.id} className="p-4 hover:bg-yellow-50">
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
  );
}

interface HeaderBarProps {
  notifications: Notification[];
  onLogout: () => void;
}

function HeaderBar({ notifications, onLogout }: HeaderBarProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="absolute top-6 right-8 flex items-center gap-4 z-40">
      <div className="relative">
        <button
          className="p-2 rounded-full hover:bg-yellow-100 focus:outline-none"
          title="Thông báo"
          onClick={() => setOpen(o => !o)}
        >
          <BellIcon className="w-7 h-7 text-yellow-600" />
        </button>
        <NotificationDropdown 
          notifications={notifications} 
          open={open} 
          onClose={() => setOpen(false)} 
        />
      </div>
      <button
        className="p-2 rounded-full hover:bg-red-100 focus:outline-none"
        title="Đăng xuất"
        onClick={onLogout}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-red-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6-3h12m0 0l-3-3m3 3l-3 3" />
        </svg>
      </button>
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
    { id: 'class' as TabType, label: 'Lớp học', icon: '🏫', activeClass: 'bg-[var(--pastel-blue)] text-blue-900', hoverClass: 'hover:bg-[var(--sidebar-hover)] text-blue-800' },
    { id: 'score' as TabType, label: 'Điểm số', icon: '📊', activeClass: 'bg-[var(--pastel-purple)] text-purple-900', hoverClass: 'hover:bg-[var(--pastel-indigo)] text-purple-800' },
    { id: 'attendance' as TabType, label: 'Điểm danh', icon: '📝', activeClass: 'bg-[var(--pastel-green)] text-green-900', hoverClass: 'hover:bg-[var(--pastel-cyan)] text-green-800' },
    { id: 'noti' as TabType, label: 'Thông báo', icon: '🔔', activeClass: 'bg-yellow-200 text-yellow-900', hoverClass: 'hover:bg-yellow-100 text-yellow-800' },
  ];

  return (
    <aside className="w-56 min-h-screen bg-[var(--sidebar-bg)] shadow-lg flex flex-col py-8 px-4 gap-2">
      <h2 className="text-2xl font-bold text-blue-700 mb-8 text-center font-sans">👨‍🏫 Teacher</h2>
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

interface TeacherNameByIdProps {
  teacherId: string;
}

function TeacherNameById({ teacherId }: TeacherNameByIdProps) {
  const { data, loading, error } = useQuery(FIND_USER_BY_ID_QUERY, { variables: { id: teacherId } });
  
  if (loading) return <span>Đang tải...</span>;
  if (error || !data?.findById) return <span>Chưa có giáo viên</span>;
  
  return <span>{data.findById.fullName || data.findById.username}</span>;
}

interface StudentNameByIdProps {
  studentId: string;
}

function StudentNameById({ studentId }: StudentNameByIdProps) {
  const { data, loading, error } = useQuery(FIND_USER_BY_ID_QUERY, { variables: { id: studentId } });
  
  if (loading) return <span>Đang tải...</span>;
  if (error || !data?.findById) return <span>Không tìm thấy học sinh</span>;
  
  return <span>{data.findById.fullName || data.findById.username}</span>;
}

// Main Component
export default function TeacherDashboard() {
  const router = useRouter();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [createClassForm, setCreateClassForm] = useState({ className: '', subject: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [scoreSearch, setScoreSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [scorePage, setScorePage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendanceClassId, setAttendanceClassId] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceMsg, setAttendanceMsg] = useState('');
  const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null);
  const [showSendNotiModal, setShowSendNotiModal] = useState(false);
  const [notiTitle, setNotiTitle] = useState('');
  const [notiContent, setNotiContent] = useState('');
  const [notiClassId, setNotiClassId] = useState<string>('');
  const [notiMsg, setNotiMsg] = useState('');
  
  const pageSize = 10;

  // Queries
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY);
  const teacherId = data?.current_User?.id;
  const isTeacher = data?.current_User?.role === 'TEACHER';

  const { data: classesData, loading: loadingClasses } = useQuery(GET_CLASSES_QUERY, {
    skip: !teacherId,
  });

  const { data: scoresData, loading: loadingScores } = useQuery(GET_SCORES_QUERY, {
    skip: !teacherId,
  });

  const { data: attendanceData, loading: loadingAttendance } = useQuery(GET_ATTENDANCE_QUERY, {
    skip: !teacherId,
  });

  const { data: sentNotiData, loading: loadingSentNoti } = useQuery(GET_SENT_NOTIFICATIONS, { 
    skip: activeTab !== 'noti' 
  });

  // Mutations
  const [createClass, { loading: creatingClass }] = useMutation(CREATE_CLASS_MUTATION, {
    refetchQueries: [{ query: GET_CLASSES_QUERY }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setShowCreateClassModal(false);
      setCreateClassForm({ className: '', subject: '' });
    },
  });

  const [createAttendance, { loading: creatingAttendance }] = useMutation(CREATE_ATTENDANCE_MUTATION, {
    refetchQueries: [{ query: GET_ATTENDANCE_QUERY }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setAttendanceMsg('Điểm danh thành công!');
      setTimeout(() => setAttendanceMsg(''), 2000);
      setShowAttendanceModal(false);
    },
    onError: () => {
      setAttendanceMsg('Điểm danh thất bại!');
      setTimeout(() => setAttendanceMsg(''), 2000);
    }
  });

  const [updateAttendance, { loading: updatingAttendance }] = useMutation(UPDATE_ATTENDANCE_MUTATION, {
    refetchQueries: [{ query: GET_ATTENDANCE_QUERY }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setAttendanceMsg('Cập nhật điểm danh thành công!');
      setTimeout(() => setAttendanceMsg(''), 2000);
      setShowAttendanceModal(false);
    },
    onError: () => {
      setAttendanceMsg('Cập nhật điểm danh thất bại!');
      setTimeout(() => setAttendanceMsg(''), 2000);
    }
  });

  const [createNotification, { loading: sendingNoti }] = useMutation(CREATE_NOTIFICATION_MUTATION, {
    onCompleted: () => {
      setNotiMsg('Gửi thông báo thành công!');
      setTimeout(() => setNotiMsg(''), 2000);
      setShowSendNotiModal(false);
      setNotiTitle(''); 
      setNotiContent(''); 
      setNotiClassId('');
    },
    onError: () => {
      setNotiMsg('Gửi thông báo thất bại!');
      setTimeout(() => setNotiMsg(''), 2000);
    }
  });

  const [removeStudentFromClass] = useMutation(REMOVE_STUDENT_FROM_CLASS_MUTATION, {
    refetchQueries: [{ query: GET_CLASSES_QUERY }],
    awaitRefetchQueries: true,
  });

  // Memoized computations
  const myClasses = useMemo(() => {
    return (classesData?.getAllClasses || []).filter((c: Class) => 
      String(c.teacherId) === String(teacherId)
    );
  }, [classesData?.getAllClasses, teacherId]);

  const allStudents = useMemo(() => 
    myClasses.flatMap((c: Class) => c.studentIds || []),
    [myClasses]
  );

  const filteredScores = useMemo(() => {
    return (scoresData?.score?.filter((s: Score) => 
      myClasses.some((c: Class) => c.id === s.classId) && (
        s.subject.toLowerCase().includes(scoreSearch.toLowerCase()) ||
        s.classId.toLowerCase().includes(scoreSearch.toLowerCase())
      )
    ) || []);
  }, [scoresData?.score, myClasses, scoreSearch]);

  const filteredAttendance = useMemo(() => {
    return (attendanceData?.attendance?.filter((a: Attendance) => 
      myClasses.some((c: Class) => c.id === a.classId) &&
      a.classId.toLowerCase().includes(attendanceSearch.toLowerCase())
    ) || []);
  }, [attendanceData?.attendance, myClasses, attendanceSearch]);

  const pagedScores = useMemo(() => 
    filteredScores.slice((scorePage - 1) * pageSize, scorePage * pageSize),
    [filteredScores, scorePage]
  );

  const pagedAttendance = useMemo(() => 
    filteredAttendance.slice((attendancePage - 1) * pageSize, attendancePage * pageSize),
    [filteredAttendance, attendancePage]
  );

  // Callbacks
  const handleCreateClass = useCallback(async () => {
    if (!teacherId) {
      alert('Không tìm thấy thông tin giáo viên.');
      return;
    }
    if (!createClassForm.className.trim() || !createClassForm.subject.trim()) {
      alert('Vui lòng nhập đầy đủ tên lớp và môn học.');
      return;
    }
    try {
      await createClass({ 
        variables: { 
          createClassInput: { 
            className: createClassForm.className, 
            subject: createClassForm.subject, 
            teacherId 
          } 
        } 
      });
      setSuccessMsg('Tạo lớp thành công!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (e) {
      console.error('Lỗi khi tạo lớp:', e);
      alert('Có lỗi xảy ra khi tạo lớp.');
    }
  }, [teacherId, createClassForm, createClass]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Effects
  useEffect(() => {
    if (error || !isTeacher) {
      router.push('/login');
    }
  }, [data, error, router, isTeacher]);

  // Loading state
  if (loading || !isTeacher) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-lg text-gray-600">
        Loading teacher dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[var(--background)] to-[var(--pastel-blue)]">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1 relative">
        <HeaderBar 
          notifications={sentNotiData?.getSentNotifications || []} 
          onLogout={handleLogout} 
        />
        
        <main className="p-8 max-w-5xl mx-auto pt-20">
          {/* Tab content */}
        {activeTab === 'info' && (
          <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
            <h2 className="text-2xl font-semibold mb-4 text-green-800 font-sans flex items-center gap-2">
              👤 Thông tin cá nhân
            </h2>
            <div className="text-lg text-gray-800 mb-2">
              Tên: <b>{data.current_User?.username}</b>
            </div>
            <div className="text-lg text-gray-800 mb-2">
              Username: <b>{data.current_User?.username}</b>
            </div>
            <div className="text-lg text-gray-800 mb-2">
              Vai trò: <b>Giáo viên</b>
            </div>
          </div>
        )}

        {activeTab === 'class' && (
          <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-green-800 font-sans flex items-center gap-2">
                🏫 Lớp học của tôi
              </h2>
              <button
                onClick={() => setShowCreateClassModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition font-semibold"
              >
                + Tạo lớp mới
              </button>
            </div>
            
            {successMsg && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {successMsg}
              </div>
            )}
            
            {loadingClasses ? (
              <div>Đang tải lớp học...</div>
            ) : myClasses.length === 0 ? (
              <div className="text-gray-500">Bạn chưa có lớp học nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow font-sans">
                  <thead>
                    <tr className="bg-green-100 text-green-800 font-bold">
                      <th className="border px-3 py-2">Tên lớp</th>
                      <th className="border px-3 py-2">Môn học</th>
                      <th className="border px-3 py-2">Số học sinh</th>
                      <th className="border px-3 py-2">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myClasses.map((c: Class) => (
                      <tr key={c.id} className="hover:bg-green-50 transition text-gray-900 font-medium">
                        <td className="border px-3 py-2">{c.className}</td>
                        <td className="border px-3 py-2">{c.subject}</td>
                        <td className="border px-3 py-2">{c.studentIds?.length || 0}</td>
                        <td className="border px-3 py-2">
                          <button
                            onClick={() => {
                              setAttendanceClassId(c.id);
                              setShowAttendanceModal(true);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            Điểm danh
                          </button>
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
              📊 Điểm số
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
            </div>
            
            {loadingScores ? (
              <div className="flex flex-col items-center py-8 text-lg text-gray-500">
                <span className="text-4xl mb-2">⏳</span>Đang tải điểm...
              </div>
            ) : filteredScores.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-lg text-gray-500">
                <span className="text-4xl mb-2">📭</span>Không có dữ liệu điểm.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-lg mb-2 bg-white rounded-xl overflow-hidden shadow-lg">
                  <thead>
                    <tr className="bg-purple-100 text-purple-800 font-bold">
                      <th className="border px-4 py-3">Học sinh</th>
                      <th className="border px-4 py-3">Môn</th>
                      <th className="border px-4 py-3">Điểm</th>
                      <th className="border px-4 py-3">Lớp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedScores.map((s: Score) => (
                      <tr key={s.id} className="hover:bg-purple-50 transition text-gray-900 font-medium">
                        <td className="border px-4 py-2">
                          <StudentNameById studentId={s.studentId} />
                        </td>
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
                      <th className="border px-3 py-2">Số học sinh</th>
                      <th className="border px-3 py-2">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAttendance.map((a: Attendance) => {
                      const classInfo = myClasses.find((c: Class) => c.id === a.classId);
                      return (
                        <tr key={a.id} className="hover:bg-green-50 transition text-gray-900 font-medium">
                          <td className="border px-3 py-2">
                            {classInfo ? classInfo.className : a.classId}
                            <div className="text-xs text-gray-500">
                              {classInfo ? classInfo.subject : ''}
                            </div>
                          </td>
                          <td className="border px-3 py-2">{a.date?.slice(0, 10)}</td>
                          <td className="border px-3 py-2">{a.records?.length || 0}</td>
                          <td className="border px-3 py-2">
                            <button
                              onClick={() => {
                                setEditingAttendanceId(a.id);
                                setAttendanceClassId(a.classId);
                                setAttendanceDate(a.date?.slice(0, 10) || '');
                                setAttendanceRecords(a.records || []);
                                setShowAttendanceModal(true);
                              }}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              Sửa
                            </button>
                          </td>
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

        {activeTab === 'noti' && (
          <div className="mb-10 bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-yellow-800 font-sans flex items-center gap-2">
                📤 Lịch sử gửi thông báo
              </h2>
              <button
                onClick={() => setShowSendNotiModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition font-semibold"
              >
                + Gửi thông báo
              </button>
            </div>
            
            {notiMsg && (
              <div className={`mb-4 p-3 rounded-lg ${
                notiMsg.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {notiMsg}
              </div>
            )}
            
            {loadingSentNoti ? (
              <div>Đang tải thông báo...</div>
            ) : sentNotiData?.getSentNotifications?.length === 0 ? (
              <div className="text-gray-500">Chưa có thông báo nào.</div>
            ) : (
              <ul className="space-y-2">
                {sentNotiData.getSentNotifications.map((noti: Notification) => (
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

        {/* Modals */}
        {/* Create Class Modal */}
        {showCreateClassModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-xl font-bold mb-4">Tạo lớp mới</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tên lớp:</label>
                <input
                  type="text"
                  value={createClassForm.className}
                  onChange={(e) => setCreateClassForm(prev => ({ ...prev, className: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Môn học:</label>
                <input
                  type="text"
                  value={createClassForm.subject}
                  onChange={(e) => setCreateClassForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateClass}
                  disabled={creatingClass}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {creatingClass ? 'Đang tạo...' : 'Tạo lớp'}
                </button>
                <button
                  onClick={() => setShowCreateClassModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Modal */}
        {showAttendanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">
                {editingAttendanceId ? 'Sửa điểm danh' : 'Điểm danh'}
              </h3>
              
              {attendanceMsg && (
                <div className={`mb-4 p-3 rounded-lg ${
                  attendanceMsg.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {attendanceMsg}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Lớp:</label>
                <select
                  value={attendanceClassId}
                  onChange={(e) => setAttendanceClassId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Chọn lớp</option>
                  {myClasses.map((c: Class) => (
                    <option key={c.id} value={c.id}>{c.className} - {c.subject}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Ngày:</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              {attendanceClassId && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Học sinh:</label>
                  <div className="space-y-2">
                    {myClasses
                      .find((c: Class) => c.id === attendanceClassId)
                      ?.studentIds?.map((studentId: string) => (
                        <div key={studentId} className="flex items-center gap-2">
                          <StudentNameById studentId={studentId} />
                          <select
                            value={attendanceRecords.find(r => r.studentId === studentId)?.status || 'PRESENT'}
                            onChange={(e) => {
                              setAttendanceRecords(prev => {
                                const existing = prev.find(r => r.studentId === studentId);
                                if (existing) {
                                  return prev.map(r => r.studentId === studentId ? { ...r, status: e.target.value } : r);
                                } else {
                                  return [...prev, { studentId, status: e.target.value }];
                                }
                              });
                            }}
                            className="ml-auto border rounded px-2 py-1"
                          >
                            <option value="PRESENT">Có mặt</option>
                            <option value="ABSENT">Vắng</option>
                            <option value="LATE">Muộn</option>
                          </select>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!attendanceClassId || !attendanceDate) {
                      alert('Vui lòng chọn lớp và ngày.');
                      return;
                    }
                    
                    const input = {
                      classId: attendanceClassId,
                      date: attendanceDate,
                      records: attendanceRecords
                    };
                    
                    if (editingAttendanceId) {
                      await updateAttendance({ variables: { updateAttendanceInput: { id: editingAttendanceId, ...input } } });
                    } else {
                      await createAttendance({ variables: { input } });
                    }
                  }}
                  disabled={creatingAttendance || updatingAttendance}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {creatingAttendance || updatingAttendance ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  onClick={() => {
                    setShowAttendanceModal(false);
                    setEditingAttendanceId(null);
                    setAttendanceRecords([]);
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Notification Modal */}
        {showSendNotiModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-xl font-bold mb-4">Gửi thông báo</h3>
              
              {notiMsg && (
                <div className={`mb-4 p-3 rounded-lg ${
                  notiMsg.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {notiMsg}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Lớp:</label>
                <select
                  value={notiClassId}
                  onChange={(e) => setNotiClassId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Chọn lớp</option>
                  {myClasses.map((c: Class) => (
                    <option key={c.id} value={c.id}>{c.className} - {c.subject}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nội dung:</label>
                <textarea
                  value={notiContent}
                  onChange={(e) => setNotiContent(e.target.value)}
                  className="w-full border rounded px-3 py-2 h-24"
                  placeholder="Nhập nội dung thông báo..."
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!notiClassId || !notiContent.trim()) {
                      alert('Vui lòng chọn lớp và nhập nội dung.');
                      return;
                    }
                    
                    await createNotification({
                      variables: {
                        input: {
                          message: notiContent,
                          recipients: [notiClassId]
                        }
                      }
                    });
                  }}
                  disabled={sendingNoti}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {sendingNoti ? 'Đang gửi...' : 'Gửi'}
                </button>
                <button
                  onClick={() => setShowSendNotiModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
