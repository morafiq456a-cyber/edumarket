import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'instructor') navigate('/instructor');
      else navigate('/');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-16">
      <div className="max-w-md mx-auto card p-8">
        <h1 className="text-3xl font-bold text-slate-900">تسجيل الدخول</h1>
        <p className="mt-2 text-slate-500">ادخل إلى حسابك</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-indigo-600 font-semibold">إنشاء حساب</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;