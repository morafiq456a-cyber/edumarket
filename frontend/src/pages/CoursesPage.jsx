import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    sort: searchParams.get('sort') || ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.level) params.level = filters.level;
      if (filters.sort) params.sort = filters.sort;

      const res = await api.get('/courses', { params });
      setCourses(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="container-app py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">كل الكورسات</h1>
        <p className="mt-2 text-slate-500">{courses.length} كورس متاح</p>
      </div>

      <div className="card grid md:grid-cols-4 gap-4 p-5">
        <input
          type="text"
          placeholder="ابحث عن كورس..."
          className="input"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        <select
          className="select"
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">كل التصنيفات</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          className="select"
          value={filters.level}
          onChange={(e) => updateFilter('level', e.target.value)}
        >
          <option value="">كل المستويات</option>
          <option value="مبتدئ">مبتدئ</option>
          <option value="متوسط">متوسط</option>
          <option value="متقدم">متقدم</option>
        </select>
        <select
          className="select"
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          <option value="">ترتيب افتراضي</option>
          <option value="popular">الأكثر شعبية</option>
          <option value="rating">الأعلى تقييماً</option>
          <option value="price-low">السعر: الأقل</option>
          <option value="price-high">السعر: الأعلى</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">لا توجد نتائج</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => <CourseCard key={c._id} course={c} />)}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;