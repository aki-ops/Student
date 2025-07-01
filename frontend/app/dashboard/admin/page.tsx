'use client';

import { useMutation, useQuery } from '@apollo/client';
import { CURRENT_USER_QUERY } from '@/graphql/queries';
import { GET_USERS_QUERY, GET_CLASSES_QUERY, GET_SCORES_QUERY, GET_ATTENDANCE_QUERY, FIND_USER_BY_ID_QUERY } from '@/graphql/queries';
import { REGISTER_MUTATION, UPDATE_USER_MUTATION, DELETE_USER_MUTATION, CREATE_CLASS_MUTATION, ADD_STUDENT_TO_CLASS_MUTATION, UPDATE_CLASS_MUTATION, DELETE_CLASS_MUTATION, CREATE_SCORE_MUTATION, UPDATE_SCORE_MUTATION, DELETE_SCORE_MUTATION, CREATE_ATTENDANCE_MUTATION, UPDATE_ATTENDANCE_MUTATION, DELETE_ATTENDANCE_MUTATION } from '@/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const router = useRouter();
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', username: '', role: 'STUDENT' });
  const [activeUserTab, setActiveUserTab] = useState<'all' | 'students' | 'teachers'>('all');

  // CLASSES - Updated: Backend now has getAllClasses query
  const { data: classesData, loading: classesLoading, error: classesError, refetch: refetchClasses } = useQuery(GET_CLASSES_QUERY, {
    errorPolicy: 'all',
    onError: (error) => {
      console.log('Classes query error:', error.message);
    }
  });
  const [createClass] = useMutation(CREATE_CLASS_MUTATION);
  const [addStudentToClass] = useMutation(ADD_STUDENT_TO_CLASS_MUTATION);
  const [updateClass] = useMutation(UPDATE_CLASS_MUTATION);
  const [deleteClass] = useMutation(DELETE_CLASS_MUTATION);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editClass, setEditClass] = useState<any | null>(null);
  const [classForm, setClassForm] = useState<{ className: string; subject: string; teacherId: string }>({ className: '', subject: '', teacherId: '' });
  const [addStudentForm, setAddStudentForm] = useState<{ classId: string; studentId: string }>({ classId: '', studentId: '' });
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // SCORES - Updated: Backend now has getAllScores query
  const { data: scoresData, loading: scoresLoading, error: scoresError, refetch: refetchScores } = useQuery(GET_SCORES_QUERY, {
    errorPolicy: 'all',
    onError: (error) => {
      console.log('Scores query error:', error.message);
    }
  });
  const [createScore] = useMutation(CREATE_SCORE_MUTATION);
  const [updateScore] = useMutation(UPDATE_SCORE_MUTATION);
  const [deleteScore] = useMutation(DELETE_SCORE_MUTATION);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [editScore, setEditScore] = useState<any | null>(null);
  const [scoreForm, setScoreForm] = useState<{ studentId: string; classId: string; subject: string; score: number }>({ studentId: '', classId: '', subject: '', score: 0 });

  // ATTENDANCE
  const { data: attendanceData, loading: attendanceLoading, error: attendanceError, refetch: refetchAttendance } = useQuery(GET_ATTENDANCE_QUERY);
  const [createAttendance] = useMutation(CREATE_ATTENDANCE_MUTATION);
  const [updateAttendance] = useMutation(UPDATE_ATTENDANCE_MUTATION);
  const [deleteAttendance] = useMutation(DELETE_ATTENDANCE_MUTATION);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [editAttendance, setEditAttendance] = useState<any | null>(null);
  const [attendanceForm, setAttendanceForm] = useState<{ classId: string; date: string; records: string }>({ classId: '', date: '', records: '' });

  // Lấy danh sách user từ backend - Updated: Backend now has findAllUsers query
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery(GET_USERS_QUERY, {
    errorPolicy: 'all',
    onError: (error) => {
      console.log('Users query error:', error.message);
    }
  });
  const [createUser] = useMutation(REGISTER_MUTATION);
  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [deleteUser] = useMutation(DELETE_USER_MUTATION);

  useEffect(() => {
    if (error || data?.current_User?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [data, error, router]);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh] text-lg text-gray-600">Loading admin dashboard...</div>;

  const user = data?.current_User;
  
  // Lọc users theo tab
  const filteredUsers = usersData?.findAllUsers?.filter((u: any) => {
    if (activeUserTab === 'all') return true;
    if (activeUserTab === 'students') return u.role === 'STUDENT';
    if (activeUserTab === 'teachers') return u.role === 'TEACHER';
    return true;
  }) || [];
  // Nếu cần id/fullName của user hiện tại, lấy từ usersData.findAllUsers theo username
  const currentUserInfo = usersData?.findAllUsers?.find((u: any) => u.username === user?.username);

  // CRUD handlers kết nối backend
  const handleAdd = () => {
    setEditUser(null);
    setForm({ name: '', username: '', role: 'STUDENT' });
    setShowModal(true);
  };
  const handleEdit = (user: any) => {
    setEditUser(user);
    setForm({ name: user.name, username: user.username, role: user.role });
    setShowModal(true);
  };
  const handleDelete = async (id: number) => {
    await deleteUser({ variables: { id } });
    refetchUsers();
  };
  const handleSave = async () => {
    if (editUser) {
      await updateUser({ variables: { input: { id: editUser.id, fullName: form.name, username: form.username, role: form.role } } });
    } else {
      await createUser({ variables: { input: { fullName: form.name, username: form.username, password: '123456', role: form.role } } });
    }
    setShowModal(false);
    refetchUsers();
  };

  // CRUD handlers for Class (Apollo)
  const handleAddClass = () => {
    setEditClass(null);
    setClassForm({ className: '', subject: '', teacherId: '' });
    setShowClassModal(true);
  };
  const handleEditClass = (c: any) => {
    setEditClass(c);
    setClassForm({ 
      className: c.className, 
      subject: c.subject || '',
      teacherId: c.teacherId?.id || ''
    });
    setShowClassModal(true);
  };
  const handleDeleteClass = async (id: string) => {
    await deleteClass({ variables: { id } });
    refetchClasses();
  };
  const handleSaveClass = async () => {
    const createClassInput: any = { 
      className: classForm.className, 
      subject: classForm.subject 
    };
    
    // Chỉ thêm teacherId nếu được nhập
    if (classForm.teacherId.trim()) {
      createClassInput.teacherId = classForm.teacherId;
    }

    if (editClass) {
      await updateClass({ variables: { updateClassInput: { id: editClass.id, ...createClassInput } } });
    } else {
      await createClass({ variables: { createClassInput } });
    }
    setShowClassModal(false);
    refetchClasses();
  };

  // Add student to class
  const handleAddStudentToClass = () => {
    setAddStudentForm({ classId: '', studentId: '' });
    setShowAddStudentModal(true);
  };

  const handleSaveAddStudent = async () => {
    await addStudentToClass({ 
      variables: { 
        classId: addStudentForm.classId, 
        studentId: addStudentForm.studentId 
      } 
    });
    setShowAddStudentModal(false);
    refetchClasses();
  };

  // CRUD handlers for Score (Apollo)
  const handleAddScore = () => {
    setEditScore(null);
    setScoreForm({ studentId: '', classId: '', subject: '', score: 0 });
    setShowScoreModal(true);
  };
  const handleEditScore = (s: any) => {
    setEditScore(s);
    setScoreForm({ studentId: s.studentId, classId: s.classId, subject: s.subject, score: s.score });
    setShowScoreModal(true);
  };
  const handleDeleteScore = async (id: string) => {
    await deleteScore({ variables: { id } });
    refetchScores();
  };
  const handleSaveScore = async () => {
    if (editScore) {
      await updateScore({ variables: { updateScoreInput: { id: editScore.id, ...scoreForm } } });
    } else {
      await createScore({ variables: { createScoreInput: scoreForm } });
    }
    setShowScoreModal(false);
    refetchScores();
  };

  // CRUD handlers for Attendance (Apollo)
  const handleAddAttendance = () => {
    setEditAttendance(null);
    setAttendanceForm({ classId: '', date: '', records: '' });
    setShowAttendanceModal(true);
  };
  const handleEditAttendance = (a: any) => {
    setEditAttendance(a);
    setAttendanceForm({ classId: a.classId, date: a.date?.slice(0,10), records: a.records?.map((r: any) => `${r.studentId}:${r.status}`).join(',') });
    setShowAttendanceModal(true);
  };
  const handleDeleteAttendance = async (id: string) => {
    await deleteAttendance({ variables: { id } });
    refetchAttendance();
  };
  const handleSaveAttendance = async () => {
    // records: "studentId:status,studentId:status"
    const recordsArr = attendanceForm.records.split(',').map(r => {
      const [studentId, status] = r.split(':').map(x => x.trim());
      return { studentId, status };
    }).filter(r => r.studentId && r.status);
    if (editAttendance) {
      await updateAttendance({ variables: { updateAttendanceInput: { id: editAttendance.id, classId: attendanceForm.classId, date: attendanceForm.date, records: recordsArr } } });
    } else {
      await createAttendance({ variables: { createAttendanceInput: { classId: attendanceForm.classId, date: attendanceForm.date, records: recordsArr } } });
    }
    setShowAttendanceModal(false);
    refetchAttendance();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-800 drop-shadow font-sans">🛡️ Admin Dashboard</h1>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition text-base font-semibold font-sans"
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
        >Đăng xuất</button>
      </div>
      {/* USERS TAB */}
      <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-indigo-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-2xl text-indigo-800">👤 Quản lý người dùng</h2>
          <button onClick={handleAdd} className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">+ Thêm người dùng</button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setActiveUserTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeUserTab === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tất cả ({usersData?.findAllUsers?.length || 0})
          </button>
          <button 
            onClick={() => setActiveUserTab('students')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeUserTab === 'students' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Học sinh ({usersData?.findAllUsers?.filter((u: any) => u.role === 'STUDENT').length || 0})
          </button>
          <button 
            onClick={() => setActiveUserTab('teachers')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeUserTab === 'teachers' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Giáo viên ({usersData?.findAllUsers?.filter((u: any) => u.role === 'TEACHER').length || 0})
          </button>
        </div>
        {usersLoading ? (
          <div>Đang tải...</div>
        ) : usersError ? (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="font-semibold">❌ Lỗi tải dữ liệu người dùng</p>
            <p className="text-sm mt-1">Vui lòng thử lại sau.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow font-sans">
              <thead>
                <tr className="bg-indigo-100 text-indigo-800 font-bold">
                  <th className="border px-3 py-2">ID</th>
                  <th className="border px-3 py-2">Tên</th>
                  <th className="border px-3 py-2">Username</th>
                  <th className="border px-3 py-2">Role</th>
                  <th className="border px-3 py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border px-3 py-4 text-center text-gray-500">
                      {activeUserTab === 'all' && 'Không có người dùng nào'}
                      {activeUserTab === 'students' && 'Không có học sinh nào'}
                      {activeUserTab === 'teachers' && 'Không có giáo viên nào'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-indigo-50 transition text-gray-900 font-medium">
                      <td className="border px-3 py-2">{u.id}</td>
                      <td className="border px-3 py-2">{u.fullName || 'Chưa có tên'}</td>
                      <td className="border px-3 py-2">{u.username}</td>
                      <td className="border px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          u.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="border px-3 py-2">
                        <button onClick={()=>handleEdit(u)} className="text-indigo-600 hover:underline mr-2">Sửa</button>
                        <button onClick={()=>handleDelete(u.id)} className="text-red-600 hover:underline">Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal thêm/sửa */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] border border-indigo-200">
              <h3 className="font-semibold text-xl mb-4 text-indigo-700">{editUser?'Sửa':'Thêm'} người dùng</h3>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1 text-gray-900">Tên</label>
                <input className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} />
              </div>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1 text-gray-900">Username</label>
                <input 
                  className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2 w-full" 
                  value={form.username} 
                  onChange={e=>setForm(f=>({...f, username:e.target.value}))} 
                  placeholder="Nhập username"
                />
              </div>
              <div className="mb-5">
                <label className="block text-base font-bold mb-1 text-gray-900">Role</label>
                <select className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2 w-full" value={form.role} onChange={e=>setForm(f=>({...f, role:e.target.value}))}>
                  <option value="">-- Chọn role --</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="TEACHER">TEACHER</option>
                  <option value="STUDENT">STUDENT</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={()=>setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
                <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Lưu</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* CLASSES TAB */}
      <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-indigo-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-2xl text-indigo-800">🏫 Danh sách lớp học</h2>
          <div className="flex gap-2">
            <button onClick={handleAddClass} className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">+ Thêm lớp</button>
            <button onClick={handleAddStudentToClass} className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">+ Thêm học sinh vào lớp</button>
          </div>
        </div>
        {classesLoading ? (
          <div>Đang tải...</div>
        ) : classesError ? (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="font-semibold">❌ Lỗi tải dữ liệu lớp học</p>
            <p className="text-sm mt-1">Vui lòng thử lại sau.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow font-sans">
              <thead>
                <tr className="bg-indigo-100 text-indigo-800 font-bold">
                  <th className="border px-3 py-2">ID</th>
                  <th className="border px-3 py-2">Tên lớp</th>
                  <th className="border px-3 py-2">Môn học</th>
                  <th className="border px-3 py-2">Giáo viên</th>
                  <th className="border px-3 py-2">Học sinh</th>
                  <th className="border px-3 py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {classesData?.getAllClasses?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-indigo-50 transition text-gray-900 font-medium">
                    <td className="border px-3 py-2">{c.id}</td>
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
                    <td className="border px-3 py-2">
                      {c.students && c.students.length > 0 ? (
                        c.students.map((s: any) => s.fullName || s.username).join(', ')
                      ) : c.studentIds && c.studentIds.length > 0 ? (
                        <StudentNamesByIds studentIds={c.studentIds} />
                      ) : (
                        'Chưa có học sinh'
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      <button onClick={()=>handleEditClass(c)} className="text-indigo-600 hover:underline mr-2">Sửa</button>
                      <button onClick={()=>handleDeleteClass(c.id)} className="text-red-600 hover:underline">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal thêm/sửa lớp */}
        {showClassModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] border border-indigo-200">
              <h3 className="font-semibold text-xl mb-4 text-indigo-700">{editClass?'Sửa':'Thêm'} lớp học</h3>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1 text-gray-900">Tên lớp</label>
                <input className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2" value={classForm.className} onChange={e=>setClassForm(f=>({...f, className:e.target.value}))} />
              </div>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1 text-gray-900">Môn học</label>
                <input className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2" value={classForm.subject} onChange={e=>setClassForm(f=>({...f, subject:e.target.value}))} />
              </div>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1 text-gray-900">Chọn giáo viên (để trống nếu tạo cho chính mình)</label>
                <select 
                  className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2 w-full"
                  value={classForm.teacherId} 
                  onChange={e=>setClassForm(f=>({...f, teacherId:e.target.value}))}
                >
                  <option value="">-- Để trống để tự động gán --</option>
                  {usersData?.findAllUsers?.filter((u: any) => u.role === 'TEACHER').map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.username})
                    </option>
                  ))}
                </select>
              </div>
              {/* Note: Student management moved to separate "Add Student to Class" feature */}
              <div className="mb-5">
                <p className="text-sm text-gray-600">Học sinh sẽ được thêm vào lớp sau khi tạo lớp</p>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={()=>setShowClassModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
                <button onClick={handleSaveClass} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Lưu</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal thêm học sinh vào lớp */}
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[400px] border border-indigo-200">
              <h3 className="font-semibold text-xl mb-4 text-indigo-700">Thêm học sinh vào lớp</h3>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1 text-gray-900">Chọn lớp</label>
                <select 
                  className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2 w-full"
                  value={addStudentForm.classId} 
                  onChange={e=>setAddStudentForm(f=>({...f, classId:e.target.value}))}
                >
                  <option value="">-- Chọn lớp --</option>
                  {classesData?.getAllClasses?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.className} - {c.subject}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-base font-bold mb-1 text-gray-900">Chọn học sinh</label>
                <select 
                  className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2 w-full"
                  value={addStudentForm.studentId} 
                  onChange={e=>setAddStudentForm(f=>({...f, studentId:e.target.value}))}
                >
                  <option value="">-- Chọn học sinh --</option>
                  {usersData?.findAllUsers?.filter((u: any) => u.role === 'STUDENT').map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.username})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={()=>setShowAddStudentModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
                <button 
                  onClick={handleSaveAddStudent} 
                  disabled={!addStudentForm.classId || !addStudentForm.studentId}
                  className={`px-4 py-2 rounded transition ${
                    !addStudentForm.classId || !addStudentForm.studentId 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* SCORES TAB */}
      <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-indigo-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-2xl text-indigo-800">📊 Bảng điểm</h2>
          <button onClick={handleAddScore} className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">+ Thêm điểm</button>
        </div>
        {scoresLoading ? (
          <div>Đang tải...</div>
        ) : scoresError ? (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="font-semibold">❌ Lỗi tải dữ liệu điểm</p>
            <p className="text-sm mt-1">Vui lòng thử lại sau.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-indigo-100 text-indigo-800">
                  <th className="border px-3 py-2">ID</th>
                  <th className="border px-3 py-2">Học sinh</th>
                  <th className="border px-3 py-2">Lớp</th>
                  <th className="border px-3 py-2">Môn</th>
                  <th className="border px-3 py-2">Điểm</th>
                  <th className="border px-3 py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {scoresData?.score?.map((s: any) => (
                  <tr key={s.id} className="hover:bg-indigo-50 transition">
                    <td className="border px-3 py-2">{s.id}</td>
                    <td className="border px-3 py-2">{s.studentId}</td>
                    <td className="border px-3 py-2">{s.classId}</td>
                    <td className="border px-3 py-2">{s.subject}</td>
                    <td className="border px-3 py-2">{s.score}</td>
                    <td className="border px-3 py-2">
                      <button onClick={()=>handleEditScore(s)} className="text-indigo-600 hover:underline mr-2">Sửa</button>
                      <button onClick={()=>handleDeleteScore(s.id)} className="text-red-600 hover:underline">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal thêm/sửa điểm */}
        {showScoreModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] border border-indigo-200">
              <h3 className="font-semibold text-xl mb-4 text-indigo-700">{editScore?'Sửa':'Thêm'} điểm</h3>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1">Học sinh (ID)</label>
                <input className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2" value={scoreForm.studentId} onChange={e=>setScoreForm(f=>({...f, studentId:e.target.value}))} />
              </div>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1">Lớp (ID)</label>
                <input className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2" value={scoreForm.classId} onChange={e=>setScoreForm(f=>({...f, classId:e.target.value}))} />
              </div>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1">Môn</label>
                <input className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2" value={scoreForm.subject} onChange={e=>setScoreForm(f=>({...f, subject:e.target.value}))} />
              </div>
              <div className="mb-5">
                <label className="block text-base font-bold mb-1">Điểm</label>
                <input type="number" className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2" value={scoreForm.score} onChange={e=>setScoreForm(f=>({...f, score:Number(e.target.value)}))} />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={()=>setShowScoreModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
                <button onClick={handleSaveScore} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Lưu</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* ATTENDANCE TAB */}
      <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-indigo-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-2xl text-indigo-800">📝 Bảng điểm danh</h2>
          <button onClick={handleAddAttendance} className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">+ Thêm điểm danh</button>
        </div>
        {attendanceLoading ? (
          <div>Đang tải...</div>
        ) : attendanceError ? (
          <div className="text-red-600">Lỗi tải dữ liệu điểm danh</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-indigo-100 text-indigo-800">
                  <th className="border px-3 py-2">ID</th>
                  <th className="border px-3 py-2">Lớp</th>
                  <th className="border px-3 py-2">Ngày</th>
                  <th className="border px-3 py-2">Bản ghi</th>
                  <th className="border px-3 py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData?.attendance?.map((a: any) => (
                  <tr key={a.id} className="hover:bg-indigo-50 transition">
                    <td className="border px-3 py-2">{a.id}</td>
                    <td className="border px-3 py-2">{a.classId}</td>
                    <td className="border px-3 py-2">{a.date?.slice(0,10)}</td>
                    <td className="border px-3 py-2">{a.records?.map((r: any) => `${r.studentId}: ${r.status}`).join(', ')}</td>
                    <td className="border px-3 py-2">
                      <button onClick={()=>handleEditAttendance(a)} className="text-indigo-600 hover:underline mr-2">Sửa</button>
                      <button onClick={()=>handleDeleteAttendance(a.id)} className="text-red-600 hover:underline">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal thêm/sửa điểm danh */}
        {showAttendanceModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] border border-indigo-200">
              <h3 className="font-semibold text-xl mb-4 text-indigo-700">{editAttendance?'Sửa':'Thêm'} điểm danh</h3>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1">Lớp (ID)</label>
                <input className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2" value={attendanceForm.classId} onChange={e=>setAttendanceForm(f=>({...f, classId:e.target.value}))} />
              </div>
              <div className="mb-3">
                <label className="block text-base font-bold mb-1">Ngày</label>
                <input type="date" className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2" value={attendanceForm.date} onChange={e=>setAttendanceForm(f=>({...f, date:e.target.value}))} />
              </div>
              <div className="mb-5">
                <label className="block text-base font-bold mb-1">Bản ghi (studentId:status, phân cách bằng dấu phẩy)</label>
                <input className="border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2" value={attendanceForm.records} onChange={e=>setAttendanceForm(f=>({...f, records:e.target.value}))} />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={()=>setShowAttendanceModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
                <button onClick={handleSaveAttendance} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Lưu</button>
              </div>
            </div>
          </div>
        )}
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

// Thêm component phụ để lấy tên học sinh theo ids
function StudentNamesByIds({ studentIds }: { studentIds: string[] }) {
  const names: string[] = [];
  
  return (
    <span>
      {studentIds.map((studentId, index) => (
        <StudentNameById key={studentId} studentId={studentId} isLast={index === studentIds.length - 1} />
      ))}
    </span>
  );
}

function StudentNameById({ studentId, isLast }: { studentId: string; isLast: boolean }) {
  const { data, loading, error } = useQuery(FIND_USER_BY_ID_QUERY, { variables: { id: studentId } });
  if (loading) return <span>Đang tải...</span>;
  if (error || !data?.findById) return <span>Unknown</span>;
  const name = data.findById.fullName || data.findById.username;
  return <span>{name}{!isLast && ', '}</span>;
}
