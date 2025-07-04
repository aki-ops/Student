'use client';

import { useMutation, useQuery } from '@apollo/client';
import { CURRENT_USER_QUERY } from '@/graphql/queries';
import { GET_USERS_QUERY, GET_CLASSES_QUERY, GET_SCORES_QUERY, GET_ATTENDANCE_QUERY, FIND_USER_BY_ID_QUERY } from '@/graphql/queries';
import { REGISTER_MUTATION, UPDATE_USER_MUTATION, DELETE_USER_MUTATION, CREATE_CLASS_MUTATION, ADD_STUDENT_TO_CLASS_MUTATION, UPDATE_CLASS_MUTATION, DELETE_CLASS_MUTATION, CREATE_SCORE_MUTATION, UPDATE_SCORE_MUTATION, DELETE_SCORE_MUTATION, CREATE_ATTENDANCE_MUTATION, UPDATE_ATTENDANCE_MUTATION, DELETE_ATTENDANCE_MUTATION } from '@/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
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
  teacherId?: string;
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

type TabType = 'info' | 'user' | 'class';
type UserTabType = 'all' | 'students' | 'teachers';

// Components
interface HeaderBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout: () => void;
}

function HeaderBar({ activeTab, onTabChange, onLogout }: HeaderBarProps) {
  return (
    <div className="flex gap-2 items-center">
      <button
        className="relative group p-1"
        title="Thông báo"
        onClick={() => onTabChange('info')}
      >
        <BellIcon className={`w-7 h-7 ${activeTab === 'info' ? 'text-yellow-500' : 'text-gray-500 group-hover:text-yellow-600'}`} />
      </button>
      <button
        className="relative group p-1"
        title="Thông tin cá nhân"
        onClick={() => onTabChange('info')}
      >
        <UserCircleIcon className={`w-7 h-7 ${activeTab === 'info' ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-700'}`} />
      </button>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition text-base font-semibold font-sans"
        onClick={onLogout}
      >
        Đăng xuất
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
    { id: 'info' as TabType, label: 'Thông tin', icon: '👤', activeClass: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg', hoverClass: 'hover:bg-[var(--sidebar-hover)] text-blue-800' },
    { id: 'user' as TabType, label: 'Quản lý người dùng', icon: '👥', activeClass: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg', hoverClass: 'hover:bg-[var(--sidebar-hover)] text-blue-800' },
    { id: 'class' as TabType, label: 'Lớp học', icon: '🏫', activeClass: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg', hoverClass: 'hover:bg-[var(--sidebar-hover)] text-blue-800' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[var(--sidebar-bg)] to-[var(--pastel-indigo)] shadow-2xl flex flex-col py-8 px-6 gap-3 border-r border-blue-200">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl">🛡️</span>
        </div>
        <h2 className="text-2xl font-bold text-blue-800 font-sans">Admin Panel</h2>
        <p className="text-sm text-blue-600 mt-1">Quản lý hệ thống</p>
      </div>
      
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
            activeTab === tab.id ? tab.activeClass : tab.hoverClass
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
      
      <div className="flex-1" />
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

interface StudentNamesByIdsProps {
  studentIds: string[];
}

function StudentNamesByIds({ studentIds }: StudentNamesByIdsProps) {
  return (
    <div>
      {studentIds.map((studentId, index) => (
        <StudentNameById key={studentId} studentId={studentId} isLast={index === studentIds.length - 1} />
      ))}
    </div>
  );
}

interface StudentNameByIdProps {
  studentId: string;
  isLast: boolean;
}

function StudentNameById({ studentId, isLast }: StudentNameByIdProps) {
  const { data, loading, error } = useQuery(FIND_USER_BY_ID_QUERY, { variables: { id: studentId } });
  
  if (loading) return <span>Đang tải...</span>;
  if (error || !data?.findById) return <span>Không tìm thấy học sinh</span>;
  
  return (
    <span>
      {data.findById.fullName || data.findById.username}
      {!isLast && ', '}
    </span>
  );
}

// Main Component
export default function AdminDashboard() {
  const router = useRouter();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [activeUserTab, setActiveUserTab] = useState<UserTabType>('all');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', username: '', role: 'STUDENT' });
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [addStudentError, setAddStudentError] = useState<string>('');

  // Queries
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY);
  const isAdmin = data?.current_User?.role === 'ADMIN';

  const { data: classesData, loading: classesLoading, error: classesError, refetch: refetchClasses } = useQuery(GET_CLASSES_QUERY, {
    errorPolicy: 'all',
  });

  // Queries for other dashboards (not used in admin)
  const { data: scoresData, loading: scoresLoading, error: scoresError, refetch: refetchScores } = useQuery(GET_SCORES_QUERY, {
    errorPolicy: 'all',
  });

  const { data: attendanceData, loading: attendanceLoading, error: attendanceError, refetch: refetchAttendance } = useQuery(GET_ATTENDANCE_QUERY);

  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery(GET_USERS_QUERY, {
    errorPolicy: 'all',
  });

  // Mutations
  const [createUser] = useMutation(REGISTER_MUTATION);
  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [deleteUser] = useMutation(DELETE_USER_MUTATION);

  const [createClass] = useMutation(CREATE_CLASS_MUTATION);
  const [addStudentToClass] = useMutation(ADD_STUDENT_TO_CLASS_MUTATION);
  const [updateClass] = useMutation(UPDATE_CLASS_MUTATION);
  const [deleteClass] = useMutation(DELETE_CLASS_MUTATION);

  // Mutations for other dashboards (not used in admin)
  const [createScore] = useMutation(CREATE_SCORE_MUTATION);
  const [updateScore] = useMutation(UPDATE_SCORE_MUTATION);
  const [deleteScore] = useMutation(DELETE_SCORE_MUTATION);

  const [createAttendance] = useMutation(CREATE_ATTENDANCE_MUTATION);
  const [updateAttendance] = useMutation(UPDATE_ATTENDANCE_MUTATION);
  const [deleteAttendance] = useMutation(DELETE_ATTENDANCE_MUTATION);

  // Memoized computations
  const user = data?.current_User;
  const currentUserInfo = useMemo(() => 
    usersData?.findAllUsers?.find((u: User) => u.username === user?.username),
    [usersData?.findAllUsers, user?.username]
  );
  
  const filteredUsers = useMemo(() => {
    return usersData?.findAllUsers?.filter((u: User) => {
    if (activeUserTab === 'all') return true;
    if (activeUserTab === 'students') return u.role === 'STUDENT';
    if (activeUserTab === 'teachers') return u.role === 'TEACHER';
    return true;
  }) || [];
  }, [usersData?.findAllUsers, activeUserTab]);

  // Callbacks
  const handleLogout = useCallback(() => {
    window.location.href = '/login';
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleUserTabChange = useCallback((tab: UserTabType) => {
    setActiveUserTab(tab);
  }, []);

  // User CRUD handlers
  const handleAddUser = useCallback(() => {
    setEditUser(null);
    setForm({ name: '', username: '', role: 'STUDENT' });
    setShowModal(true);
  }, []);

  const handleEditUser = useCallback((user: User) => {
    setEditUser(user);
    setForm({ name: user.fullName || '', username: user.username, role: user.role });
    setShowModal(true);
  }, []);

  const handleDeleteUser = useCallback(async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }
    try {
    await deleteUser({ variables: { id } });
    refetchUsers();
    } catch (error) {
      console.error('Lỗi khi xóa user:', error);
      alert('Có lỗi xảy ra khi xóa người dùng');
    }
  }, [deleteUser, refetchUsers]);

  const handleSaveUser = useCallback(async () => {
    if (!form.name.trim() || !form.username.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    try {
      if (editUser) {
        await updateUser({ 
          variables: { 
            input: { 
              id: editUser.id, 
              fullName: form.name, 
              username: form.username, 
              role: form.role 
            } 
          } 
        });
    } else {
        await createUser({ 
          variables: { 
            input: { 
              fullName: form.name, 
              username: form.username, 
              password: '123456', 
              role: form.role 
            } 
          } 
        });
      }
      setShowModal(false);
      refetchUsers();
    } catch (error) {
      console.error('Lỗi khi lưu user:', error);
      alert('Có lỗi xảy ra khi lưu người dùng');
    }
  }, [editUser, form, createUser, updateUser, refetchUsers]);

  // Effects
  useEffect(() => {
    if (error || !isAdmin) {
      router.push('/login');
    }
  }, [data, error, router, isAdmin]);

  // Loading state
  if (loading || !isAdmin) {
  return (
      <div className="flex items-center justify-center min-h-[40vh] text-lg text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[var(--background)] to-[var(--pastel-blue)]">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="flex-1 p-8 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 drop-shadow font-sans">Admin Dashboard</h1>
          <HeaderBar 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            onLogout={handleLogout} 
          />
        </div>

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
              Vai trò: <b>Admin</b>
            </div>
          </div>
        )}

        {activeTab === 'user' && (
          <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-green-800 font-sans flex items-center gap-2">
                👥 Quản lý người dùng
              </h2>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition font-semibold"
              >
                + Thêm người dùng
              </button>
          </div>
          
            {/* User tabs */}
            <div className="flex gap-2 mb-4">
            <button 
                onClick={() => handleUserTabChange('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeUserTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tất cả
            </button>
            <button 
                onClick={() => handleUserTabChange('students')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeUserTab === 'students' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Học sinh
            </button>
            <button 
                onClick={() => handleUserTabChange('teachers')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeUserTab === 'teachers' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Giáo viên
            </button>
            </div>
            
            {usersLoading ? (
              <div>Đang tải danh sách người dùng...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-gray-500">Không có người dùng nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow font-sans">
                <thead>
                    <tr className="bg-green-100 text-green-800 font-bold">
                    <th className="border px-3 py-2">Tên</th>
                    <th className="border px-3 py-2">Username</th>
                      <th className="border px-3 py-2">Vai trò</th>
                    <th className="border px-3 py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((u: User) => (
                      <tr key={u.id} className="hover:bg-green-50 transition text-gray-900 font-medium">
                        <td className="border px-3 py-2">{u.fullName || u.username}</td>
                        <td className="border px-3 py-2">{u.username}</td>
                        <td className="border px-3 py-2">
                          <span className={`inline-block px-2 py-1 rounded font-bold ${
                            u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                            u.role === 'TEACHER' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {u.role === 'ADMIN' ? 'Admin' :
                             u.role === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}
                          </span>
                        </td>
                        <td className="border px-3 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(u)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        )}

        {/* User Modal */}
          {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl border border-gray-200">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                {editUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">Tên:</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên đầy đủ"
                />
                </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">Username:</label>
                  <input 
                  type="text"
                    value={form.username} 
                  onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập username"
                  />
                </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">Vai trò:</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="STUDENT">Học sinh</option>
                  <option value="TEACHER">Giáo viên</option>
                  <option value="ADMIN">Admin</option>
                  </select>
                </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveUser}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  {editUser ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  Hủy
                </button>
              </div>
            </div>
        </div>
      )}

        {/* Class Management Tab */}
        {activeTab === 'class' && (
          <div className="mb-10 bg-white/90 rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-purple-800 font-sans flex items-center gap-2">
                🏫 Quản lý lớp học
              </h2>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition font-semibold"
              >
                + Thêm lớp học
              </button>
            </div>
            
          {classesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                <p>Đang tải danh sách lớp học...</p>
            </div>
            ) : classesData?.getAllClasses?.length === 0 ? (
              <div className="text-gray-500 text-center py-8">Chưa có lớp học nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-base mb-4 bg-white rounded-xl overflow-hidden shadow font-sans">
                <thead>
                    <tr className="bg-purple-100 text-purple-800 font-bold">
                    <th className="border px-3 py-2">Tên lớp</th>
                    <th className="border px-3 py-2">Môn học</th>
                    <th className="border px-3 py-2">Giáo viên</th>
                    <th className="border px-3 py-2">Số học sinh</th>
                    <th className="border px-3 py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                    {classesData?.getAllClasses?.map((c: Class) => (
                      <tr key={c.id} className="hover:bg-purple-50 transition text-gray-900 font-medium">
                      <td className="border px-3 py-2">{c.className}</td>
                      <td className="border px-3 py-2">{c.subject}</td>
                      <td className="border px-3 py-2">
                          {c.teacherId ? <TeacherNameById teacherId={c.teacherId} /> : 'Chưa có giáo viên'}
                      </td>
                        <td className="border px-3 py-2">{c.studentIds?.length || 0}</td>
                      <td className="border px-3 py-2">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                              Sửa
                            </button>
                            <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                              Xóa
                            </button>
                            <button
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                              onClick={() => {
                                setSelectedClass(c);
                                setShowAddStudentModal(true);
                                setSelectedStudentId('');
                                setAddStudentError('');
                              }}
                            >
                              Thêm học sinh
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            {/* Modal thêm học sinh vào lớp */}
            {showAddStudentModal && selectedClass && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-96 shadow-2xl border border-gray-200">
                  <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">➕</span>
                    Thêm học sinh vào lớp "{selectedClass.className}"
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Chọn học sinh:</label>
                    <select
                      value={selectedStudentId}
                      onChange={e => setSelectedStudentId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Chọn học sinh --</option>
                      {usersData?.findAllUsers?.filter((u: User) => u.role === 'STUDENT' && !selectedClass.studentIds.includes(u.id)).map((student: User) => (
                        <option key={student.id} value={student.id}>
                          {student.fullName || student.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  {addStudentError && <div className="text-red-500 mb-2 text-sm">{addStudentError}</div>}
                  <div className="flex gap-3 mt-4">
                    <button
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-60"
                      disabled={addStudentLoading || !selectedStudentId}
                      onClick={async () => {
                        if (!selectedStudentId) return;
                        setAddStudentLoading(true);
                        setAddStudentError('');
                        try {
                          await addStudentToClass({ variables: { classId: selectedClass.id, studentId: selectedStudentId } });
                          setShowAddStudentModal(false);
                          setSelectedClass(null);
                          setSelectedStudentId('');
                          refetchClasses();
                        } catch (err: any) {
                          setAddStudentError('Có lỗi xảy ra khi thêm học sinh.');
                        } finally {
                          setAddStudentLoading(false);
                        }
                      }}
                    >
                      {addStudentLoading ? 'Đang thêm...' : 'Thêm'}
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg"
                      onClick={() => {
                        setShowAddStudentModal(false);
                        setSelectedClass(null);
                        setSelectedStudentId('');
                        setAddStudentError('');
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


      </main>
    </div>
  );
}
