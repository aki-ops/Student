'use client';

import { useQuery } from '@apollo/client';
import { CURRENT_USER_QUERY } from '@/graphql/queries';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY);
  const user = data?.current_User;

  useEffect(() => {
    if (!loading && (!user || error)) {
      router.push('/login');
    }
    if (!loading && user) {
      if (user.role === 'ADMIN') router.push('/dashboard/admin');
      else if (user.role === 'TEACHER') router.push('/dashboard/teacher');
      else if (user.role === 'STUDENT') router.push('/dashboard/student');
    }
  }, [user, error, loading, router]);

  if (loading || !user) return <div className="flex items-center justify-center min-h-[40vh] text-lg text-gray-600">Loading dashboard...</div>;

  return null;
}
