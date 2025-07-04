'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '@/graphql/mutations';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({
        variables: {
          input: {
            username: form.username,
            password: form.password,
          },
        },
      });

      if (data?.SignIn?.access_token) {
        localStorage.setItem('token', data.SignIn.access_token);

        router.push('/dashboard');
      } else {
        console.error('Login failed: No token returned');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-200">
      <form onSubmit={handleSubmit} className="bg-white/90 p-8 rounded-2xl shadow-2xl w-96 space-y-5 border border-indigo-100">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-2 drop-shadow">Đăng nhập</h2>
        <input
          type="text"
          name="username"
          placeholder="Tên đăng nhập"
          value={form.username}
          onChange={handleChange}
          className="w-full border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          className="w-full border-2 border-indigo-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-indigo-400 outline-none mb-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-lg shadow hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        {error && <p className="text-red-500 text-sm text-center">Đăng nhập thất bại</p>}
        <div className="text-center text-sm text-gray-600 mt-2">
          Chưa có tài khoản? <a href="/register" className="text-indigo-600 hover:underline">Đăng ký</a>
        </div>
      </form>
    </div>
  );
}
