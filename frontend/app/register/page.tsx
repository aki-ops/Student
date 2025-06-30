'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '@/graphql/mutations';
import { useRouter } from 'next/navigation';



export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        username: '',
        fullName: '',
        password: '',
        role: 'STUDENT',
    });

    const [register, { loading, error }] = useMutation(REGISTER_MUTATION);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register({
                variables: {
                    input: {
                        username: form.username,
                        fullName: form.fullName,
                        password: form.password,
                        role: form.role,
                    },
                },
            });

            router.push('/login');
        } catch (err) {
            console.error('Register error:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-blue-200">
            <form onSubmit={handleSubmit} className="bg-white/90 p-8 rounded-2xl shadow-2xl w-96 space-y-5 border border-green-100">
                <h2 className="text-2xl font-bold text-center text-green-700 mb-2 drop-shadow">Đăng ký</h2>
                <input
                    type="text"
                    name="username"
                    placeholder="Tên đăng nhập"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2"
                />
                <input
                    type="text"
                    name="fullName"
                    placeholder="Họ và tên"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2"
                />
                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border-2 border-green-400 rounded-lg p-3 text-base text-gray-900 font-medium focus:ring-2 focus:ring-green-400 outline-none mb-2"
                >
                    <option value="STUDENT">Học sinh</option>
                    <option value="TEACHER">Giáo viên</option>
                </select>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg shadow hover:bg-green-700 transition disabled:opacity-60"
                >
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>
                {error && <p className="text-red-500 text-sm text-center">Đăng ký thất bại</p>}
                <div className="text-center text-sm text-gray-600 mt-2">
                    Đã có tài khoản? <a href="/login" className="text-green-600 hover:underline">Đăng nhập</a>
                </div>
            </form>
        </div>
    );
}
