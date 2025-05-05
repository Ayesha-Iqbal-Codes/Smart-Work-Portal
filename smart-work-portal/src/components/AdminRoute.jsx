import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  // If user is not logged in or not an admin, redirect
  if (!userData || userData.role !== 'admin') {
    return <Navigate to="/intern-dashboard" replace />;  // Redirect to intern dashboard or login page
  }

  return children; // If user is admin, render the protected route (Admin Dashboard)
};

export default AdminRoute;
