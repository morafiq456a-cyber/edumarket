import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const placeholder = 'https://placehold.co/600x400/e2e8f0/334155?text=Course';

const MyLearningPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/enrollments/my-courses');
      setEnrollments(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-app py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">كورساتي</h1>
        <p className="mt-2 text-slate-500">{enrollments.length} كورس مشترك</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-bold">لم تشترك في أي كورس بعد</h2>
          <Link to="/courses" className="btn-primary mt-5 inline-flex">استعرض الكورسات</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {enrollments.map(e => {
            const course = e.course;
            if (!course) return null;
            const image = course.thumbnail?.startsWith('http') ? course.thumbnail : placeholder;

            return (
              <div key={e._id} className="card grid md:grid-cols-[220px_1fr] gap-5 p-5">
                <img src={image} className="h-44 w-full rounded-2xl object-cover" />
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{course.title}</h2>
                    {e.isCompleted && <span className="badge bg-emerald-100 text-emerald-700">✅ مكتمل</span>}
                  </div>
                  <p className="mt-2 text-slate-500">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-500">التقدم</span>
                      <span className="font-semibold">{e.progress}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${e.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${e.progress}%`, transition: 'width 0.5s' }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Link to={`/courses/${course._id}`} className="btn-outline">تفاصيل</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLearningPage;