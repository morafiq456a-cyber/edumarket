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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '', shortDescription: '', description: '',
    category: '', price: 0, level: 'مبتدئ', thumbnail: ''
  });

  const [lessonForm, setLessonForm] = useState({
    title: '', section: '', description: '',
    videoUrl: '', duration: 0, isFreePreview: false
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

  const fetchLessons = async (courseId) => {
    try {
      const res = await api.get(`/lessons/course/${courseId}`);
      setLessons(res.data.data || []);
    } catch (error) {
      console.error(error);
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/courses/${editingCourse._id}`, { ...form, price: Number(form.price) });
      toast.success('تم تحديث الكورس ✅');
      setEditingCourse(null);
      setTab('overview');
      fetchData();
    } catch (error) {
      toast.error('فشل التحديث');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      shortDescription: course.shortDescription || '',
      description: course.description,
      category: course.category?._id || course.category,
      price: course.price,
      level: course.level,
      thumbnail: course.thumbnail || ''
    });
    setTab('edit');
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`حذف كورس "${title}"؟ سيتم حذف كل الدروس المرتبطة به`)) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('تم الحذف 🗑️');
      fetchData();
    } catch (error) {
      toast.error('فشل الحذف');
    }
  };

  const handleManageLessons = async (course) => {
    setSelectedCourse(course);
    await fetchLessons(course._id);
    setTab('lessons');
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lessons', {
        ...lessonForm,
        course: selectedCourse._id,
        duration: Number(lessonForm.duration)
      });
      toast.success('تم إضافة الدرس ✅');
      setLessonForm({ title: '', section: '', description: '', videoUrl: '', duration: 0, isFreePreview: false });
      fetchLessons(selectedCourse._id);
      fetchData();
    } catch (error) {
      toast.error('فشل الإضافة');
    }
  };

  const handleDeleteLesson = async (id, title) => {
    if (!confirm(`حذف درس "${title}"؟`)) return;
    try {
      await api.delete(`/lessons/${id}`);
      toast.success('تم الحذف 🗑️');
      fetchLessons(selectedCourse._id);
      fetchData();
    } catch (error) {
      toast.error('فشل الحذف');
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

  const uploadFile = async (file, type, setUrl) => {
    if (!file) return;

    if (type === 'image' && file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 10 ميجا');
      return;
    }
    if (type === 'video' && file.size > 500 * 1024 * 1024) {
      toast.error('حجم الفيديو يجب أن يكون أقل من 500 ميجا');
      return;
    }

    try {
      setUploading(true);
      toast.loading(`جاري رفع ${type === 'image' ? 'الصورة' : 'الفيديو'}...`, { id: 'upload' });

      const formData = new FormData();
      formData.append(type, file);

      const res = await api.post(`/upload/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUrl(res.data.data.url);
      toast.success(`تم الرفع ✅`, { id: 'upload' });
    } catch (error) {
      toast.error('فشل الرفع', { id: 'upload' });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const o = stats?.overview || {};

  return (
    <div className="container-app py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">لوحة المدرب</h1>
        <p className="mt-2 text-slate-500">إدارة الكورسات والدروس والأرباح</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => { setTab('overview'); setEditingCourse(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'overview' ? 'bg-indigo-600 text-white' : 'card hover:bg-slate-50'}`}
        >
          📊 نظرة عامة
        </button>
        <button
          onClick={() => { setTab('create'); setEditingCourse(null); setForm({ title: '', shortDescription: '', description: '', category: '', price: 0, level: 'مبتدئ', thumbnail: '' }); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'create' ? 'bg-indigo-600 text-white' : 'card hover:bg-slate-50'}`}
        >
          ➕ كورس جديد
        </button>
      </div>

      {/* نظرة عامة */}
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
              <p className="text-slate-500 text-center py-8">لا يوجد كورسات بعد. أنشئ أول كورس!</p>
            ) : (
              <div className="space-y-3">
                {courses.map(c => (
                  <div key={c._id} className="p-4 border rounded-xl">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg">{c.title}</h3>
                        <div className="flex gap-3 text-sm text-slate-500 mt-2 flex-wrap">
                          <span>📚 {c.totalLessons || 0} درس</span>
                          <span>👥 {c.totalStudents || 0} طالب</span>
                          <span>💰 ${c.price}</span>
                          <span>⭐ {c.averageRating || 0}</span>
                        </div>
                      </div>
                      <span className={`badge ${c.status === 'published' ? 'bg-emerald-100 text-emerald-700' : c.status === 'pending' ? 'bg-amber-100 text-amber-700' : c.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {c.status === 'published' ? '✅ منشور' : c.status === 'pending' ? '⏳ قيد المراجعة' : c.status === 'rejected' ? '❌ مرفوض' : '📝 مسودة'}
                      </span>
                    </div>

                    {c.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <strong>سبب الرفض:</strong> {c.rejectionReason}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4 flex-wrap">
                      <button
                        onClick={() => handleManageLessons(c)}
                        className="text-xs px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold"
                      >
                        📚 إدارة الدروس
                      </button>
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-xs px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold"
                      >
                        ✏️ تعديل
                      </button>
                      {(c.status === 'draft' || c.status === 'rejected') && (c.totalLessons > 0) && (
                        <button
                          onClick={() => handleSubmitReview(c._id)}
                          className="text-xs px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-semibold"
                        >
                          📤 إرسال للمراجعة
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c._id, c.title)}
                        className="text-xs px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* إنشاء أو تعديل كورس */}
      {(tab === 'create' || tab === 'edit') && (
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-5">
            {tab === 'edit' ? '✏️ تعديل الكورس' : '➕ إنشاء كورس جديد'}
          </h2>
          <form onSubmit={tab === 'edit' ? handleUpdate : handleCreate} className="grid md:grid-cols-2 gap-5">
            <input
              className="input md:col-span-2"
              placeholder="عنوان الكورس *"
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
              placeholder="الوصف الكامل *"
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
              <option value="">اختر التصنيف *</option>
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
              placeholder="السعر بالدولار"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              min="0"
              step="0.01"
            />

            {/* رفع صورة الكورس */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold">صورة الكورس</label>
              <div className="flex gap-3 items-center flex-wrap">
                <label className="btn-outline cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadFile(e.target.files[0], 'image', (url) => setForm({ ...form, thumbnail: url }))}
                    disabled={uploading}
                  />
                  📷 {uploading ? 'جاري الرفع...' : 'رفع صورة'}
                </label>
                {form.thumbnail && (
                  <img src={form.thumbnail} alt="" className="w-24 h-16 object-cover rounded-lg" />
                )}
              </div>
              <input
                className="input"
                placeholder="أو ضع رابط صورة"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary md:col-span-2" disabled={uploading}>
              {tab === 'edit' ? '💾 حفظ التعديلات' : '➕ إنشاء الكورس'}
            </button>
          </form>
        </div>
      )}

      {/* إدارة الدروس */}
      {tab === 'lessons' && selectedCourse && (
        <>
          <div className="card p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold">📚 دروس: {selectedCourse.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{lessons.length} درس</p>
              </div>
              <button
                onClick={() => { setTab('overview'); setSelectedCourse(null); }}
                className="btn-outline"
              >
                ← رجوع
              </button>
            </div>

            {/* فورم إضافة درس */}
            <div className="border-2 border-dashed border-indigo-200 rounded-xl p-5 mb-5 bg-indigo-50">
              <h3 className="font-bold mb-4">➕ إضافة درس جديد</h3>
              <form onSubmit={handleAddLesson} className="grid md:grid-cols-2 gap-4">
                <input
                  className="input md:col-span-2"
                  placeholder="عنوان الدرس *"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  required
                />
                <input
                  className="input"
                  placeholder="القسم (مثال: المقدمة)"
                  value={lessonForm.section}
                  onChange={(e) => setLessonForm({ ...lessonForm, section: e.target.value })}
                />
                <input
                  type="number"
                  className="input"
                  placeholder="المدة بالدقائق"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  min="0"
                />
                <textarea
                  rows="3"
                  className="textarea md:col-span-2"
                  placeholder="وصف الدرس"
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                />

                {/* رفع فيديو */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold">فيديو الدرس</label>
                  <div className="flex gap-3 items-center flex-wrap">
                    <label className="btn-outline cursor-pointer">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => uploadFile(e.target.files[0], 'video', (url) => setLessonForm({ ...lessonForm, videoUrl: url }))}
                        disabled={uploading}
                      />
                      🎥 {uploading ? 'جاري الرفع...' : 'رفع فيديو'}
                    </label>
                    {lessonForm.videoUrl && (
                      <span className="text-sm text-emerald-600 font-semibold">✅ تم رفع الفيديو</span>
                    )}
                  </div>
                  <input
                    className="input"
                    placeholder="أو ضع رابط فيديو"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  />
                </div>

                <label className="flex items-center gap-2 md:col-span-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonForm.isFreePreview}
                    onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">معاينة مجانية (يمكن مشاهدته بدون اشتراك)</span>
                </label>

                <button type="submit" className="btn-primary md:col-span-2" disabled={uploading}>
                  ➕ إضافة الدرس
                </button>
              </form>
            </div>

            {/* قائمة الدروس */}
            <div className="space-y-3">
              {lessons.length === 0 ? (
                <p className="text-slate-500 text-center py-8">لا يوجد دروس بعد. أضف أول درس!</p>
              ) : (
                lessons.map((l, i) => (
                  <div key={l._id} className="p-4 border rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{l.title}</p>
                        <div className="flex gap-3 text-xs text-slate-500 mt-1">
                          {l.section && <span>📁 {l.section}</span>}
                          <span>⏱️ {l.duration} د</span>
                          {l.videoUrl && <span className="text-emerald-600">🎥 فيديو</span>}
                          {l.isFreePreview && <span className="text-emerald-600 font-bold">معاينة مجانية</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLesson(l._id, l.title)}
                      className="text-xs px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold flex-shrink-0"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InstructorDashboard;