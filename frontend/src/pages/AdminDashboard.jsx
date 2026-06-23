import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ name: '', icon: '📚' });

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (tab === 'overview') {
        const res = await api.get('/admin/dashboard');
        setData(res.data.data);
      } else if (tab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data.data || []);
      } else if (tab === 'pending') {
        const res = await api.get('/admin/courses/pending');
        setPendingCourses(res.data.data || []);
      } else if (tab === 'categories') {
        const res = await api.get('/categories');
        setCategories(res.data.data || []);
      }
    } catch (error) {
      toast.error('فشل التحميل');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-status`);
      toast.success('تم التحديث');
      fetchData();
    } catch (error) {
      toast.error('فشل');
    }
  };

  const approveCourse = async (id) => {
    try {
      await api.put(`/admin/courses/${id}/approve`);
      toast.success('تمت الموافقة ✅');
      fetchData();
    } catch (error) {
      toast.error('فشل');
    }
  };

  const rejectCourse = async (id) => {
    const reason = prompt('سبب الرفض:');
    if (!reason) return;
    try {
      await api.put(`/admin/courses/${id}/reject`, { reason });
      toast.success('تم الرفض');
      fetchData();
    } catch (error) {
      toast.error('فشل');
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', newCat);
      toast.success('تم الإضافة ✅');
      setNewCat({ name: '', icon: '📚' });
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'فشل');
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('حذف هذا التصنيف؟')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('تم الحذف');
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'فشل');
    }
  };

  const o = data?.overview || {};

  return (
    <div className="container-app py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
        <p className="mt-2 text-slate-500">تحكم كامل في المنصة</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {[
          { id: 'overview', label: '📊 نظرة عامة' },
          { id: 'users', label: '👥 المستخدمون' },
          { id: 'pending', label: '⏳ كورسات معلقة' },
          { id: 'categories', label: '📁 التصنيفات' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === t.id ? 'bg-indigo-600 text-white' : 'card hover:bg-slate-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {tab === 'overview' && (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <div className="card p-5">
                  <p className="text-sm text-slate-500">المستخدمون</p>
                  <h3 className="text-2xl font-bold mt-2">{o.totalUsers || 0}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    طلاب: {o.totalStudents || 0} | مدربين: {o.totalInstructors || 0}
                  </p>
                </div>
                <div className="card p-5">
                  <p className="text-sm text-slate-500">الكورسات</p>
                  <h3 className="text-2xl font-bold mt-2">{o.totalCourses || 0}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    منشور: {o.publishedCourses || 0} | معلق: {o.pendingCourses || 0}
                  </p>
                </div>
                <div className="card p-5">
                  <p className="text-sm text-slate-500">الإيرادات</p>
                  <h3 className="text-2xl font-bold mt-2 text-emerald-700">
                    ${(o.totalRevenue || 0).toFixed(2)}
                  </h3>
                </div>
                <div className="card p-5">
                  <p className="text-sm text-slate-500">عمولة المنصة</p>
                  <h3 className="text-2xl font-bold mt-2 text-indigo-700">
                    ${(o.platformEarnings || 0).toFixed(2)}
                  </h3>
                </div>
              </div>

              {o.pendingCourses > 0 && (
                <div className="card p-5 border-amber-200 bg-amber-50">
                  <h3 className="font-bold text-amber-700">
                    ⏳ {o.pendingCourses} كورس ينتظر المراجعة
                  </h3>
                  <button onClick={() => setTab('pending')} className="text-sm text-amber-600 font-semibold mt-2 hover:underline">
                    مراجعتها الآن ←
                  </button>
                </div>
              )}
            </>
          )}

          {tab === 'users' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-right text-slate-500">
                      <th className="px-5 py-4">المستخدم</th>
                      <th className="px-5 py-4">الدور</th>
                      <th className="px-5 py-4">الحالة</th>
                      <th className="px-5 py-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b">
                        <td className="px-5 py-4">
                          <p className="font-semibold">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`badge ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'instructor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {u.isActive ? 'نشط' : 'محظور'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => toggleUser(u._id)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
                            >
                              {u.isActive ? 'حظر' : 'تفعيل'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'pending' && (
            pendingCourses.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold">لا يوجد كورسات معلقة</h2>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingCourses.map(c => (
                  <div key={c._id} className="card p-6">
                    <h3 className="text-xl font-bold">{c.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      المدرب: {c.instructor?.firstName} {c.instructor?.lastName}
                    </p>
                    <p className="text-sm text-slate-600 mt-3">{c.description}</p>
                    <div className="flex gap-3 text-sm text-slate-500 mt-3">
                      <span>السعر: ${c.price}</span>
                      <span>المستوى: {c.level}</span>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => approveCourse(c._id)} className="btn-primary">
                        موافقة ✅
                      </button>
                      <button onClick={() => rejectCourse(c._id)} className="btn-outline text-red-600 border-red-300 hover:bg-red-50">
                        رفض ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'categories' && (
            <>
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-5">إضافة تصنيف جديد</h2>
                <form onSubmit={addCategory} className="grid md:grid-cols-3 gap-4">
                  <input
                    className="input"
                    placeholder="اسم التصنيف"
                    value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    placeholder="أيقونة (Emoji)"
                    value={newCat.icon}
                    onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                  />
                  <button type="submit" className="btn-primary">إضافة</button>
                </form>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c._id} className="card p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
                        {c.icon}
                      </div>
                      <h3 className="font-bold">{c.name}</h3>
                    </div>
                    <button onClick={() => deleteCategory(c._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;