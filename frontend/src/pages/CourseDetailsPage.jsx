import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const placeholder = 'https://placehold.co/800x450/e2e8f0/334155?text=Course';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, reviewsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/reviews/course/${id}`)
      ]);
      setData(courseRes.data.data);
      setReviews(reviewsRes.data.data || []);
    } catch (error) {
      toast.error('فشل تحميل الكورس');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setEnrolling(true);
      const course = data.course;
      const endpoint = (course.isFree || course.price === 0)
        ? `/enrollments/enroll-free/${course._id}`
        : `/enrollments/enroll-paid/${course._id}`;

      await api.post(endpoint);
      toast.success('تم الاشتراك بنجاح! 🎉');
      navigate('/my-learning');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'فشل الاشتراك');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data?.course) return <div className="container-app py-20 text-center">الكورس غير موجود</div>;

  const { course, lessons } = data;
  const finalPrice = course.discountPrice > 0 ? course.discountPrice : course.price;
  const image = course.thumbnail?.startsWith('http') ? course.thumbnail : placeholder;
  const inst = course.instructor;

  return (
    <div className="container-app py-8">
      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-8">
        <div>
          <img src={image} alt={course.title} className="w-full h-[380px] rounded-3xl object-cover" />

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="badge bg-indigo-100 text-indigo-700">{course.level}</span>
              <span className="badge bg-emerald-100 text-emerald-700">{course.language}</span>
              <span className="text-sm text-slate-500">⭐ {course.averageRating} ({course.totalReviews} تقييم)</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
            <p className="mt-4 text-slate-600 leading-8">{course.description}</p>

            {course.whatYouWillLearn?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-900">ماذا ستتعلم؟</h2>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  {course.whatYouWillLearn.map((i, idx) => (
                    <div key={idx} className="card p-4 text-sm">✅ {i}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">محتوى الكورس ({lessons.length} درس)</h2>
              <div className="space-y-3">
                {lessons.map((l, i) => (
                  <div key={l._id} className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{l.title}</p>
                        <p className="text-xs text-slate-500">{l.section}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {l.isFreePreview && <span className="badge bg-emerald-100 text-emerald-700">معاينة</span>}
                      <span className="text-sm text-slate-500">{l.duration} د</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">التقييمات</h2>
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="card p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{r.student?.firstName} {r.student?.lastName}</h3>
                        <span className="text-amber-500">{'⭐'.repeat(r.rating)}</span>
                      </div>
                      <p className="mt-3 text-slate-600 text-sm">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="h-fit sticky top-20">
          <div className="card p-6">
            <p className="text-sm text-slate-500">السعر</p>
            <div className="mt-2">
              {course.discountPrice > 0 && (
                <span className="text-lg text-slate-400 line-through ml-2">${course.price}</span>
              )}
              <span className="text-3xl font-extrabold text-indigo-700">
                {finalPrice === 0 ? 'مجاني' : `$${finalPrice}`}
              </span>
            </div>

            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn-primary w-full mt-6"
            >
              {enrolling ? 'جاري التنفيذ...' : finalPrice === 0 ? 'اشترك مجاناً' : 'اشترِ الآن'}
            </button>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p>• وصول كامل مدى الحياة</p>
              <p>• {lessons.length} درس تعليمي</p>
              <p>• شهادة إتمام</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetailsPage;