import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Complaints from './pages/Complaints';
import NewComplaint from './pages/NewComplaint';
import Login from './pages/Login';
import './assets/styles/global.css';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import CollaboratorDashboard from './pages/CollaboratorDashboard';

// Composant de protection de route
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && (!user || user.role !== requiredRole)) return <Navigate to="/home" replace />;
  return children;
};

// Composant 404
const NotFound = () => {
  return (
    <div className="not-found">
      <h2>404 - Page non trouvée</h2>
      <p>La page que vous cherchez n'existe pas.</p>
    </div>
  );
};

// Wrapper to conditionally show/hide Navbar
const AppContent = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/signup', '/admin', '/collaborator'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main className="container">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Admin route */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Collaborator route */}
          <Route path="/collaborator" element={
            <ProtectedRoute requiredRole="collaborator">
              <CollaboratorDashboard />
            </ProtectedRoute>
          } />

          {/* Routes protégées */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/complaints" 
            element={
              <ProtectedRoute>
                <Complaints />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/complaints/new" 
            element={
              <ProtectedRoute>
                <NewComplaint />
              </ProtectedRoute>
            } 
          />


          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear authentication data when user closes the browser/tab
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    };

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
