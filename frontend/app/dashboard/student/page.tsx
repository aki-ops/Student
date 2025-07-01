'use client';

import { useQuery } from '@apollo/client';
import { CURRENT_USER_QUERY, GET_SCORES_QUERY, GET_ATTENDANCE_QUERY, GET_USERS_QUERY, GET_MY_CLASSES_QUERY, FIND_USER_BY_ID_QUERY, GET_MY_NOTIFICATION } from '@/graphql/queries';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StudentDashboard() {
  const router = useRouter();
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY);
  const { data: usersData } = useQuery(GET_USERS_QUERY);
  const { data: notificationData, loading: loadingNotifications, error: errorNotifications } = useQuery(GET_MY_NOTIFICATION);

  // Lấy username hiện tại
  const username = data?.current_User?.username;
  // Tìm user đầy đủ theo username
  const currentUserInfo = usersData?.findAllUsers?.find((u: any) => u.username === username);

  // Lấy điểm và điểm danh của chính học sinh này
  const studentId = currentUserInfo?.id;
  const { data: scoresData, loading: loadingScores } = useQuery(GET_SCORES_QUERY, {
    variables: { studentId },
    skip: !studentId,
  });
  const { data: attendanceData, loading: loadingAttendance } = useQuery(GET_ATTENDANCE_QUERY, {
    variables: { studentId },
    skip: !studentId,
  });
  
  // Lấy danh sách lớp học của học sinh này
  const { data: classesData, loading: loadingClasses } = useQuery(GET_MY_CLASSES_QUERY, {
    skip: !studentId,
  });

  // State for search/filter and pagination
  const [scoreSearch, setScoreSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [scorePage, setScorePage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const pageSize = 10;

  // Filtered and paginated scores
  const filteredScores = (scoresData?.score?.filter((s:any)=>s.studentId===studentId && (
    s.subject.toLowerCase().includes(scoreSearch.toLowerCase()) ||
    s.classId.toLowerCase().includes(scoreSearch.toLowerCase())
  )) || []);
  const pagedScores = filteredScores.slice((scorePage-1)*pageSize, scorePage*pageSize);

  // Filtered and paginated attendance
  const filteredAttendance = (attendanceData?.attendance?.flatMap((a:any) =>
    a.records?.filter((r:any)=>r.studentId===studentId && (
      a.classId.toLowerCase().includes(attendanceSearch.toLowerCase())
    )).map((r:any) => ({...r, classId: a.classId, date: a.date})) || []
  ) || []);
  const pagedAttendance = filteredAttendance.slice((attendancePage-1)*pageSize, attendancePage*pageSize);

  // Summary: average score, attendance rate
  const avgScore = filteredScores.length ? (filteredScores.reduce((sum:any, s:any)=>sum+s.score,0)/filteredScores.length).toFixed(2) : '-';
  const attendancePresent = filteredAttendance.filter((r:any)=>r.status==='PRESENT').length;
  const attendanceTotal = filteredAttendance.length;
  const attendanceRate = attendanceTotal ? Math.round(attendancePresent/attendanceTotal*100) : 0;
  
  // Lấy các lớp mà học sinh này tham gia (đã được lọc từ backend)
  const myClasses = classesData?.getMyClasses || [];

  useEffect(() => {
    if (error || data?.current_User?.role !== 'STUDENT') {
      // Không phải học sinh → redirect về login
      router.push('/login');
    }
  }, [data, error, router]);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh] text-lg text-gray-600">Loading student dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-green-50 via-white to-blue-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800 drop-shadow font-sans">🎓 Student Dashboard</h1>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition text-base font-semibold font-sans"
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
        >Đăng xuất</button>
      </div>
      
      {/* NOTIFICATIONS SECTION */}
      <div className="mb-10 bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-800 font-sans">🔔 Thông báo của bạn</h2>
        {loadingNotifications ? (
          <div>Đang tải thông báo...</div>
        ) : errorNotifications ? (
          <div className="text-red-500">Lỗi khi tải thông báo: {errorNotifications.message}</div>
        ) : notificationData?.getMyNotifications?.length === 0 ? (
          <div className="text-gray-500">Không có thông báo nào.</div>
        ) : (
          <ul className="space-y-2">
            {notificationData.getMyNotifications.map((noti: any) => (
              <li key={noti._id} className="bg-white rounded-lg shadow p-4 border border-yellow-100">
                <div className="font-medium text-gray-900 mb-1">{noti.message}</div>
                <div className="text-xs text-gray-500 mb-1">Người gửi: {noti.sender}</div>
                <div className="text-xs text-gray-500 mb-1">Lớp nhận: {Array.isArray(noti.recipients) ? noti.recipients.join(', ') : noti.recipients}</div>
                <div className="text-xs text-gray-500">Thời gian: {new Date(noti.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* CLASSES SECTION */}
      <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
        <h2 className="text-2xl font-semibold mb-4 text-green-800 font-sans">🏫 Lớp học của tôi</h2>
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
                {myClasses.map((c: any) => (
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
      <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
        <h2 className="text-2xl font-semibold mb-4 text-green-800 font-sans">📊 Điểm số của bạn</h2>
        <div className="flex items-center gap-4 mb-4">
          <label className="block text-base font-bold mb-1 text-gray-900">Tìm kiếm theo môn hoặc lớp...</label>
          <input
            className="border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2"
            placeholder="Tìm kiếm theo môn hoặc lớp..."
            value={scoreSearch}
            onChange={e=>{setScoreSearch(e.target.value); setScorePage(1);}}
          />
          <span className="text-gray-600 text-base">Trung bình: <b>{avgScore}</b></span>
        </div>
        {loadingScores ? (
          <div>Đang tải điểm...</div>
        ) : scoresData?.score?.length === 0 ? (
          <div className="text-gray-500">Không có dữ liệu điểm.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-base mb-2 bg-white rounded-xl overflow-hidden shadow font-sans">
              <thead>
                <tr className="bg-green-100 text-green-800 font-bold">
                  <th className="border px-3 py-2">Môn</th>
                  <th className="border px-3 py-2">Điểm</th>
                  <th className="border px-3 py-2">Lớp</th>
                </tr>
              </thead>
              <tbody>
                {pagedScores.map((s:any) => (
                  <tr key={s.id} className="hover:bg-green-50 transition text-gray-900 font-medium">
                    <td className="border px-3 py-2">{s.subject}</td>
                    <td className="border px-3 py-2">{s.score}</td>
                    <td className="border px-3 py-2">{s.classId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination for scores */}
        <div className="flex gap-2 items-center mb-4">
          <button disabled={scorePage===1} onClick={()=>setScorePage(p=>p-1)} className="px-3 py-1 border rounded disabled:opacity-50 bg-green-100 hover:bg-green-200">Trước</button>
          <span className="text-base">Trang {scorePage} / {Math.ceil(filteredScores.length/pageSize)||1}</span>
          <button disabled={scorePage*pageSize>=filteredScores.length} onClick={()=>setScorePage(p=>p+1)} className="px-3 py-1 border rounded disabled:opacity-50 bg-green-100 hover:bg-green-200">Sau</button>
        </div>
      </div>
      <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
        <h2 className="text-2xl font-semibold mb-4 text-green-800 font-sans">📝 Lịch sử điểm danh</h2>
        <div className="flex items-center gap-4 mb-4">
          <label className="block text-base font-bold mb-1 text-gray-900">Tìm kiếm theo lớp...</label>
          <input
            className="border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2"
            placeholder="Tìm kiếm theo lớp..."
            value={attendanceSearch}
            onChange={e=>{setAttendanceSearch(e.target.value); setAttendancePage(1);}}
          />
          <span className="text-gray-600 text-base">Tỉ lệ có mặt: <b>{attendanceRate}%</b></span>
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
                {pagedAttendance.map((r:any, idx:number) => {
                  // Tìm thông tin lớp tương ứng
                  const classInfo = myClasses.find((c:any) => c.id === r.classId);
                  return (
                    <tr key={r.classId+':'+r.date+':'+r.studentId+':'+idx} className="hover:bg-green-50 transition text-gray-900 font-medium">
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
                      <td className="border px-3 py-2">{r.date?.slice(0,10)}</td>
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
          <button disabled={attendancePage===1} onClick={()=>setAttendancePage(p=>p-1)} className="px-3 py-1 border rounded disabled:opacity-50 bg-green-100 hover:bg-green-200">Trước</button>
          <span className="text-base">Trang {attendancePage} / {Math.ceil(filteredAttendance.length/pageSize)||1}</span>
          <button disabled={attendancePage*pageSize>=filteredAttendance.length} onClick={()=>setAttendancePage(p=>p+1)} className="px-3 py-1 border rounded disabled:opacity-50 bg-green-100 hover:bg-green-200">Sau</button>
        </div>
      </div>
    </div>
  );
}

// Thêm component phụ để lấy tên giáo viên theo id
function TeacherNameById({ teacherId }: { teacherId: string }) {
  const { data, loading, error } = useQuery(FIND_USER_BY_ID_QUERY, { variables: { id: teacherId } });
  if (loading) return <span>Đang tải...</span>;
  if (error || !data?.findById) return <span>Chưa có giáo viên</span>;
  return <span>{data.findById.fullName || data.findById.username}</span>;
}
