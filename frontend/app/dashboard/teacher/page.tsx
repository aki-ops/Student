'use client';

import { useQuery, useMutation } from '@apollo/client';
import { CURRENT_USER_QUERY, GET_CLASSES_QUERY, GET_SCORES_QUERY, GET_ATTENDANCE_QUERY, GET_USERS_QUERY, FIND_USER_BY_ID_QUERY, GET_SENT_NOTIFICATIONS } from '@/graphql/queries';
import { CREATE_CLASS_MUTATION, CREATE_ATTENDANCE_MUTATION, UPDATE_ATTENDANCE_MUTATION, CREATE_NOTIFICATION_MUTATION, REMOVE_STUDENT_FROM_CLASS_MUTATION } from '@/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

function HeaderBar({ onTab, activeTab, onLogout }: { onTab: (tab: string) => void, activeTab: string, onLogout: () => void }) {
  return (
    <div className="flex gap-2 items-center">
      <button
        className="relative group p-1"
        title="Thông báo"
        onClick={() => onTab('noti')}
      >
        <BellIcon className={`w-7 h-7 ${activeTab==='noti' ? 'text-yellow-500' : 'text-gray-500 group-hover:text-yellow-600'}`} />
      </button>
      <button
        className="relative group p-1"
        title="Thông tin cá nhân"
        onClick={() => onTab('info')}
      >
        <UserCircleIcon className={`w-7 h-7 ${activeTab==='info' ? 'text-green-600' : 'text-gray-500 group-hover:text-green-700'}`} />
      </button>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition text-base font-semibold font-sans"
        onClick={onLogout}
      >Đăng xuất</button>
    </div>
  );
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY);

  // All hooks must be called unconditionally and at the top
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [createClassForm, setCreateClassForm] = useState({ className: '', subject: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [scoreSearch, setScoreSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [scorePage, setScorePage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const pageSize = 10;

  // Tab state
  const [activeTab, setActiveTab] = useState<'info'|'class'|'score'|'attendance'|'noti'>('info');

  const teacherId = data?.current_User?.id;

  const { data: classesData, loading: loadingClasses } = useQuery(GET_CLASSES_QUERY, {
    skip: !teacherId,
  });
  const { data: scoresData, loading: loadingScores } = useQuery(GET_SCORES_QUERY, {
    skip: !teacherId,
  });
  const { data: attendanceData, loading: loadingAttendance } = useQuery(GET_ATTENDANCE_QUERY, {
    skip: !teacherId,
  });
  const [createClass, { loading: creatingClass, error: createClassError }] = useMutation(CREATE_CLASS_MUTATION, {
    refetchQueries: [{ query: GET_CLASSES_QUERY }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setShowCreateClassModal(false);
      setCreateClassForm({ className: '', subject: '' });
    },
  });

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendanceClassId, setAttendanceClassId] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceMsg, setAttendanceMsg] = useState('');
  const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null);
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

  const [showSendNotiModal, setShowSendNotiModal] = useState(false);
  const [notiTitle, setNotiTitle] = useState('');
  const [notiContent, setNotiContent] = useState('');
  const [notiClassId, setNotiClassId] = useState<string>('');
  const [notiMsg, setNotiMsg] = useState('');
  const [createNotification, { loading: sendingNoti }] = useMutation(CREATE_NOTIFICATION_MUTATION, {
    onCompleted: () => {
      setNotiMsg('Gửi thông báo thành công!');
      setTimeout(() => setNotiMsg(''), 2000);
      setShowSendNotiModal(false);
      setNotiTitle(''); setNotiContent(''); setNotiClassId('');
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

  const { data: sentNotiData, loading: loadingSentNoti, error: errorSentNoti } = useQuery(GET_SENT_NOTIFICATIONS, { skip: activeTab !== 'noti' });

  // Handler for creating class
  const handleCreateClass = async () => {
    if (!teacherId) {
      alert('Không tìm thấy thông tin giáo viên.');
      return;
    }
    if (!createClassForm.className.trim() || !createClassForm.subject.trim()) {
      alert('Vui lòng nhập đầy đủ tên lớp và môn học.');
      return;
    }
    try {
      await createClass({ variables: { createClassInput: { className: createClassForm.className, subject: createClassForm.subject, teacherId } } });
      setSuccessMsg('Tạo lớp thành công!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (e) {
      console.error('Lỗi khi tạo lớp:', e);
      alert('Có lỗi xảy ra khi tạo lớp.');
    }
  };

  useEffect(() => {
    if (error || data?.current_User?.role !== 'TEACHER') {
      router.push('/login');
    }
  }, [data, error, router]);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh] text-lg text-gray-600">Loading teacher dashboard...</div>;

  // Lọc các lớp mà giáo viên này phụ trách (so sánh teacherId dạng string)
  const myClasses = (classesData?.getAllClasses || []).filter((c: any) => {
    return String(c.teacherId) === String(teacherId);
  });
  // Lấy danh sách học sinh trong các lớp
  const allStudents = myClasses.flatMap((c: any) => c.studentIds || []);

  // Filtered and paginated scores (for classes managed by teacher)
  const filteredScores = (scoresData?.score?.filter((s: any) =>
    myClasses.some((c: any) => c.id === s.classId) && (
      s.subject.toLowerCase().includes(scoreSearch.toLowerCase()) ||
      s.classId.toLowerCase().includes(scoreSearch.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(scoreSearch.toLowerCase()))
    )
  ) || []);
  const pagedScores = filteredScores.slice((scorePage - 1) * pageSize, scorePage * pageSize);

  // Filtered and paginated attendance (for classes managed by teacher)
  const filteredAttendance = (attendanceData?.attendance?.filter((a: any) =>
    myClasses.some((c: any) => c.id === a.classId) && (
      a.classId.toLowerCase().includes(attendanceSearch.toLowerCase())
    )
  ) || []);
  const pagedAttendance = filteredAttendance.slice((attendancePage - 1) * pageSize, attendancePage * pageSize);

  // Summary: average score for all classes managed by teacher
  const avgScore = filteredScores.length ? (filteredScores.reduce((sum: any, s: any) => sum + s.score, 0) / filteredScores.length).toFixed(2) : '-';

  // Lấy thông tin giáo viên hiện tại
  const currentUserInfo = data?.current_User;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-green-50 via-white to-blue-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800 drop-shadow font-sans">👨‍🏫 Teacher Dashboard</h1>
        <HeaderBar onTab={tab => setActiveTab(tab as typeof activeTab)} activeTab={activeTab} onLogout={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} />
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button onClick={()=>setActiveTab('info')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab==='info' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}>Thông tin</button>
        <button onClick={()=>setActiveTab('class')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab==='class' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>Lớp học</button>
        <button onClick={()=>setActiveTab('score')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab==='score' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'}`}>Điểm số</button>
        <button onClick={()=>setActiveTab('attendance')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab==='attendance' ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-800'}`}>Điểm danh</button>
        <button onClick={()=>setActiveTab('noti')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab==='noti' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800'}`}>Thông báo</button>
      </div>
      {/* Tab content */}
      {activeTab==='info' && (
        <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
          <h2 className="text-2xl font-semibold mb-4 text-green-800 font-sans flex items-center gap-2">👤 Thông tin cá nhân</h2>
          <div className="text-lg text-gray-800 mb-2">Tên: <b>{currentUserInfo?.fullName || currentUserInfo?.username}</b></div>
          <div className="text-lg text-gray-800 mb-2">Username: <b>{currentUserInfo?.username}</b></div>
          <div className="text-lg text-gray-800 mb-2">Vai trò: <b>Giáo viên</b></div>
        </div>
      )}
      {activeTab==='class' && (
        <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-green-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
            <h2 className="font-semibold text-2xl text-green-800 font-sans flex items-center gap-2">🏫 Lớp học của tôi</h2>
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-base font-semibold font-sans"
            >+ Tạo lớp mới</button>
          </div>
          {/* Modal tạo lớp mới */}
          {showCreateClassModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] border border-green-200">
                <h3 className="font-semibold text-xl mb-4 text-green-700 font-sans">Tạo lớp mới</h3>
                <div className="mb-3">
                  <label className="block text-base font-bold mb-1 text-gray-900">Tên lớp</label>
                  <input
                    className="border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2 w-full"
                    value={createClassForm.className}
                    onChange={e => setCreateClassForm(f => ({ ...f, className: e.target.value }))}
                    placeholder="Nhập tên lớp"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-base font-bold mb-1 text-gray-900">Môn học</label>
                  <input
                    className="border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2 w-full"
                    value={createClassForm.subject}
                    onChange={e => setCreateClassForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Nhập môn học"
                  />
                </div>
                {createClassError && <div className="text-red-500 text-sm mb-2">Tạo lớp thất bại</div>}
                {successMsg && <div className="text-green-600 text-sm mb-2">{successMsg}</div>}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowCreateClassModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
                  <button
                    onClick={handleCreateClass}
                    disabled={creatingClass || !createClassForm.className.trim() || !createClassForm.subject.trim() || !teacherId}
                    className={`px-4 py-2 rounded transition font-semibold 
                      ${creatingClass || !createClassForm.className.trim() || !createClassForm.subject.trim() || !teacherId
                        ? 'bg-green-300 text-white opacity-60 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'}`}
                  >
                    {creatingClass ? 'Đang tạo...' : 'Tạo'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {loadingClasses ? (
            <div>Đang tải lớp...</div>
          ) : (
            <ul className="list-disc pl-6 text-base text-gray-700">
              {/* Hiển thị danh sách lớp: teacherId là string hoặc object (tương thích cả 2) */}
              {myClasses.map((c: any) => (
                <li key={c.id} className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-green-700">{c.className}</span>
                  <span className="text-gray-500"> - Môn: </span>
                  <span className="text-blue-700">{c.subject}</span>
                  <span className="text-gray-500"> - Giáo viên: </span>
                  {c.teacher ? (
                    <span className="text-blue-700">{c.teacher.fullName || c.teacher.username}</span>
                  ) : c.teacherId ? (
                    <TeacherNameById teacherId={c.teacherId} />
                  ) : (
                    <span className="text-blue-700">Chưa có giáo viên</span>
                  )}
                  <button
                    className="ml-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    onClick={() => {
                      setAttendanceClassId(c.id);
                      setAttendanceDate(new Date().toISOString().slice(0, 10));
                      setEditingAttendanceId(null);
                      const found = attendanceData?.attendance?.find((a: any) => a.classId === c.id && a.date?.slice(0, 10) === new Date().toISOString().slice(0, 10));
                      if (found) {
                        setAttendanceRecords(found.records.map((r: any) => ({ studentId: r.studentId, status: r.status })));
                        setEditingAttendanceId(found.id);
                      } else {
                        setAttendanceRecords((c.studentIds || []).map((sid: string) => ({ studentId: sid, status: 'PRESENT' })));
                      }
                      setShowAttendanceModal(true);
                    }}
                  >Điểm danh</button>
                  <ul className="ml-4">
                    {c.studentIds.map((sid: string) => (
                      <li key={sid} className="flex items-center gap-2">
                        <StudentNameById studentId={sid} />
                        <button
                          className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                          onClick={async () => {
                            if (window.confirm('Bạn có chắc muốn xóa học sinh này khỏi lớp?')) {
                              await removeStudentFromClass({ variables: { classId: c.id, studentId: sid } });
                            }
                          }}
                        >Xóa</button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {activeTab==='score' && (
        <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
          <h2 className="text-2xl font-semibold mb-4 text-purple-800 font-sans flex items-center gap-2">📊 Điểm số của bạn</h2>
          <div className="flex items-center gap-4 mb-4">
            <label className="block text-base font-bold mb-1 text-gray-900">Tìm kiếm theo môn, lớp hoặc học sinh...</label>
            <input
              className="border-2 border-purple-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-purple-400 outline-none mb-2"
              placeholder="Tìm kiếm theo môn, lớp hoặc học sinh..."
              value={scoreSearch}
              onChange={e => { setScoreSearch(e.target.value); setScorePage(1); }}
            />
            <span className="text-gray-600 text-base">Trung bình: <b className="text-purple-700">{avgScore}</b></span>
          </div>
          {loadingScores ? (
            <div className="flex flex-col items-center py-8 text-lg text-gray-500"><span className="text-4xl mb-2">⏳</span>Đang tải điểm...</div>
          ) : filteredScores.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-lg text-gray-500"><span className="text-4xl mb-2">📭</span>Không có dữ liệu điểm.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-lg mb-2 bg-white rounded-xl overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-purple-100 text-purple-800 font-bold">
                    <th className="border px-4 py-3">Học sinh</th>
                    <th className="border px-4 py-3">Lớp</th>
                    <th className="border px-4 py-3">Môn</th>
                    <th className="border px-4 py-3">Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedScores.map((s: any) => (
                    <tr key={s.id} className="hover:bg-purple-50 transition text-gray-900 font-medium">
                      <td className="border px-4 py-2">{s.studentId}</td>
                      <td className="border px-4 py-2">{s.classId}</td>
                      <td className="border px-4 py-2">{s.subject}</td>
                      <td className="border px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded font-bold ${s.score >= 8 ? 'bg-green-100 text-green-700' : s.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{s.score}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination for scores */}
          <div className="flex gap-2 items-center mb-4 mt-4">
            <button disabled={scorePage===1} onClick={()=>setScorePage(p=>p-1)} className="px-3 py-1 border rounded disabled:opacity-50 bg-purple-100 hover:bg-purple-200">Trước</button>
            <span className="text-base">Trang {scorePage} / {Math.ceil(filteredScores.length/pageSize)||1}</span>
            <button disabled={scorePage*pageSize>=filteredScores.length} onClick={()=>setScorePage(p=>p+1)} className="px-3 py-1 border rounded disabled:opacity-50 bg-purple-100 hover:bg-purple-200">Sau</button>
          </div>
        </div>
      )}
      {activeTab==='attendance' && (
        <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-green-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
            <h2 className="font-semibold text-2xl text-green-800 font-sans flex items-center gap-2">📝 Quản lý điểm danh</h2>
            <div className="flex items-center gap-4">
              <input
                className="border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2"
                placeholder="Tìm kiếm theo lớp..."
                value={attendanceSearch}
                onChange={e => { setAttendanceSearch(e.target.value); setAttendancePage(1); }}
              />
            </div>
          </div>
          {loadingAttendance ? (
            <div>Đang tải điểm danh...</div>
          ) : pagedAttendance.length === 0 ? (
            <div className="text-gray-500">Không có dữ liệu điểm danh.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow font-sans">
                  <thead>
                    <tr className="bg-green-100 text-green-800 font-bold">
                      <th className="border px-3 py-2">Lớp</th>
                      <th className="border px-3 py-2">Ngày</th>
                      <th className="border px-3 py-2">Bản ghi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAttendance.map((a: any) => {
                      // Tìm thông tin lớp tương ứng
                      const classInfo = myClasses.find((c: any) => c.id === a.classId);
                      return (
                        <tr key={a.id} className="hover:bg-green-50 transition text-gray-900 font-medium">
                          <td className="border px-3 py-2">
                            {classInfo ? classInfo.className : a.classId}
                            <div className="text-xs text-gray-500">{classInfo ? classInfo.subject : ''}</div>
                          </td>
                          <td className="border px-3 py-2">{a.date?.slice(0, 10)}</td>
                          <td className="border px-3 py-2">
                            {a.records?.map((r: any, idx: number) => (
                              <span key={r.studentId+':'+idx} className="inline-block mr-2">
                                <StudentNameById studentId={r.studentId} />: {r.status}
                              </span>
                            ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination for attendance */}
              <div className="flex gap-2 items-center mb-2">
                <button disabled={attendancePage === 1} onClick={() => setAttendancePage(p => p - 1)} className="px-3 py-1 border rounded-lg bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 transition">Trước</button>
                <span className="text-base">Trang {attendancePage} / {Math.ceil(filteredAttendance.length / pageSize) || 1}</span>
                <button disabled={attendancePage * pageSize >= filteredAttendance.length} onClick={() => setAttendancePage(p => p + 1)} className="px-3 py-1 border rounded-lg bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 transition">Sau</button>
              </div>
            </>
          )}
        </div>
      )}
      {activeTab==='noti' && (
        <div className="mb-10 bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200 text-gray-600">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-800 font-sans">📤 Lịch sử gửi thông báo</h2>
          {loadingSentNoti ? (
            <div>Đang tải...</div>
          ) : errorSentNoti ? (
            <div className="text-red-500">Lỗi khi tải: {errorSentNoti.message}</div>
          ) : sentNotiData?.getSentNotifications?.length === 0 ? (
            <div>Chưa có thông báo nào bạn đã gửi.</div>
          ) : (
            <ul className="space-y-2">
              {sentNotiData.getSentNotifications.map((noti: any) => (
                <li key={noti.id} className="bg-white rounded-lg shadow p-4 border border-yellow-100">
                  <div className="font-medium text-gray-900 mb-1">{noti.message}</div>
                  <div className="text-xs text-gray-500 mb-1">Lớp nhận: {noti.className || (Array.isArray(noti.recipients) ? noti.recipients.join(', ') : noti.recipients)}</div>
                  <div className="text-xs text-gray-500 mb-1">Giáo viên: {noti.teacherName || '---'}</div>
                  <div className="text-xs text-gray-500">Thời gian: {new Date(noti.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* Modal điểm danh mới */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[400px] border border-green-200">
            <h3 className="font-semibold text-xl mb-4 text-green-700 font-sans">Điểm danh</h3>
            <div className="mb-3">
              <label className="block text-base font-bold mb-1 text-gray-900">Ngày</label>
              <input
                type="date"
                className="border-2 border-green-400 rounded-lg p-2 text-base w-full text-gray-900 font-medium"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block text-base font-bold mb-1 text-gray-900">Chọn lớp</label>
              <select
                className="border-2 border-green-400 rounded-lg p-2 text-base w-full text-gray-900 font-medium"
                value={attendanceClassId}
                onChange={e => {
                  setAttendanceClassId(e.target.value);
                  setEditingAttendanceId(null);
                  // Khi chọn lớp, kiểm tra đã có attendance chưa
                  const found = attendanceData?.attendance?.find((a: any) => a.classId === e.target.value && a.date?.slice(0, 10) === attendanceDate);
                  if (found) {
                    setAttendanceRecords(found.records.map((r: any) => ({ studentId: r.studentId, status: r.status })));
                    setEditingAttendanceId(found.id);
                  } else {
                    const cls = myClasses.find((c: any) => c.id === e.target.value);
                    setAttendanceRecords((cls?.studentIds || []).map((sid: string) => ({ studentId: sid, status: 'PRESENT' })));
                  }
                }}
              >
                <option value="">-- Chọn lớp --</option>
                {myClasses.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.className} - {c.subject}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-base font-bold mb-1 text-gray-900">Danh sách học sinh</label>
              <div className="max-h-60 overflow-y-auto">
                {attendanceClassId && attendanceRecords.length > 0 ? (
                  attendanceRecords.map((rec: any, idx: number) => (
                    <div key={rec.studentId} className="flex items-center gap-2 mb-2">
                      <span className="w-36 font-medium"><StudentNameById studentId={rec.studentId} /></span>
                      <select
                        className="border rounded p-1 text-gray-900 font-medium"
                        value={attendanceRecords[idx]?.status || 'PRESENT'}
                        onChange={e => {
                          const newRecords = [...attendanceRecords];
                          newRecords[idx] = { ...newRecords[idx], status: e.target.value };
                          setAttendanceRecords(newRecords);
                        }}
                      >
                        <option value="PRESENT">Có mặt</option>
                        <option value="ABSENT">Vắng</option>
                      </select>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">Chọn lớp để xem danh sách học sinh</div>
                )}
              </div>
            </div>
            {attendanceMsg && <div className="text-green-600 text-sm mb-2">{attendanceMsg}</div>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAttendanceModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
              <button
                onClick={async () => {
                  if (!attendanceClassId) return;
                  if (editingAttendanceId) {
                    await updateAttendance({
                      variables: {
                        updateAttendanceInput: {
                          id: editingAttendanceId,
                          classId: attendanceClassId,
                          date: attendanceDate,
                          records: attendanceRecords
                        }
                      }
                    });
                  } else {
                    await createAttendance({
                      variables: {
                        input: {
                          classId: attendanceClassId,
                          date: attendanceDate,
                          records: attendanceRecords
                        }
                      }
                    });
                  }
                }}
                disabled={creatingAttendance || updatingAttendance || !attendanceClassId || !attendanceRecords.length}
                className={`px-4 py-2 rounded transition font-semibold 
                  ${(creatingAttendance || updatingAttendance || !attendanceClassId || !attendanceRecords.length)
                    ? 'bg-green-300 text-white opacity-60 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'}`}
              >{editingAttendanceId ? (updatingAttendance ? 'Đang lưu...' : 'Cập nhật điểm danh') : (creatingAttendance ? 'Đang lưu...' : 'Lưu điểm danh')}</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal gửi thông báo */}
      {showSendNotiModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[400px] border border-blue-200">
            <h3 className="font-semibold text-xl mb-4 text-blue-700 font-sans">Gửi thông báo</h3>
            <div className="mb-3">
              <label className="block text-base font-bold mb-1 text-gray-900">Chọn lớp nhận thông báo</label>
              <select
                className="border-2 border-blue-400 rounded-lg p-2 text-base w-full text-gray-900 font-medium"
                value={notiClassId}
                onChange={e => setNotiClassId(e.target.value)}
              >
                <option value="">-- Chọn lớp --</option>
                {myClasses.map((c:any) => (
                  <option key={c.id} value={c.id}>{c.className} - {c.subject}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-base font-bold mb-1 text-gray-900">Tiêu đề</label>
              <input
                className="border-2 border-blue-400 rounded-lg p-2 text-base w-full text-gray-900 font-medium"
                value={notiTitle}
                onChange={e => setNotiTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo"
              />
            </div>
            <div className="mb-4">
              <label className="block text-base font-bold mb-1 text-gray-900">Nội dung</label>
              <textarea
                className="border-2 border-blue-400 rounded-lg p-2 text-base w-full text-gray-900 font-medium"
                value={notiContent}
                onChange={e => setNotiContent(e.target.value)}
                placeholder="Nhập nội dung thông báo"
                rows={4}
              />
            </div>
            {notiMsg && <div className="text-green-600 text-sm mb-2">{notiMsg}</div>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSendNotiModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
              <button
                onClick={async () => {
                  await createNotification({
                    variables: {
                      input: {
                        message: notiContent,
                        recipients: [notiClassId]
                      }
                    }
                  });
                }}
                disabled={sendingNoti || !notiTitle.trim() || !notiContent.trim() || !notiClassId}
                className={`px-4 py-2 rounded transition font-semibold 
                  ${sendingNoti || !notiTitle.trim() || !notiContent.trim() || !notiClassId
                    ? 'bg-blue-300 text-white opacity-60 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >{sendingNoti ? 'Đang gửi...' : 'Gửi'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Thêm component phụ để lấy tên giáo viên theo id
function TeacherNameById({ teacherId }: { teacherId: string }) {
  const { data, loading, error } = useQuery(FIND_USER_BY_ID_QUERY, { variables: { id: teacherId } });
  if (loading) return <span className="text-blue-700">Đang tải...</span>;
  if (error || !data?.findById) return <span className="text-blue-700">Chưa có giáo viên</span>;
  return <span className="text-blue-700">{data.findById.fullName || data.findById.username}</span>;
}

// Thêm component phụ để lấy tên học sinh theo id
function StudentNameById({ studentId }: { studentId: string }) {
  const { data, loading, error } = useQuery(FIND_USER_BY_ID_QUERY, { variables: { id: studentId } });
  if (loading) return <span>Đang tải...</span>;
  if (error || !data?.findById) return <span>Unknown</span>;
  return <span>{data.findById.fullName || data.findById.username}</span>;
}
