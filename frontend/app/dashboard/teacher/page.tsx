'use client';

import { useQuery, useMutation } from '@apollo/client';
import { CURRENT_USER_QUERY, GET_CLASSES_QUERY, GET_SCORES_QUERY, GET_ATTENDANCE_QUERY, GET_USERS_QUERY } from '@/graphql/queries';
import { CREATE_CLASS_MUTATION } from '@/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TeacherDashboard() {
  const router = useRouter();
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY);
  const { data: usersData } = useQuery(GET_USERS_QUERY);

  // All hooks must be called unconditionally and at the top
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [createClassForm, setCreateClassForm] = useState({ className: '', subject: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [scoreSearch, setScoreSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [scorePage, setScorePage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const pageSize = 10;

  // Lấy username hiện tại
  const username = data?.current_User?.username;
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
      console.log('Gọi mutation tạo lớp với:', {
        className: createClassForm.className,
        subject: createClassForm.subject,
        teacherId,
      });
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

  // DEBUG: Log teacherId, form values, and loading state
  console.log('DEBUG teacherId:', teacherId, 'className:', createClassForm.className, 'subject:', createClassForm.subject, 'creatingClass:', creatingClass);

  // Lọc các lớp mà giáo viên này phụ trách
  const myClasses = classesData?.class?.filter((c:any) => c.teacherId === teacherId) || [];
  // Lấy danh sách học sinh trong các lớp
  const allStudents = myClasses.flatMap((c:any) => c.studentIds || []);

  // Filtered and paginated scores (for classes managed by teacher)
  const filteredScores = (scoresData?.score?.filter((s:any) =>
    myClasses.some((c:any) => c.id === s.classId) && (
      s.subject.toLowerCase().includes(scoreSearch.toLowerCase()) ||
      s.classId.toLowerCase().includes(scoreSearch.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(scoreSearch.toLowerCase()))
    )
  ) || []);
  const pagedScores = filteredScores.slice((scorePage-1)*pageSize, scorePage*pageSize);

  // Filtered and paginated attendance (for classes managed by teacher)
  const filteredAttendance = (attendanceData?.attendance?.filter((a:any) =>
    myClasses.some((c:any) => c.id === a.classId) && (
      a.classId.toLowerCase().includes(attendanceSearch.toLowerCase())
    )
  ) || []);
  const pagedAttendance = filteredAttendance.slice((attendancePage-1)*pageSize, attendancePage*pageSize);

  // Summary: average score for all classes managed by teacher
  const avgScore = filteredScores.length ? (filteredScores.reduce((sum:any, s:any)=>sum+s.score,0)/filteredScores.length).toFixed(2) : '-';

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-green-50 via-white to-blue-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 drop-shadow">👨‍🏫 Teacher Dashboard</h1>
        <button
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition text-base font-semibold"
        >Đăng xuất</button>
      </div>
      {/* CLASSES SECTION */}
      <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-green-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
          <h2 className="font-semibold text-2xl text-green-800">🏫 Lớp học của tôi</h2>
          <button
            onClick={() => setShowCreateClassModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-base font-semibold"
          >+ Tạo lớp mới</button>
        </div>
        {/* Modal tạo lớp mới */}
        {showCreateClassModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] border border-green-200">
              <h3 className="font-semibold text-xl mb-4 text-green-700">Tạo lớp mới</h3>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1">Tên lớp</label>
                <input
                  className="border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2 w-full"
                  value={createClassForm.className}
                  onChange={e => setCreateClassForm(f => ({ ...f, className: e.target.value }))}
                  placeholder="Nhập tên lớp"
                />
              </div>
              <div className="mb-5">
                <label className="block text-base font-bold mb-1">Môn học</label>
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
            {myClasses.map((c:any) => (
              <li key={c.id} className="mb-1">
                <span className="font-semibold text-green-700">{c.className}</span>
                <span className="text-gray-500"> - Môn: </span>
                <span className="text-blue-700">{c.subject}</span>
                <span className="text-gray-500"> - Giáo viên: </span>
                <span className="text-blue-700">{typeof c.teacherId === 'object' ? (c.teacherId.fullName || c.teacherId.username || c.teacherId.id) : c.teacherId}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* SCORES SECTION */}
      <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-green-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
          <h2 className="font-semibold text-2xl text-green-800">📊 Quản lý điểm</h2>
          <div className="flex items-center gap-4">
            <input
              className="border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2"
              placeholder="Tìm kiếm theo môn, lớp hoặc học sinh..."
              value={scoreSearch}
              onChange={e=>{setScoreSearch(e.target.value); setScorePage(1);}}
            />
            <span className="text-gray-600 text-base">Trung bình: <b className="text-green-700">{avgScore}</b></span>
          </div>
        </div>
        {loadingScores ? (
          <div>Đang tải điểm...</div>
        ) : filteredScores.length === 0 ? (
          <div className="text-gray-500">Không có dữ liệu điểm.</div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-green-100 text-green-800">
                  <th className="border px-3 py-2">Học sinh</th>
                  <th className="border px-3 py-2">Lớp</th>
                  <th className="border px-3 py-2">Môn</th>
                  <th className="border px-3 py-2">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {pagedScores.map((s:any) => (
                  <tr key={s.id} className="hover:bg-green-50 transition">
                    <td className="border px-3 py-2">{s.studentId}</td>
                    <td className="border px-3 py-2">{s.classId}</td>
                    <td className="border px-3 py-2">{s.subject}</td>
                    <td className="border px-3 py-2">{s.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination for scores */}
          <div className="flex gap-2 items-center mb-2">
            <button disabled={scorePage===1} onClick={()=>setScorePage(p=>p-1)} className="px-3 py-1 border rounded-lg bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 transition">Trước</button>
            <span className="text-base">Trang {scorePage} / {Math.ceil(filteredScores.length/pageSize)||1}</span>
            <button disabled={scorePage*pageSize>=filteredScores.length} onClick={()=>setScorePage(p=>p+1)} className="px-3 py-1 border rounded-lg bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 transition">Sau</button>
          </div>
          </>
        )}
      </div>
      {/* ATTENDANCE SECTION */}
      <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-green-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
          <h2 className="font-semibold text-2xl text-green-800">📝 Quản lý điểm danh</h2>
          <div className="flex items-center gap-4">
            <input
              className="border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2"
              placeholder="Tìm kiếm theo lớp..."
              value={attendanceSearch}
              onChange={e=>{setAttendanceSearch(e.target.value); setAttendancePage(1);}}
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
            <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-green-100 text-green-800">
                  <th className="border px-3 py-2">Lớp</th>
                  <th className="border px-3 py-2">Ngày</th>
                  <th className="border px-3 py-2">Bản ghi</th>
                </tr>
              </thead>
              <tbody>
                {pagedAttendance.map((a:any) => (
                  <tr key={a.id} className="hover:bg-green-50 transition">
                    <td className="border px-3 py-2">{a.classId}</td>
                    <td className="border px-3 py-2">{a.date?.slice(0,10)}</td>
                    <td className="border px-3 py-2">{a.records?.map((r:any) => `${r.studentId}: ${r.status}`).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination for attendance */}
          <div className="flex gap-2 items-center mb-2">
            <button disabled={attendancePage===1} onClick={()=>setAttendancePage(p=>p-1)} className="px-3 py-1 border rounded-lg bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 transition">Trước</button>
            <span className="text-base">Trang {attendancePage} / {Math.ceil(filteredAttendance.length/pageSize)||1}</span>
            <button disabled={attendancePage*pageSize>=filteredAttendance.length} onClick={()=>setAttendancePage(p=>p+1)} className="px-3 py-1 border rounded-lg bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 transition">Sau</button>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
