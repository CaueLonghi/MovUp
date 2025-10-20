import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProgressSpinner } from 'primereact/progressspinner';
import logoLoading from '../assets/movup_loading.png'

// Lazy load pages for better performance
const Home = lazy(() => import('../pages/Home'));
const Video = lazy(() => import('../pages/Video'));
const Profile = lazy(() => import('../pages/Profile'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const RecordingPage = lazy(() => import('../pages/RecordingPage'));
const ReportPage = lazy(() => import('../pages/ReportPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-yellow-400 flex align-items-center justify-content-center loading-page">
    <div className="text-center flex flex-column justify-content-center align-items-center ">
      <img src={logoLoading} style={{width: '50%'}} className='mb-2' />
      <ProgressSpinner style={{ width: '50px', height: '50px', stroke: 'black' }} strokeWidth="5" />
    </div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/video" element={
          <ProtectedRoute>
            <Video />
          </ProtectedRoute>
        } />
        <Route path="/recording" element={
          <ProtectedRoute>
            <RecordingPage />
          </ProtectedRoute>
        } />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
