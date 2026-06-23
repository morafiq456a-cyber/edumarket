import { Link } from 'react-router-dom';

const placeholder = 'https://placehold.co/600x400/e2e8f0/334155?text=Course';

const CourseCard = ({ course }) => {
  const finalPrice = course.discountPrice > 0 ? course.discountPrice : course.price;
  const image = course.thumbnail?.startsWith('http') ? course.thumbnail : placeholder;
  const inst = course.instructor;

  return (
    <Link to={`/courses/${course._id}`} className="card overflow-hidden hover:shadow-md transition block">
      <img
        src={image}
        alt={course.title}
        className="h-48 w-full object-cover"
        onError={(e) => e.target.src = placeholder}
      />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="badge bg-indigo-100 text-indigo-700">{course.level || 'جميع المستويات'}</span>
          <span className="text-sm text-slate-500">⭐ {course.averageRating || 0}</span>
        </div>
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.shortDescription || course.description}</p>
        <p className="mt-3 text-sm text-slate-500">بواسطة {inst?.firstName} {inst?.lastName}</p>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div>
            {course.discountPrice > 0 && (
              <span className="text-sm text-slate-400 line-through ml-2">${course.price}</span>
            )}
            <span className="text-lg font-bold text-indigo-700">
              {finalPrice === 0 ? 'مجاني' : `$${finalPrice}`}
            </span>
          </div>
          <span className="text-sm font-semibold text-indigo-600">عرض ←</span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;