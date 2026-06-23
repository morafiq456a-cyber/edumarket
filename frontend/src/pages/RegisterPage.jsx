import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'student'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...data } = form;
      const user = await register(data);
      if (user.role === 'instructor') navigate('/instructor');
      else navigate('/');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-16">
      <div className="max-w-xl mx-auto card p-8">
        <h1 className="text-3xl font-bold text-slate-900">إنشاء حساب جديد</h1>
        <p className="mt-2 text-slate-500">ابدأ رحلتك التعليمية</p>

        <form onSubmit={handleSubmit} className="mt-6 grid md:grid-cols-2 gap-4">
          <input
            placeholder="الاسم الأول"
            className="input"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <input
            placeholder="الاسم الأخير"
            className="input"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="input md:col-span-2"
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
            minLength={6}
          />
          <input
            type="password"
            placeholder="تأكيد كلمة المرور"
            className="input"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
          <select
            className="select md:col-span-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="student">طالب</option>
            <option value="instructor">مدرب</option>
          </select>
          <button type="submit" disabled={loading} className="btn-primary md:col-span-2">
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          لديك حساب؟{' '}
          <Link to="/login" className="text-indigo-600 font-semibold">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;