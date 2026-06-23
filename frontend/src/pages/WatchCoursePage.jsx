import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const WatchCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [enrolled, setEnrolled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/lessons/course/${courseId}`)
      ]);

      setCourse(courseRes.data.data.course);
      setLessons(lessonsRes.data.data || []);
      setProgress(lessonsRes.data.progress || 0);
      setCompletedLessons(lessonsRes.data.completedLessons || []);
      setEnrolled(lessonsRes.data.enrolled !== false);
    } catch (error) {
      toast.error('تعذر تحميل الدروس');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    if (!enrolled || !lessons[activeIdx]) return;
    try {
      const res = await api.put(`/lessons/${lessons[activeIdx]._id}/complete`, { courseId });
      setProgress(res.data.data.progress);
      if (!completedLessons.includes(lessons[activeIdx]._id)) {
        setCompletedLessons([...completedLessons, lessons[activeIdx]._id]);
      }
      toast.success(res.data.message);
    } catch (error) {
      toast.error('فشل حفظ التقدم');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!course) return <div className="container-app py-20 text-center">الكورس غير موجود</div>;

  const activeLesson = lessons[activeIdx];

  const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));
  const getYouTubeEmbed = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) 380px', minHeight: '100vh' }} className="watch-grid">
        {/* Video Section */}
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', marginBottom: '8px' }}
              >
                ← العودة للكورس
              </button>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{course.title}</h1>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px' }}>التقدم: {progress}%</p>
            </div>
            {enrolled && activeLesson && (
              <button
                onClick={markComplete}
                style={{ background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
              >
                إنهاء هذا الدرس ✅
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div style={{ height: '6px', borderRadius: '4px', background: '#334155', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#6366f1', width: `${progress}%`, transition: 'width 0.5s' }} />
          </div>

          {/* Video Player */}
          <div style={{ background: 'black', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeLesson?.videoUrl ? (
              isYouTube(activeLesson.videoUrl) ? (
                <iframe
                  key={activeLesson._id}
                  src={getYouTubeEmbed(activeLesson.videoUrl)}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={activeLesson._id}
                  src={activeLesson.videoUrl}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎬</div>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{activeLesson?.title || 'اختار درس من القائمة'}</p>
                <p style={{ marginTop: '8px' }}>لا يوجد فيديو لهذا الدرس</p>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          {activeLesson && (
            <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', marginTop: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>{activeLesson.title}</h2>
              {activeLesson.section && (
                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>📁 {activeLesson.section}</p>
              )}
              {activeLesson.description && (
                <p style={{ color: '#cbd5e1', marginTop: '16px', lineHeight: '1.8' }}>{activeLesson.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Lessons List */}
        <aside style={{ background: '#1e293b', borderLeft: '1px solid #334155', padding: '24px', overflowY: 'auto', maxHeight: '100vh', position: 'sticky', top: 0 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>محتوى الكورس</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>{lessons.length} درس</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lessons.map((lesson, i) => {
              const isCompleted = completedLessons.includes(lesson._id);
              const isActive = i === activeIdx;
              const canWatch = enrolled || lesson.isFreePreview;

              return (
                <button
                  key={lesson._id}
                  onClick={() => canWatch && setActiveIdx(i)}
                  disabled={!canWatch}
                  style={{
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : '#0f172a',
                    border: isActive ? '1px solid #6366f1' : '1px solid #334155',
                    borderRadius: '12px',
                    padding: '14px',
                    textAlign: 'right',
                    cursor: canWatch ? 'pointer' : 'not-allowed',
                    opacity: canWatch ? 1 : 0.5,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isCompleted ? '#10b981' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {isCompleted ? '✓' : i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lesson.title}
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {lesson.duration} د
                      {lesson.isFreePreview && <span style={{ color: '#10b981', marginRight: '8px' }}>• مجاني</span>}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .watch-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WatchCoursePage;