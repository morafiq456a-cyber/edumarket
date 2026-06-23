import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyLearningPage from './pages/MyLearningPage';
import ProfilePage from './pages/ProfilePage';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WatchCoursePage from './pages/WatchCoursePage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/my-learning" element={
            <ProtectedRoute><MyLearningPage /></ProtectedRoute>
          } />
          <Route path="/learn/:courseId" element={
            <ProtectedRoute><WatchCoursePage /></ProtectedRoute>
          } />
          <Route path="/instructor" element={
            <ProtectedRoute roles={['instructor', 'admin']}><InstructorDashboard /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={
            <div className="container-app py-20 text-center">
              <h1 className="text-6xl font-bold">404</h1>
              <p className="mt-4 text-slate-500">الصفحة غير موجودة</p>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;