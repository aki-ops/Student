"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';

export default function TeacherPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // TODO: Fetch and display teacher info and classes
  return (
    <ProtectedRoute>
      <Layout>
        <h1 className="text-2xl font-bold mb-4">Teacher: {params.id}</h1>
        <p>Teacher details and classes will be shown here.</p>
      </Layout>
    </ProtectedRoute>
  );
}
