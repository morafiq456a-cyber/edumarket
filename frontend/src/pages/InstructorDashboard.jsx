import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const InstructorDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', shortDescription: '', description: '',
    category: '', price: 0, level: 'مبتدئ', thumbnail: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, coursesRes, catsRes] = await Promise.all([
        api.get('/courses/instructor/stats'),
        api.get('/courses/instructor/my-courses'),
        api.get('/categories')
      ]);
      setStats(statsRes.data.data);
      setCourses(coursesRes.data.data || []);
      setCategories(catsRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', { ...form, price: Number(form.price) });
      toast.success('تم إنشاء الكورس ✅');
      setForm({ title: '', shortDescription: '', description: '', category: '', price: 0, level: 'مبتدئ', thumbnail: '' });
      setTab('overview');
      fetchData();
    } catch (error) {
      toast.error('فشل الإنشاء');
    }
  };

  const handleSubmitReview = async (courseId) => {
    try {
      await api.put(`/courses/${courseId}/submit-review`);
      toast.success('تم الإرسال للمراجعة 📤');
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'فشل');
    }
  };

  if (loading) return <LoadingSpinner />;

  const o = stats?.overview || {};

  return (
    <div className="container-app py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">لوحة المدرب</h1>
        <p className="mt-2 text-slate-500">إدارة الكورسات والأرباح</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {['overview', 'create'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === t ? 'bg-indigo-600 text-white' : 'card hover:bg-slate-50'}`}
          >
            {t === 'overview' ? '📊 نظرة عامة' : '➕ كورس جديد'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="card p-5">
              <p className="text-sm text-slate-500">إجمالي الكورسات</p>
              <h3 className="text-2xl font-bold mt-2">{o.totalCourses || 0}</h3>
            </div>
            <div className="card p-5">
              <p className="text-sm text-slate-500">منشور</p>
              <h3 className="text-2xl font-bold mt-2 text-emerald-700">{o.publishedCourses || 0}</h3>
            </div>
            <div className="card p-5">
              <p className="text-sm text-slate-500">إجمالي الطلاب</p>
              <h3 className="text-2xl font-bold mt-2">{o.totalStudents || 0}</h3>
            </div>
            <div className="card p-5">
              <p className="text-sm text-slate-500">إجمالي الأرباح</p>
              <h3 className="text-2xl font-bold mt-2 text-emerald-700">${(o.totalEarnings || 0).toFixed(2)}</h3>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold mb-5">كورساتي</h2>
            {courses.length === 0 ? (
              <p className="text-slate-500">لا يوجد كورسات بعد</p>
            ) : (
              <div className="space-y-3">
                {courses.map(c => (
                  <div key={c._id} className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                      <h3 className="font-bold">{c.title}</h3>
                      <div className="flex gap-3 text-sm text-slate-500 mt-1">
                        <span>{c.totalStudents || 0} طالب</span>
                        <span>${c.price}</span>
                        <span>⭐ {c.averageRating || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${c.status === 'published' ? 'bg-emerald-100 text-emerald-700' : c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                        {c.status === 'published' ? 'منشور' : c.status === 'pending' ? 'معلق' : c.status === 'rejected' ? 'مرفوض' : 'مسودة'}
                      </span>
                      {(c.status === 'draft' || c.status === 'rejected') && (
                        <button onClick={() => handleSubmitReview(c._id)} className="btn-primary text-xs">
                          إرسال للمراجعة
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'create' && (
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-5">إنشاء كورس جديد</h2>
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-5">
            <input
              className="input md:col-span-2"
              placeholder="عنوان الكورس"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              className="input md:col-span-2"
              placeholder="وصف مختصر"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            />
            <textarea
              rows="5"
              className="textarea md:col-span-2"
              placeholder="الوصف الكامل"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <select
              className="select"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">اختر التصنيف</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select
              className="select"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              <option value="مبتدئ">مبتدئ</option>
              <option value="متوسط">متوسط</option>
              <option value="متقدم">متقدم</option>
              <option value="جميع المستويات">جميع المستويات</option>
            </select>
            <input
              type="number"
              className="input"
              placeholder="السعر ($)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              min="0"
            />
            <input
              className="input"
              placeholder="رابط صورة الكورس"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            />
            <button type="submit" className="btn-primary md:col-span-2">إنشاء الكورس</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;