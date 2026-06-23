import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', headline: '', bio: '', phone: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        headline: user.headline || '',
        bio: user.bio || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  if (!user) return <LoadingSpinner />;

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/auth/update-profile', form);
      setUser(res.data.data);
      toast.success('تم تحديث البيانات ✅');
    } catch (error) {
      toast.error('فشل التحديث');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    try {
      setLoading(true);
      const res = await api.put('/auth/change-password', passwordForm);
      localStorage.setItem('token', res.data.data.token);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('تم تغيير كلمة المرور 🔐');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'فشل التغيير');
    } finally {
      setLoading(false);
    }
  };

  const roleBadge = user.role === 'admin' ? '🛡️ أدمن' : user.role === 'instructor' ? '👨‍🏫 مدرب' : '🎓 طالب';
  const roleBadgeColor = user.role === 'admin' ? 'bg-red-100 text-red-700' : user.role === 'instructor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';

  return (
    <div className="container-app py-8 space-y-8">
      {/* Header */}
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-700"></div>
        <div className="px-6 pb-6 -mt-16">
          <div className="w-28 h-28 rounded-full bg-indigo-200 border-4 border-white flex items-center justify-center text-4xl font-bold text-indigo-700 shadow-lg">
            {user.firstName?.[0]}
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
              <span className={`badge ${roleBadgeColor}`}>{roleBadge}</span>
            </div>
            {user.headline && <p className="text-slate-600 mt-1">{user.headline}</p>}
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64">
          <div className="card p-4 space-y-1">
            <button
              onClick={() => setTab('info')}
              className={`w-full text-right px-4 py-3 rounded-xl text-sm font-medium ${tab === 'info' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              👤 البيانات الشخصية
            </button>
            <button
              onClick={() => setTab('security')}
              className={`w-full text-right px-4 py-3 rounded-xl text-sm font-medium ${tab === 'security' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              🔐 الأمان
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {tab === 'info' && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-5">تعديل البيانات</h2>
              <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-5">
                <input
                  className="input"
                  placeholder="الاسم الأول"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="الاسم الأخير"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
                <input
                  className="input md:col-span-2"
                  placeholder="العنوان المهني (مثال: مطور Full Stack)"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                />
                <textarea
                  rows="4"
                  className="textarea md:col-span-2"
                  placeholder="السيرة الذاتية"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="رقم الهاتف"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input className="input" value={user.email} disabled />
                <button type="submit" disabled={loading} className="btn-primary md:col-span-2">
                  {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </form>
            </div>
          )}

          {tab === 'security' && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-5">🔐 تغيير كلمة المرور</h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <input
                  type="password"
                  className="input"
                  placeholder="كلمة المرور الحالية"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
                <input
                  type="password"
                  className="input"
                  placeholder="كلمة المرور الجديدة"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
                <input
                  type="password"
                  className="input"
                  placeholder="تأكيد كلمة المرور"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;