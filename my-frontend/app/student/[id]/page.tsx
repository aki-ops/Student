"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';

export default function StudentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // TODO: Fetch and display student info and scores
  return (
    <ProtectedRoute>
      <Layout>
        <h1 className="text-2xl font-bold mb-4">Student: {params.id}</h1>
        <p>Student details and scores will be shown here.</p>
      </Layout>
    </ProtectedRoute>
  );
}
