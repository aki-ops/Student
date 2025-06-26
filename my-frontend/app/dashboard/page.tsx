"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { useQuery } from '@apollo/client';
import { GET_SCORES_QUERY } from '@/graphql/queries';
import { GET_ATTENDANCES_QUERY } from '@/graphql/queries/attendance';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  // Nếu là học sinh, chỉ lấy dữ liệu của chính nó
  const isStudent = user?.role === 'STUDENT';
  const scoresQueryVars = isStudent ? { studentId: user?.id } : {};
  const attendanceQueryVars = isStudent ? { studentId: user?.id } : {};

  const { data: scoresData, loading: loadingScores } = useQuery(GET_SCORES_QUERY, {
    variables: scoresQueryVars,
    skip: !user,
  });
  const { data: attendanceData, loading: loadingAttendance } = useQuery(GET_ATTENDANCES_QUERY, {
    variables: attendanceQueryVars,
    skip: !user,
  });

  return (
    <ProtectedRoute>
      <Layout>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {/* Học sinh chỉ thấy thông tin của mình */}
        {isStudent && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Bảng điểm của bạn</h2>
              {loadingScores ? (
                <div>Đang tải điểm...</div>
              ) : (
                <table className="w-full border text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border px-2 py-1">Môn học</th>
                      <th className="border px-2 py-1">Điểm</th>
                      <th className="border px-2 py-1">Lớp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoresData?.scores?.map((score: any) => (
                      <tr key={score.id}>
                        <td className="border px-2 py-1">{score.subject}</td>
                        <td className="border px-2 py-1">{score.score}</td>
                        <td className="border px-2 py-1">{score.class?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Điểm danh của bạn</h2>
              {loadingAttendance ? (
                <div>Đang tải điểm danh...</div>
              ) : (
                <table className="w-full border text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border px-2 py-1">Ngày</th>
                      <th className="border px-2 py-1">Trạng thái</th>
                      <th className="border px-2 py-1">Lớp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData?.attendances?.map((att: any) => (
                      <tr key={att.id}>
                        <td className="border px-2 py-1">{att.date}</td>
                        <td className="border px-2 py-1">{att.status}</td>
                        <td className="border px-2 py-1">{att.class?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
        {/* Giáo viên và admin thấy tất cả */}
        {!isStudent && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Tất cả bảng điểm</h2>
              {loadingScores ? (
                <div>Đang tải điểm...</div>
              ) : (
                <table className="w-full border text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border px-2 py-1">Học sinh</th>
                      <th className="border px-2 py-1">Môn học</th>
                      <th className="border px-2 py-1">Điểm</th>
                      <th className="border px-2 py-1">Lớp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoresData?.scores?.map((score: any) => (
                      <tr key={score.id}>
                        <td className="border px-2 py-1">{score.student?.name}</td>
                        <td className="border px-2 py-1">{score.subject}</td>
                        <td className="border px-2 py-1">{score.score}</td>
                        <td className="border px-2 py-1">{score.class?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Tất cả điểm danh</h2>
              {loadingAttendance ? (
                <div>Đang tải điểm danh...</div>
              ) : (
                <table className="w-full border text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border px-2 py-1">Học sinh</th>
                      <th className="border px-2 py-1">Ngày</th>
                      <th className="border px-2 py-1">Trạng thái</th>
                      <th className="border px-2 py-1">Lớp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData?.attendances?.map((att: any) => (
                      <tr key={att.id}>
                        <td className="border px-2 py-1">{att.student?.name}</td>
                        <td className="border px-2 py-1">{att.date}</td>
                        <td className="border px-2 py-1">{att.status}</td>
                        <td className="border px-2 py-1">{att.class?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
