import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, catsRes] = await Promise.all([
        api.get('/courses', { params: { limit: 6 } }),
        api.get('/categories')
      ]);
      setCourses(coursesRes.data.data || []);
      setCategories(catsRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-8 space-y-12">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-8 md:p-14 text-white">
        <div className="max-w-2xl">
          <span className="inline-flex px-4 py-1.5 rounded-full bg-white/20 text-sm font-semibold mb-5">
            🎓 منصة تعليمية احترافية
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            ابنِ مهاراتك مع <span className="text-amber-300">أفضل</span> المدربين
          </h1>
          <p className="mt-5 text-lg text-indigo-100">
            آلاف الكورسات في البرمجة والتصميم والتسويق. ابدأ رحلتك اليوم!
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/courses" className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50">
              استعرض الكورسات
            </Link>
            <Link to="/register" className="px-6 py-3 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">التصنيفات</h2>
          <p className="text-slate-500 mb-8">اختار المجال اللي يناسبك</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat._id}
                to={`/courses?category=${cat._id}`}
                className="card p-5 text-center hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-3">{cat.icon || '📚'}</div>
                <h3 className="font-bold text-slate-900">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">الكورسات المميزة</h2>
            <p className="text-slate-500 mt-2">أحدث الكورسات على المنصة</p>
          </div>
          <Link to="/courses" className="btn-outline">عرض الكل</Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : courses.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            لا توجد كورسات منشورة حالياً
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c => <CourseCard key={c._id} course={c} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;