import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900">EduMarket</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'}>
            الرئيسية
          </NavLink>
          <NavLink to="/courses" className={({ isActive }) => isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'}>
            الكورسات
          </NavLink>
          {user?.role === 'student' && (
            <NavLink to="/my-learning" className={({ isActive }) => isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'}>
              كورساتي
            </NavLink>
          )}
          {user?.role === 'instructor' && (
            <NavLink to="/instructor" className={({ isActive }) => isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'}>
              لوحة المدرب
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'}>
              لوحة الإدارة
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" className="btn-outline">دخول</Link>
              <Link to="/register" className="btn-primary">ابدأ الآن</Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                  {user.firstName?.[0] || 'U'}
                </div>
                <span className="hidden md:block text-sm font-semibold">{user.firstName}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-2xl border bg-white p-2 shadow-lg">
                    <div className="border-b px-3 py-2 mb-2">
                      <p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <User className="h-4 w-4" />
                      الملف الشخصي
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;