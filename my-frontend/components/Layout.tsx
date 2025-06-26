"use client";


import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col">
      <nav className="bg-white/80 shadow-md backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-blue-700 tracking-tight">StudentMS</Link>
          <div className="flex gap-4 items-center">
            {user && (
              <>
                <Link href="/dashboard" className={`hover:text-blue-600 transition font-medium ${pathname==='/dashboard'?'text-blue-700 underline':''}`}>Dashboard</Link>
                <Link href="/class" className={`hover:text-blue-600 transition font-medium ${pathname.startsWith('/class')?'text-blue-700 underline':''}`}>Classes</Link>
                {user.role === 'ADMIN' && (
                  <>
                    <Link href="/teacher" className={`hover:text-blue-600 transition font-medium ${pathname.startsWith('/teacher')?'text-blue-700 underline':''}`}>Teachers</Link>
                    <Link href="/student" className={`hover:text-blue-600 transition font-medium ${pathname.startsWith('/student')?'text-blue-700 underline':''}`}>Students</Link>
                  </>
                )}
                <span className="ml-4 text-gray-600">{user.name}</span>
                <button onClick={logout} className="ml-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition">Logout</button>
              </>
            )}
            {!user && (
              <>
                <Link href="/login" className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition">Login</Link>
                <Link href="/register" className="px-4 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-5xl w-full mx-auto py-8 px-4">
        {children}
      </main>
      <footer className="bg-white/80 text-center py-4 text-gray-500 text-sm border-t">© {new Date().getFullYear()} Student Management System</footer>
    </div>
  );
}
